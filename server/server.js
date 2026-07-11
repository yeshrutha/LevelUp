import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

import { NotificationService, pushLogs } from './notificationService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Reflect the request origin back to support credentials safely in non-production environments
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// In-memory fallback database for multi-user isolation
let localDB = {};

const createUserProfile = (email, name = '') => ({
  displayName: name || email.split('@')[0],
  email,
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(name || email.split('@')[0]),
  xp: 0,
  level: 1,
  rank: 'Iron I',
  streak: 0,
  readiness: 0,
  createdDate: new Date().toISOString(),
  themeMode: 'light',
  isMuted: false,
  unlockedAchievements: [],
  emailVerified: true,
  phoneVerified: false,
  phoneNumber: '',
  tasks: [],
  roadmaps: [],
  habits: {},
  achievements: []
});

const getOrInitUser = (email, name = '') => {
  const key = (email || 'anonymous').toLowerCase().trim();
  if (!localDB[key]) {
    localDB[key] = {
      email: key,
      passwordHash: null,
      profile: createUserProfile(key, name),
      habitList: [],
      customPages: [],
      calendar: [],
      goal: { title: '', targetDate: '' },
      pushSubscriptions: []
    };
  }
  return localDB[key];
};

// MongoDB connection with fallback
const mongoURI = process.env.MONGODB_URI;
let isConnectedToMongo = false;

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('Connected to MongoDB successfully.');
      isConnectedToMongo = true;
    })
    .catch((err) => {
      console.error('MongoDB connection error. Falling back to memory database:', err.message);
    });
} else {
  console.log('No MONGODB_URI provided. Running server in memory database mode.');
}

// Schemas & Models
const PushSubscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  },
  createdAt: { type: Date, default: Date.now }
});

const UserDataSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String, select: false },
  phoneNumber: { type: String, default: '' },
  emailVerified: { type: Boolean, default: true },
  phoneVerified: { type: Boolean, default: false },
  profile: { type: Object, default: {} },
  habits: { type: Object, default: {} },
  habitList: { type: Array, default: [] },
  customPages: { type: Array, default: [] },
  calendar: { type: Array, default: [] },
  goal: { type: Object, default: {} },
  pushSubscriptions: [PushSubscriptionSchema],
  updatedAt: { type: Date, default: Date.now }
});

const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema);

