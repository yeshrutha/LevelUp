import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback database for multi-user isolation
let localDB = {};

const getOrInitUser = (email) => {
  const key = (email || 'anonymous').toLowerCase().trim();
  if (!localDB[key]) {
    localDB[key] = {
      profile: {
        xp: 0,
        level: 1,
        rank: 'Iron I',
        streak: 0,
        readiness: 0,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        displayName: key.split('@')[0]
      },
      habits: {},
      habitList: ['Exercise', 'Drink Water', 'Read Book'],
      customPages: [],
      calendar: [],
      goal: { title: '', targetDate: '' },
      alerts: []
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
  profile: { type: Object, default: {} },
  habits: { type: Object, default: {} },
  habitList: { type: Array, default: ['Exercise', 'Drink Water', 'Read Book'] },
  customPages: { type: Array, default: [] },
  calendar: { type: Array, default: [] },
  goal: { type: Object, default: {} },
  alerts: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema);

// Auth Middleware mapping headers to user profiles
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = { uid: 'anonymous', email: 'anonymous@levelup.io' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = { uid: 'anonymous', email: 'anonymous@levelup.io' };
    return next();
  }

  // Treat Bearer token as active user email for isolation
  req.user = { uid: token, email: token };
  next();
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

// GET Alerts
app.get('/api/alerts', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const data = await UserData.findOne({ email: req.user.email });
      return res.json({ alerts: data ? data.alerts : [] });
    } else {
      return res.json({ alerts: getOrInitUser(req.user.email).alerts });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Alerts Sync
app.post('/api/alerts', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      await UserData.updateOne(
        { email: req.user.email },
        { $set: { alerts: req.body.alerts, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } else {
      getOrInitUser(req.user.email).alerts = req.body.alerts;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Coach Response Generator Endpoint
app.post('/api/ai/coach', async (req, res) => {
  const { message, stats } = req.body;
  let reply = "Analyzing your growth logs... Keep up the focus! You are building valuable long-term consistency.";
  
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
  res.json({ reply });
});

// Notion-style AI Checklist Schedule Generator
app.post('/api/ai/notion', (req, res) => {
  const { prompt } = req.body;
  const pLower = (prompt || '').toLowerCase();
  let generatedTasks = [];

  if (pLower.includes('dsa') || pLower.includes('algorithm') || pLower.includes('code')) {
    generatedTasks = [
      { id: 'nt1', text: 'Solve 1 Medium pattern puzzle under 35 minutes' },
      { id: 'nt2', text: 'Trace data recursion call trees in a notebook' },
      { id: 'nt3', text: 'Code custom hash maps to understand collisions' }
    ];
  } else if (pLower.includes('fit') || pLower.includes('gym') || pLower.includes('health') || pLower.includes('run')) {
    generatedTasks = [
      { id: 'nt1', text: 'Complete dynamic body stretching routine' },
      { id: 'nt2', text: 'Log 25-minute cardiovascular stamina run' },
      { id: 'nt3', text: 'Hydrate continuously with 3 liters of water' }
    ];
  } else {
    generatedTasks = [
      { id: 'nt1', text: 'Read 1 chapter of technical literature' },
      { id: 'nt2', text: 'Write down tomorrow\'s top 3 habit priorities' },
      { id: 'nt3', text: 'Spend 45 minutes coding a micro-feature' }
    ];
  }

  res.json({ tasks: generatedTasks });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
