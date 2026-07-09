import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback database for instant preview/standalone dev
let localDB = {
  profile: {
    xp: 0,
    level: 1,
    rank: 'Iron I',
    streak: 0,
    readiness: 0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    displayName: 'Penguin Cadet'
  },
  leetcode: [],
  habits: {}, // { '2026-07-09': { gym: true, ... } }
  projects: [],
  communication: [],
  applications: [],
  calendar: []
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

// Schemas & Models (Only initialized if MongoDB is connected)
const UserSchema = new mongoose.Schema({
  uid: String,
  displayName: String,
  avatar: String,
  xp: Number,
  level: Number,
  rank: String,
  streak: Number,
  readiness: Number,
  createdAt: { type: Date, default: Date.now }
});

const ActivitySchema = new mongoose.Schema({
  uid: String,
  type: String, // 'leetcode', 'habit', 'project', 'communication', 'application', 'calendar'
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

// Middleware to mock Firebase Auth or verify token if provided
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If no auth header, assign a default local user
    req.user = { uid: 'local_user_penguin', email: 'penguin@levelup.io' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (token === 'mock-token') {
    req.user = { uid: 'local_user_penguin', email: 'penguin@levelup.io' };
    return next();
  }

  // Firebase Admin token verification would go here in production:
  // try {
  //   const decodedToken = await admin.auth().verifyIdToken(token);
  //   req.user = decodedToken;
  //   next();
  // } catch (err) {
  //   res.status(401).json({ error: 'Unauthorized token' });
  // }
  
  req.user = { uid: 'local_user_penguin', email: 'penguin@levelup.io' };
  next();
};

app.use(authMiddleware);

// --- API ROUTES ---

// GET Profile
app.get('/api/profile', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      let user = await User.findOne({ uid: req.user.uid });
      if (!user) {
        user = await User.create({
          uid: req.user.uid,
          displayName: 'Penguin Cadet',
          avatar: localDB.profile.avatar,
          xp: 0,
          level: 1,
          rank: 'Iron I',
          streak: 0,
          readiness: 0
        });
      }
      return res.json(user);
    } else {
      return res.json(localDB.profile);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Profile Sync (Update stats)
app.post('/api/profile/sync', async (req, res) => {
  const { xp, level, rank, streak, readiness, displayName, avatar } = req.body;
  try {
    if (isConnectedToMongo) {
      const updatedUser = await User.findOneAndUpdate(
        { uid: req.user.uid },
        { xp, level, rank, streak, readiness, displayName, avatar },
        { new: true, upsert: true }
      );
      return res.json(updatedUser);
    } else {
      localDB.profile = { ...localDB.profile, xp, level, rank, streak, readiness, displayName, avatar };
      return res.json(localDB.profile);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Activities by Type
app.get('/api/activities/:type', async (req, res) => {
  const { type } = req.params;
  try {
    if (isConnectedToMongo) {
      const list = await Activity.find({ uid: req.user.uid, type });
      return res.json(list.map(item => ({ id: item._id, ...item.data })));
    } else {
      if (type === 'leetcode') return res.json(localDB.leetcode);
      if (type === 'projects') return res.json(localDB.projects);
      if (type === 'communication') return res.json(localDB.communication);
      if (type === 'applications') return res.json(localDB.applications);
      if (type === 'calendar') return res.json(localDB.calendar);
      return res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save Activity
app.post('/api/activities/:type', async (req, res) => {
  const { type } = req.params;
  const activityData = req.body; // should contain id or unique key inside
  try {
    if (isConnectedToMongo) {
      // Find existing activity if it has an id
      let doc;
      if (activityData.id) {
        doc = await Activity.findOne({ uid: req.user.uid, type, 'data.id': activityData.id });
      }
      if (doc) {
        doc.data = activityData;
        await doc.save();
      } else {
        doc = await Activity.create({
          uid: req.user.uid,
          type,
          data: activityData
        });
      }
      return res.json({ id: doc._id, ...doc.data });
    } else {
      if (type === 'leetcode') {
        const idx = localDB.leetcode.findIndex(item => item.id === activityData.id);
        if (idx > -1) localDB.leetcode[idx] = activityData;
        else localDB.leetcode.push(activityData);
      } else if (type === 'projects') {
        const idx = localDB.projects.findIndex(item => item.id === activityData.id);
        if (idx > -1) localDB.projects[idx] = activityData;
        else localDB.projects.push(activityData);
      } else if (type === 'applications') {
        const idx = localDB.applications.findIndex(item => item.id === activityData.id);
        if (idx > -1) localDB.applications[idx] = activityData;
        else localDB.applications.push(activityData);
      } else if (type === 'calendar') {
        const idx = localDB.calendar.findIndex(item => item.id === activityData.id);
        if (idx > -1) localDB.calendar[idx] = activityData;
        else localDB.calendar.push(activityData);
      } else if (type === 'communication') {
        localDB.communication.push(activityData);
      }
      return res.json(activityData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Activity
app.delete('/api/activities/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    if (isConnectedToMongo) {
      await Activity.deleteOne({ uid: req.user.uid, type, 'data.id': id });
      return res.json({ success: true });
    } else {
      if (type === 'leetcode') {
        localDB.leetcode = localDB.leetcode.filter(item => item.id !== id);
      } else if (type === 'projects') {
        localDB.projects = localDB.projects.filter(item => item.id !== id);
      } else if (type === 'applications') {
        localDB.applications = localDB.applications.filter(item => item.id !== id);
      } else if (type === 'calendar') {
        localDB.calendar = localDB.calendar.filter(item => item.id !== id);
      }
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Habit log
app.get('/api/habits', async (req, res) => {
  try {
    if (isConnectedToMongo) {
      const habitLogs = await Activity.find({ uid: req.user.uid, type: 'habit' });
      const habitsMap = {};
      habitLogs.forEach(doc => {
        habitsMap[doc.data.date] = doc.data.habits;
      });
      return res.json(habitsMap);
    } else {
      return res.json(localDB.habits);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Habit log toggle
app.post('/api/habits', async (req, res) => {
  const { date, habits } = req.body;
  try {
    if (isConnectedToMongo) {
      let doc = await Activity.findOne({ uid: req.user.uid, type: 'habit', 'data.date': date });
      if (doc) {
        doc.data = { date, habits };
        await doc.save();
      } else {
        await Activity.create({
          uid: req.user.uid,
          type: 'habit',
          data: { date, habits }
        });
      }
      return res.json({ success: true });
    } else {
      localDB.habits[date] = habits;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Coach Response Generator Endpoint
app.post('/api/ai/coach', async (req, res) => {
  const { message, stats } = req.body;
  
  // Custom smart responses analyzing stats
  let reply = "I'm analyzing your placement operating system logs. You are making steady progress! Keep coding.";
  
  if (message.toLowerCase().includes('dsa') || message.toLowerCase().includes('leet')) {
    reply = `With ${stats?.leetcodeCount || 0} problems solved, focus on strengthening your foundations. I recommend solving 2 Medium LeetCode problems on Recursion or Trees today. Remember: focus on understanding patterns, not memorizing code!`;
  } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('react')) {
    reply = "For your projects, make sure your GitHub repositories have high-quality READMEs, schema design diagrams, and are deployed live. Placements evaluators look for clean commits and active project deployments!";
  } else if (message.toLowerCase().includes('resume') || message.toLowerCase().includes('interview')) {
    reply = "To ace your interviews, do mock speaking practice daily in the Communication Center. Explaining your code using the STAR method (Situation, Task, Action, Result) will boost your confidence score!";
  } else {
    const readiness = stats?.readiness || 0;
    if (readiness < 40) {
      reply = `Hello Penguin. You are currently at ${readiness}% placement readiness. Let's step up! Try completing your Daily Missions and logging a Python/Java study session to earn quick XP.`;
    } else if (readiness < 70) {
      reply = `Good progress, Penguin! You are at ${readiness}% placement readiness. Focus on completing your projects, logging medium LeetCode exercises, and maintaining a 5-day study streak. You're getting closer to the Gold/Platinum rank!`;
    } else {
      reply = `Outstanding job, Penguin! At ${readiness}% readiness, you are in the elite tier. Focus on system design, mock interviews, and advanced algorithmic challenges. Keep maintaining your habits!`;
    }
  }

  res.json({ reply });
});

// Notion-style AI Checklist Schedule Generator
app.post('/api/ai/notion', (req, res) => {
  const { prompt, termDays } = req.body;
  const days = parseInt(termDays) || 14;
  const pLower = (prompt || '').toLowerCase();
  
  let generatedTasks = [];

  if (pLower.includes('dsa') || pLower.includes('algorithm') || pLower.includes('leetcode')) {
    generatedTasks = [
      { id: 'nt1', text: 'Solve 1 LeetCode Easy & study optimal approach' },
      { id: 'nt2', text: 'Solve 1 LeetCode Medium under 35 minutes' },
      { id: 'nt3', text: 'Map out code complexity space/time limits' },
      { id: 'nt4', text: 'Review standard recursion call trees' }
    ];
  } else if (pLower.includes('web') || pLower.includes('react') || pLower.includes('node') || pLower.includes('frontend') || pLower.includes('backend')) {
    generatedTasks = [
      { id: 'nt1', text: 'Write reusable UI components with dark glassmorphism' },
      { id: 'nt2', text: 'Configure local express routes & error middleware' },
      { id: 'nt3', text: 'Test endpoint outputs using curl or fetch calls' },
      { id: 'nt4', text: 'Sync state hooks to localStorage and clear queues' }
    ];
  } else if (pLower.includes('gym') || pLower.includes('fit') || pLower.includes('workout') || pLower.includes('health')) {
    generatedTasks = [
      { id: 'nt1', text: 'Complete progressive overload lifting set targets' },
      { id: 'nt2', text: 'Log 30 minutes cardio stamina runs' },
      { id: 'nt3', text: 'Drink 3.5 liters water throughout study blocks' },
      { id: 'nt4', text: 'Maintain clean nutrition meal prep goals' }
    ];
  } else if (pLower.includes('java') || pLower.includes('oop')) {
    generatedTasks = [
      { id: 'nt1', text: 'Review Java Collections and Generics' },
      { id: 'nt2', text: 'Implement inheritance & interface polymorphism' },
      { id: 'nt3', text: 'Debug memory allocations and JVM thread locks' },
      { id: 'nt4', text: 'Log 1 practice problem using JVM arguments' }
    ];
  } else {
    // Default general student placement checklist
    generatedTasks = [
      { id: 'nt1', text: 'Review active roadmap lessons' },
      { id: 'nt2', text: 'Review 1 flagged active recall concept' },
      { id: 'nt3', text: 'Log 45 minutes of keyboard coding exercises' },
      { id: 'nt4', text: 'Solve 1 algorithmic puzzle challenge' }
    ];
  }

  res.json({ tasks: generatedTasks });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