const createToken = (user) => jwt.sign(
  { uid: user.email, email: user.email },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

const buildUserPayload = (userData) => ({
  profile: {
    ...(userData.profile || {}),
    email: userData.email
  },
  habits: userData.habits,
  habitList: userData.habitList,
  customPages: userData.customPages,
  calendar: userData.calendar,
  goal: userData.goal,
  updatedAt: userData.updatedAt
});

const authMiddleware = async (req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/ai') || req.path.startsWith('/api/system')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  // Support both JWT verification and simple email token fallback for multi-account compatibility
  if (token.includes('@')) {
    req.user = { uid: token, email: token };
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { uid: payload.uid, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.use(authMiddleware);

// --- API ROUTES ---

// GET Full User Profile & Telemetry Data
app.get('/api/profile/full', async (req, res) => {
  try {
    let userVal = null;
    if (isConnectedToMongo) {
      userVal = await UserData.findOne({ email: req.user.email });
    } else {
      userVal = localDB[req.user.email.toLowerCase()];
    }

    if (!userVal) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(buildUserPayload(userVal));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET Profile
app.get('/api/profile', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      let data = await UserData.findOne({ email: req.user.email });
      if (!data) {
        const profile = createUserProfile(req.user.email);
        data = await UserData.create({
          email: req.user.email,
          phoneNumber: '',
          emailVerified: false,
          phoneVerified: false,
          profile
        });
      }
      return res.json({
        ...(data.profile || {}),
        email: data.email
      });
    } else {
      const user = getOrInitUser(req.user.email);
      return res.json({
        ...(user.profile || {}),
        email: req.user.email
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cache for debugging profile syncs
export const lastProfileSyncs = [];

// POST Profile Sync
app.post('/api/profile/sync', async (req, res) => {
  try {
    const profile = req.body;
    lastProfileSyncs.push({
      time: new Date().toISOString(),
      email: req.user?.email,
      payload: profile
    });
    if (lastProfileSyncs.length > 50) lastProfileSyncs.shift();

    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { 
          $set: { 
            profile, 
            phoneNumber: profile.phoneNumber || '',
            emailVerified: !!profile.emailVerified,
            phoneVerified: !!profile.phoneVerified,
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      const profile = req.body;
      const user = getOrInitUser(req.user.email);
      user.profile = profile;
      user.phoneNumber = profile.phoneNumber || '';
      user.emailVerified = !!profile.emailVerified;
      user.phoneVerified = !!profile.phoneVerified;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Custom Pages
app.get('/api/custom-pages', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json({ customPages: data ? data.customPages : [] });
    } else {
      return res.json({ customPages: getOrInitUser(req.user.email).customPages });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Custom Pages Sync
app.post('/api/custom-pages', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { customPages: req.body.customPages, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).customPages = req.body.customPages;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Habits Log
app.get('/api/habits', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json({ habits: data ? data.habits : {} });
    } else {
      return res.json({ habits: getOrInitUser(req.user.email).habits });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Habits Log Sync
app.post('/api/habits', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { habits: req.body.habits, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).habits = req.body.habits;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Habits List
app.get('/api/habits/list', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json({ habitList: data ? data.habitList : [] });
    } else {
      return res.json({ habitList: getOrInitUser(req.user.email).habitList });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Habits List Sync
app.post('/api/habits/list', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { habitList: req.body.habitList, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).habitList = req.body.habitList;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Calendar logs
app.get('/api/calendar', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json({ calendar: data ? data.calendar : [] });
    } else {
      return res.json({ calendar: getOrInitUser(req.user.email).calendar });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Calendar Sync
app.post('/api/calendar', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { calendar: req.body.calendar, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).calendar = req.body.calendar;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Target Goal
app.get('/api/goal', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json(data ? data.goal : { title: '', targetDate: '' });
    } else {
      return res.json(getOrInitUser(req.user.email).goal);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Target Goal Sync
app.post('/api/goal', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { goal: req.body, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).goal = req.body;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Authentication Routes ---
// --- Authentication Routes ---
app.post('/api/auth/set-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and a password of at least 8 characters are required.' });
  }

  const targetEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isConnectedToMongo) {
      user = await UserData.findOne({ email: targetEmail });
    } else {
      user = localDB[targetEmail];
    }

    if (user && user.passwordHash) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    // Save password hash
    const passwordHash = await bcrypt.hash(password, 12);

    if (!user) {
      // Create user and profile directly
      const profile = createUserProfile(targetEmail);
      profile.isProfileSetupComplete = false;
      profile.emailVerified = true; // Instant verification
      
      const newUserData = {
        email: targetEmail,
        passwordHash,
        phoneNumber: '',
        emailVerified: true,
        phoneVerified: false,
        profile,
        habitList: [],
        customPages: [],
        calendar: [],
        goal: { title: '', targetDate: '' },
        pushSubscriptions: []
      };

      if (isConnectedToMongo) {
        user = await UserData.create(newUserData);
      } else {
        localDB[targetEmail] = newUserData;
        user = localDB[targetEmail];
      }
    } else {
      // Update stub user credentials
      user.passwordHash = passwordHash;
      user.emailVerified = true;
      if (!user.profile) user.profile = createUserProfile(targetEmail);
      user.profile.emailVerified = true;
      if (isConnectedToMongo) {
        user.markModified('profile');
        await user.save();
      }
    }

    // Generate login token
    const token = createToken(user);

    return res.json({ success: true, token, ...buildUserPayload(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


app.post('/api/auth/password-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const identifier = email.trim();
  const isEmailInput = identifier.includes('@');
  const targetEmail = identifier.toLowerCase();

  try {
    let user = null;
    if (isConnectedToMongo) {
      if (isEmailInput) {
        user = await UserData.findOne({ email: targetEmail }).select('+passwordHash');
      } else {
        user = await UserData.findOne({ "profile.displayName": { $regex: new RegExp(`^${identifier}$`, 'i') } }).select('+passwordHash');
      }
    } else {
      if (isEmailInput) {
        user = localDB[targetEmail];
      } else {
        user = Object.values(localDB).find(u => u.profile?.displayName?.toLowerCase() === targetEmail);
      }
    }

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createToken(user);
    return res.json({ success: true, token, ...buildUserPayload(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Rate limiting state & middleware
const authRateLimit = {};
const authRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!authRateLimit[ip]) {
    authRateLimit[ip] = [];
  }
  authRateLimit[ip] = authRateLimit[ip].filter(timestamp => now - timestamp < 60000);
  if (authRateLimit[ip].length >= 10) { // Max 10 attempts per minute
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }
  authRateLimit[ip].push(now);
  next();
};

// POST Google OAuth Fallback
app.post('/api/auth/google', authRateLimiter, async (req, res) => {
  const { email, displayName, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google authentication.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (isConnectedToMongo) {
      let existing = await UserData.findOne({ email: normalizedEmail });
      if (!existing) {
        const profile = createUserProfile(normalizedEmail, displayName || normalizedEmail.split('@')[0]);
        if (avatar) profile.avatar = avatar;
        profile.emailVerified = true; // Google accounts are pre-verified

        existing = await UserData.create({
          email: normalizedEmail,
          phoneNumber: '',
          emailVerified: true,
          phoneVerified: false,
          profile,
          habitList: [],
          customPages: [],
          calendar: [],
          goal: { title: '', targetDate: '' }
        });
      } else {
        // Ensure emailVerified is true
        if (!existing.profile) existing.profile = {};
        existing.profile.emailVerified = true;
        existing.emailVerified = true;
        existing.markModified('profile');
        await existing.save();
      }

      const token = createToken(existing);
      return res.json({ token, ...buildUserPayload(existing) });
    }

    // LocalDB Fallback
    let existing = localDB[normalizedEmail];
    if (!existing) {
      existing = getOrInitUser(normalizedEmail, displayName || normalizedEmail.split('@')[0]);
      if (avatar) existing.profile.avatar = avatar;
    }
    existing.profile.emailVerified = true;
    const token = createToken(existing);
    return res.json({ token, ...buildUserPayload(existing) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST Verify Password (for dangerous operations confirmation)
app.post('/api/auth/verify-password', authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isConnectedToMongo) {
      user = await UserData.findOne({ email: normalizedEmail }).select('+passwordHash');
    } else {
      user = localDB[normalizedEmail];
    }

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST Submit Support Ticket
app.post('/api/support/ticket', async (req, res) => {
  const { email, displayName, message } = req.body;
  if (!email || !displayName || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    console.log(`🎟️ Support Ticket Acknowledged from ${displayName} (${email}): ${message}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST Dispatch Webhook Notifications to Slack & Discord
app.post('/api/integrations/notify', async (req, res) => {
  const { event, title, body } = req.body;
  const userEmail = req.headers.authorization?.replace('Bearer ', '');
  if (!userEmail) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await UserData.findOne({ email: userEmail.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User telemetry record not found.' });

    const integrations = user.profile?.settings?.integrations || {};
    const discordUrl = user.profile?.settings?.discordUrl;
    const slackUrl = user.profile?.settings?.slackUrl;

    // Discord Webhook Dispatch
    if (discordUrl && integrations.discord === true) {
      try {
        await fetch(discordUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `🏆 LevelUp: ${title}`,
              description: body,
              color: event === 'rank_up' ? 11027199 : 3447003,
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (err) {
        console.error('❌ Discord Webhook: Error sending payload:', err.message);
      }
    }

    // Slack Webhook Dispatch
    if (slackUrl && integrations.slack === true) {
      try {
        await fetch(slackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🏆 *LevelUp:* ${title}\n> ${body}`
          })
        });
      } catch (err) {
        console.error('❌ Slack Webhook: Error sending payload:', err.message);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Integrations Notify Router: Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// --- AI Assistant Integration (NVIDIA AI with Gemini Fallback) ---
const callAI = async (systemInstruction, userPrompt, jsonMode = false) => {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (nvidiaKey) {
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nvidiaKey}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        response_format: jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA AI API Response: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response content received from NVIDIA AI.');
    }
    return text;
  } else if (geminiKey) {
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: jsonMode ? {
          responseMimeType: 'application/json'
        } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Response: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Received empty response payload from Gemini API.');
    }
    return text;
  } else {
    throw new Error('AI Provider Configuration Error: Neither NVIDIA_API_KEY nor GEMINI_API_KEY is configured in your .env file.');
  }
};

const callGemini = callAI;

// AI Coach Response Generator Endpoint
app.post('/api/ai/coach', async (req, res) => {
  const { message, stats, email, displayName } = req.body;
  const userEmail = req.user?.email || email || 'User';

  let aiPersonality = 'Friendly Coach';
  let responseLength = 'Short';

  try {
    const user = await UserData.findOne({ email: userEmail.toLowerCase() });
    if (user && user.profile?.settings) {
      aiPersonality = user.profile.settings.aiPersonality || 'Friendly Coach';
      responseLength = user.profile.settings.responseLength || 'Short';
    }
  } catch (dbErr) {
    console.warn('⚠️ AI Coach Router: User settings fetch failed, using defaults.', dbErr.message);
  }

  // Determine personality system instructions
  let personalityPrompt = 'Be warm, supportive, but disciplined.';
  if (aiPersonality === 'Strict Coach') {
    personalityPrompt = 'Adopt the persona of a tough, strict, direct, and no-excuses coach. Be authoritative and hold the user to high standards.';
  } else if (aiPersonality === 'Mentor') {
    personalityPrompt = 'Adopt the persona of a wise, experienced mentor. Provide thoughtful, strategic, calm, and career-oriented advice.';
  }

  // Determine response length system instructions
  let lengthPrompt = 'strictly under 3 sentences';
  if (responseLength === 'Short') {
    lengthPrompt = 'extremely brief (strictly 1 or 2 sentences)';
  } else if (responseLength === 'Detailed') {
    lengthPrompt = 'detailed, comprehensive, and structured (around 4-6 sentences)';
  }

  const systemInstruction = `
    You are the "LevelUp AI Coach", a strategic, motivational advisor in a Habit Mastery Terminal workspace.
    The user is attempting to build productive habits, keep up day streaks, and complete custom timelines.
    ${personalityPrompt}
    Provide constructive, direct, action-oriented suggestions. Keep your response ${lengthPrompt}.
    Active user metrics: readiness completion index: ${stats?.readiness || 0}%, active streak: ${stats?.streak || 0} days, user email: ${userEmail}.
    Always encourage consistency.
  `;

  try {
    if (process.env.GEMINI_API_KEY) {
      const reply = await callGemini(systemInstruction, message || 'Hello');
      return res.json({ reply: reply.trim() });
    }
  } catch (err) {
    console.error('⚠️ Gemini AI Coach Error:', err.message);
  }

  // Fallback if Gemini is not set up or fails
  let reply = "I am analyzing your Habit Mastery details. Completing custom workspace pages, checkmarks in the calendar, and daily habits is the fastest way to increase your readiness index.";
  
  if (message) {
    const pLower = message.toLowerCase();
    if (pLower.includes('dsa') || pLower.includes('leet') || pLower.includes('code')) {
      reply = "Keep solving challenges sequentially. Focus on recognizing pattern families (two-pointers, sliding window, backtracking) instead of dry memorization.";
    } else if (pLower.includes('habit') || pLower.includes('streak')) {
      reply = `Streaks generate compound momentum! Maintaining a ${stats?.streak || 0}-day habit checkoff rate creates massive discipline. Don't break the chain.`;
    } else if (pLower.includes('project') || pLower.includes('milestone')) {
      reply = "When defining custom milestones, scope them into small, modular checklist items. Fast verification prevents study fatigue!";
    } else {
      const readiness = stats?.readiness || 0;
      if (readiness < 40) {
        reply = `You are currently at ${readiness}% completion readiness. Let's raise the momentum! Complete your daily habit goals and Notion tasks to gain quick XP and level up.`;
      } else if (readiness < 70) {
        reply = `Solid baseline progress! At ${readiness}% readiness, focus on establishing a 5-day habit streak to lift your tier rank toward Gold and Platinum.`;
      } else {
        reply = `Outstanding execution! At ${readiness}% readiness, you are in the elite tier. Elevate your targets by designing more advanced milestones!`;
      }
    }
  }
  return res.json({ reply });
});

// Notion-style AI Checklist Schedule Generator
app.post('/api/ai/notion', async (req, res) => {
  const { prompt, termDays } = req.body;
  const daysCount = parseInt(termDays) || 5;

  const systemInstruction = `
    You are the "LevelUp Timeline Generator" assistant.
    The user wants to generate a structured timeline schedule for the prompt: "${prompt}" spanning exactly ${daysCount} days.
    You must return a JSON object with a "tasks" key containing an array of objects.
    Each task object must have:
      - "id": a unique string (e.g., "nt_1", "nt_2", etc.)
      - "text": the description of the task for that day (be actionable, descriptive)
      - "day": the integer day number (from 1 to ${daysCount})
    Generate exactly 3 progressive tasks per day.
    Ensure tasks are progressive and tailored specifically to the user prompt.
    Output format:
    {
      "tasks": [
        { "id": "nt_1", "text": "Task text for Day 1", "day": 1 },
        { "id": "nt_2", "text": "Another task for Day 1", "day": 1 },
        { "id": "nt_3", "text": "Task text for Day 2", "day": 2 }
      ]
    }
  `;

  try {
    if (process.env.GEMINI_API_KEY) {
      const responseText = await callGemini(systemInstruction, `Generate progressive tasks for ${daysCount} days matching the prompt: "${prompt}"`, true);
      const parsed = JSON.parse(responseText);
      if (parsed && Array.isArray(parsed.tasks)) {
        return res.json({ tasks: parsed.tasks });
      }
    }
  } catch (err) {
    console.error('⚠️ Gemini Task Generator Error:', err.message);
  }

  // Fallback if Gemini is not set up or fails
  const pLower = (prompt || '').toLowerCase();
  const generatedTasks = [];
  let templates = [
    (d) => `Define daily objectives and review habit logs for Day ${d}`,
    (d) => `Spend 30 minutes executing routine task priorities for Day ${d}`,
    (d) => `Verify task completion and audit progress log for Day ${d}`
  ];

  if (pLower.includes('dsa') || pLower.includes('algorithm') || pLower.includes('leetcode') || pLower.includes('code')) {
    templates = [
      (d) => `Day ${d}: Study core data structures (Arrays/Strings/Recursion)`,
      (d) => `Day ${d}: Solve 1 algorithmic optimization challenge on LeetCode`,
      (d) => `Day ${d}: Code complexity test cases (space & time bounds)`
    ];
  } else if (pLower.includes('react') || pLower.includes('web') || pLower.includes('js') || pLower.includes('frontend') || pLower.includes('html') || pLower.includes('css')) {
    templates = [
      (d) => `Day ${d}: Build reusable functional components & hook structures`,
      (d) => `Day ${d}: Set up layout styling grids and interactive states`,
      (d) => `Day ${d}: Test API endpoint routing and state synchronization`
    ];
  } else if (pLower.includes('fit') || pLower.includes('gym') || pLower.includes('health') || pLower.includes('run') || pLower.includes('workout') || pLower.includes('sport')) {
    templates = [
      (d) => `Day ${d}: Execute 15-minute dynamic muscle flexibility exercises`,
      (d) => `Day ${d}: Complete cardiovascular stamina training & hydration check`,
      (d) => `Day ${d}: Log active physical recovery stats and sleep schedules`
    ];
  } else if (pLower.includes('read') || pLower.includes('book') || pLower.includes('learn') || pLower.includes('english')) {
    templates = [
      (d) => `Day ${d}: Read 15 pages of literature and highlight key definitions`,
      (d) => `Day ${d}: Summarize learnings into an active recall review deck`,
      (d) => `Day ${d}: Teach the core concept to a peer or write a review log`
    ];
  }

  let taskCounter = 1;
  for (let d = 1; d <= daysCount; d++) {
    templates.forEach((templateFn) => {
      generatedTasks.push({
        id: `nt_${Date.now()}_${taskCounter++}`,
        text: templateFn(d),
        day: d
      });
    });
  }

  return res.json({ tasks: generatedTasks });
});

// AI Planner Dashboard Orchestrator Generator
app.post('/api/ai/planner', async (req, res) => {
  const { prompt } = req.body;
  
  const systemInstruction = `
    You are the "LevelUp AI Planner Orchestrator", an advanced assistant in the Habit Mastery Terminal.
    Your task is to analyze the user's detailed schedule request, career goals, routine, and targets, and generate habit checklist items and calendar events in English.
    You must output a JSON object with the following structure:
    {
      "habits": [
        // list of habits to add to the habit tracker (e.g., "Wake Up: 6:15 AM", "Revision Study Session", "Exercise at Gym", "Drink 3L Water", "Solve 1 LeetCode", "Valorant (Max 2 Games)")
        // generate up to 8 recurring habits matching their daily schedule details and learning goals
      ],
      "calendarEvents": [
        // list of up to 4 key milestones or daily study targets to add to the calendar
        // date format must be YYYY-MM-DD. Since today's year is 2026, schedule them in July/August/September 2026.
        { "title": "Milestone title", "date": "2026-07-15", "type": "Goal", "time": "10:00 AM" }
      ],
      "notifications": [
        // list of up to 3 welcome notifications/reminders
        { "title": "Planner Synchronized", "body": "Custom notification message", "type": "system" }
      ]
    }
    
    Ensure all descriptions are in English, clear, and actionable.
    You must return ONLY the raw JSON structure, matching the JSON schema precisely.
  `;

  try {
    if (process.env.GEMINI_API_KEY) {
      const responseText = await callGemini(systemInstruction, `Generate habits and calendar events for the prompt: "${prompt}"`, true);
      const parsed = JSON.parse(responseText);
      if (parsed) {
        return res.json(parsed);
      }
    }
  } catch (err) {
    console.error('⚠️ Gemini Planner Error:', err.message);
  }

  // Fallback config if Gemini fails or is not setup
  return res.json({
    habits: ["Wake Up: 6:15 AM", "Revision Study Session", "Exercise at Gym", "Drink 3L Water", "Solve 1 LeetCode", "Valorant (Max 2 Games)"],
    calendarEvents: [
      { title: "Placement Readiness Target", date: "2026-07-20", type: "Goal", time: "09:00 AM" },
      { title: "Project MVP Presentation", date: "2026-07-25", type: "Review", time: "02:00 PM" }
    ],
    notifications: [
      { title: "Planner Synchronized", body: "Your career goals schedule has been integrated successfully.", type: "system" }
    ]
  });
});

// GET VAPID Public Key
app.get('/api/system/vapid-key', (req, res) => {
  return res.json({ publicKey: NotificationService.getPublicKey() });
});

// POST Subscribe to Push Notifications
app.post('/api/notifications/subscribe', async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Subscription object with endpoint is required.' });
  }

  const userEmail = req.user.email;

  try {
    let user = null;
    if (isConnectedToMongo) {
      user = await UserData.findOne({ email: userEmail });
      if (user) {
        // Avoid duplicate subscriptions
        const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!exists) {
          user.pushSubscriptions.push(subscription);
          await user.save();
        }
      }
    } else {
      user = localDB[userEmail];
      if (user) {
        if (!user.pushSubscriptions) user.pushSubscriptions = [];
        const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!exists) {
          user.pushSubscriptions.push(subscription);
        }
      }
    }

    console.log(`🤖 WebPush: Registered push subscription for ${userEmail}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST Send Test Push Notification
app.post('/api/notifications/test-push', async (req, res) => {
  const userEmail = req.user.email;
  try {
    let user = null;
    if (isConnectedToMongo) {
      user = await UserData.findOne({ email: userEmail });
    } else {
      user = localDB[userEmail];
    }

    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return res.status(400).json({ error: 'No active push subscriptions found for this user.' });
    }

    const payload = {
      title: '⚡ LevelUp System Sync',
      body: 'Browser push notification system online and verified!',
      url: '/#dashboard'
    };

    let sentCount = 0;
    const cleanSubscriptions = [];

    for (const sub of user.pushSubscriptions) {
      const resVal = await NotificationService.sendPushNotification(sub, payload);
      if (resVal.success) {
        sentCount++;
        cleanSubscriptions.push(sub);
      } else if (!resVal.expired) {
        cleanSubscriptions.push(sub);
      }
    }

    if (isConnectedToMongo) {
      user.pushSubscriptions = cleanSubscriptions;
      await user.save();
    } else {
      user.pushSubscriptions = cleanSubscriptions;
    }

    return res.json({ success: true, sentCount, totalSubscriptions: cleanSubscriptions.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// System Diagnostics Endpoint
app.get('/api/system/diagnostics', async (req, res) => {
  try {
    const now = new Date();
    const users = isConnectedToMongo ? await UserData.find({}) : Object.values(localDB);
    
    const diagnostics = users.map(u => ({
      email: u.email,
      hasProfile: !!u.profile,
      timezone: u.profile?.timezone || 'Asia/Kolkata',
      habitReminders: u.profile?.habitReminders || {},
      habitList: u.habitList || [],
      pushSubscriptionsCount: u.pushSubscriptions?.length || 0
    }));

    return res.json({
      serverTime: now.toISOString(),
      isConnectedToMongo,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      sentRemindersCache,
      lastProfileSyncs,
      pushLogs,
      websiteUrlConfig: process.env.WEBSITE_URL || 'NOT_SET',
      diagnostics
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Database System Purge Reset Endpoint
app.post('/api/system/reset-db', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.deleteMany({});
      localDB = {};
      console.log('🧹 MongoDB database collection userdatas has been purged.');
      return res.json({ success: true, message: 'Database reset successfully!' });
    } else {
      localDB = {};
      console.log('🧹 In-memory database has been reset.');
      return res.json({ success: true, message: 'In-memory database reset successfully!' });
    }
  } catch (err) {
    console.error('❌ Reset database error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Scheduled Habit Reminders Background Job
const sentRemindersCache = {};

const sendHabitReminders = async () => {
  try {
    let users = [];
    if (isConnectedToMongo) {
      users = await UserData.find({});
    } else {
      users = Object.values(localDB);
    }

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];

    for (const u of users) {
      const profile = u.profile || {};
      const reminders = profile.habitReminders || {};
      const timezone = profile.timezone || 'Asia/Kolkata';

      let userLocalTimeStr = "";
      try {
        userLocalTimeStr = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (err) {
        userLocalTimeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      const parts = userLocalTimeStr.split(':');
      if (parts.length < 2) continue;
      const formattedTime = `${parts[0]}:${parts[1]}`;

      for (const [habitName, reminder] of Object.entries(reminders)) {
        if (reminder && reminder.enabled && reminder.time) {
          // Get local date key for this user
          let userDateStr = dateKey;
          try {
            userDateStr = now.toLocaleDateString('en-CA', { timeZone: timezone });
          } catch (e) {}

          // Check if habit is already completed today
          const isCompleted = !!(u.habits?.[userDateStr]?.[habitName]);
          if (isCompleted) continue; // Skip if checked off!

          // Parse times
          const timeParts = reminder.time.split(':');
          if (timeParts.length < 2) continue;
          const [remHour, remMin] = timeParts.map(Number);
          const [userHour, userMin] = parts.map(Number);

          const reminderMinutes = remHour * 60 + remMin;
          const userMinutes = userHour * 60 + userMin;
          const diffMinutes = userMinutes - reminderMinutes;
          // Send if past the scheduled time, and either we haven't sent any alert today yet OR it's a multiple of 5 minutes later
          const todayPrefix = `${u.email}_${habitName}_${userDateStr}_`;
          const hasSentToday = Object.keys(sentRemindersCache).some(k => k.startsWith(todayPrefix));
          const shouldSend = diffMinutes >= 0 && (!hasSentToday || diffMinutes % 5 === 0);

          if (shouldSend) {
            const cacheKey = `${u.email}_${habitName}_${userDateStr}_${formattedTime}`;
            if (sentRemindersCache[cacheKey]) continue;

            sentRemindersCache[cacheKey] = true;
            const recipient = u.email;
            const displayName = profile.displayName || 'LevelUp User';

            console.log(`⏰ Push Reminder: dispatching to ${recipient} for incomplete: "${habitName}" at ${formattedTime} (Diff: ${diffMinutes}m, First Today: ${!hasSentToday})`);
            
            try {
              const payload = {
                title: '⏰ Habit Reminder',
                body: `It's time to complete your habit: "${habitName}"`,
                url: '/#habits'
              };

              if (u.pushSubscriptions && u.pushSubscriptions.length > 0) {
                const cleanSubscriptions = [];
                for (const sub of u.pushSubscriptions) {
                  const resVal = await NotificationService.sendPushNotification(sub, payload);
                  if (resVal.success || !resVal.expired) {
                    cleanSubscriptions.push(sub);
                  }
                }
                
                // Save updated active subscriptions list
                if (isConnectedToMongo) {
                  await UserData.updateOne({ email: u.email }, { $set: { pushSubscriptions: cleanSubscriptions } });
                } else {
                  u.pushSubscriptions = cleanSubscriptions;
                }
              }
            } catch (pushErr) {
              console.error(`❌ WebPush: Failed to send reminder to ${recipient}:`, pushErr.message);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sending scheduled habit reminders:', err.message);
  }
};

// Check every 30 seconds
setInterval(sendHabitReminders, 30000);

// Self-ping to keep Render instance awake (runs every 10 minutes)
const selfPing = () => {
  fetch('https://levelup-1-7j6v.onrender.com/api/system/diagnostics')
    .then(() => console.log('💓 Self-ping successful: keeping Render instance awake.'))
    .catch((err) => console.warn('⚠️ Self-ping failed:', err.message));
};
setInterval(selfPing, 600000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
