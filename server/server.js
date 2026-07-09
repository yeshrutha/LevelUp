import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465,
      auth: { user, pass }
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✉️ Mailer: Ethereal test SMTP account configured successfully.');
    } catch (err) {
      console.error('❌ Mailer: Failed to initialize ethereal test mailer:', err.message);
    }
  }
  return transporter;
};

const sendLoginEmail = async (userEmail, userName) => {
  try {
    const activeTransporter = await getTransporter();
    if (!activeTransporter) return;

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Habit Mastery Terminal'}" <${process.env.SMTP_USER || 'no-reply@habitmastery.io'}>`,
      to: userEmail,
      subject: '🔒 Habit Mastery Terminal: New Login Detected',
      text: `Hello ${userName || 'User'},\n\nWe detected a new login to your Habit Mastery Terminal account (${userEmail}) at ${new Date().toLocaleString()}.\n\nIf this was you, you can safely ignore this email.\n\nLevel Up Your Habits!\n- The Habit Mastery Terminal Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6366f1; margin-top: 0;">🔒 New Login Detected</h2>
          <p>Hello <strong>${userName || 'User'}</strong>,</p>
          <p>We detected a new login to your <strong>Habit Mastery Terminal</strong> account (<code>${userEmail}</code>) at <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If this was you, no action is required. Go build some habits!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">This email was sent by the Habit Mastery Terminal notification system. If you did not log in, please reset your password immediately.</p>
        </div>
      `
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`✉️ Login email sent to: ${userEmail}. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`✉️ Email Preview Link: ${previewUrl}`);
  } catch (err) {
    console.error('❌ Mailer: Error sending login notification email:', err.message);
  }
};

const sendRegisterEmail = async (userEmail, userName) => {
  try {
    const activeTransporter = await getTransporter();
    if (!activeTransporter) return;

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Habit Mastery Terminal'}" <${process.env.SMTP_USER || 'no-reply@habitmastery.io'}>`,
      to: userEmail,
      subject: '🚀 Welcome to Habit Mastery Terminal!',
      text: `Hello ${userName || 'User'},\n\nWelcome to your Habit Mastery Terminal! Your profile has been initialized successfully.\n\nStart customizing your habits, timelines, calendars, and achievements to raise your readiness index.\n\nLevel Up Your Habits!\n- The Habit Mastery Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #00e5ff; margin-top: 0;">🚀 Profile Initialized Successfully!</h2>
          <p>Hello <strong>${userName || 'User'}</strong>,</p>
          <p>Welcome to your <strong>Habit Mastery Terminal</strong>!</p>
          <p>Your workspace environment has been successfully deployed. Start setting up custom habit checklist trackers, scheduling calendar events, and creating workspace objective lists to raise your readiness index and earn XP rank promotions!</p>
          <p>Go conquer your routine!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">This email welcomes you to your new Habit Mastery account.</p>
        </div>
      `
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`✉️ Welcome email sent to: ${userEmail}. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`✉️ Welcome Email Preview Link: ${previewUrl}`);
  } catch (err) {
    console.error('❌ Mailer: Error sending welcome email:', err.message);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || ['http://localhost:5173'];

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// In-memory fallback database for multi-user isolation
let localDB = {};

const createUserProfile = (email, name = '') => ({
  displayName: name || email.split('@')[0],
  email,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  xp: 0,
  level: 1,
  rank: 'Iron I',
  streak: 0,
  readiness: 0
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
      goal: { title: '', targetDate: '' }
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
const UserDataSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String, select: false },
  profile: { type: Object, default: {} },
  habitList: { type: Array, default: [] },
  customPages: { type: Array, default: [] },
  calendar: { type: Array, default: [] },
  goal: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema);

const createToken = (user) => jwt.sign(
  { uid: user.email, email: user.email },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

const buildUserPayload = (userData) => ({
  profile: userData.profile,
  habits: userData.habits,
  habitList: userData.habitList,
  customPages: userData.customPages,
  calendar: userData.calendar,
  goal: userData.goal
});

// Auth Middleware verifying JWT bearer tokens for protected API routes
const authMiddleware = async (req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/ai')) {
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

// GET Profile
app.get('/api/profile', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      let data = await UserData.findOne({ email: req.user.email });
      if (!data) {
        data = await UserData.create({
          email: req.user.email,
          profile: {
            displayName: req.user.email.split('@')[0],
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            xp: 0,
            level: 1,
            rank: 'Iron I',
            streak: 0,
            readiness: 0
          }
        });
      }
      return res.json(data.profile);
    } else {
      return res.json(getOrInitUser(req.user.email).profile);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Profile Sync
app.post('/api/profile/sync', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { profile: req.body, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).profile = req.body;
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
app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and a password of at least 8 characters are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    if (isConnectedToMongo) {
      const existing = await UserData.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const profile = createUserProfile(normalizedEmail, displayName);
      const created = await UserData.create({
        email: normalizedEmail,
        passwordHash,
        profile,
        habitList: [],
        customPages: [],
        calendar: [],
        goal: { title: '', targetDate: '' }
      });

      const token = createToken(created);
      sendRegisterEmail(normalizedEmail, displayName || normalizedEmail.split('@')[0]);
      return res.json({ token, ...buildUserPayload(created) });
    }

    const existing = localDB[normalizedEmail];
    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = getOrInitUser(normalizedEmail, displayName);
    user.passwordHash = passwordHash;
    const token = createToken(user);
    sendRegisterEmail(normalizedEmail, displayName || normalizedEmail.split('@')[0]);
    return res.json({ token, ...buildUserPayload(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    if (isConnectedToMongo) {
      const existing = await UserData.findOne({ email: normalizedEmail }).select('+passwordHash');
      if (!existing || !existing.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const validPassword = await bcrypt.compare(password, existing.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = createToken(existing);
      sendLoginEmail(normalizedEmail, existing.profile?.displayName || existing.displayName || normalizedEmail.split('@')[0]);
      return res.json({ token, ...buildUserPayload(existing) });
    }

    const existing = localDB[normalizedEmail];
    if (!existing || !existing.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, existing.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createToken(existing);
    sendLoginEmail(normalizedEmail, existing.profile?.displayName || existing.displayName || normalizedEmail.split('@')[0]);
    return res.json({ token, ...buildUserPayload(existing) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Google Gemini AI Assistant Integration ---
const callGemini = async (systemInstruction, userPrompt, jsonMode = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in your .env file.');
  }

  const model = "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
};

// AI Coach Response Generator Endpoint
app.post('/api/ai/coach', async (req, res) => {
  const { message, stats, email, displayName } = req.body;
  const userEmail = req.user?.email || email || 'User';

  const systemInstruction = `
    You are the "LevelUp AI Coach", a strategic, motivational advisor in a Habit Mastery Terminal workspace.
    The user is attempting to build productive habits, keep up day streaks, and complete custom timelines.
    Provide constructive, direct, action-oriented suggestions (strictly under 3 sentences).
    Active user metrics: readiness completion index: ${stats?.readiness || 0}%, active streak: ${stats?.streak || 0} days, user email: ${userEmail}.
    Always encourage consistency. Be warm, supportive, but disciplined.
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
