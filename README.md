# LevelUp | Habit Mastery Terminal 🚀

> A premium, gamified, and highly customizable **Habit Mastery Terminal** designed to track habits, manage custom workspace milestones, and level up your daily discipline.

---

## ⚡ Features

### 1. 🎯 Dynamic Target Goal Milestone Countdown
- Custom milestone input interface allowing you to set personalized targets.
- Dynamic countdown calculations updating days left in real-time.
- Multi-user isolation, keeping goals blank until configured individually.

### 2. 🛡️ Safe Authentication & Switching Accounts
- Separate **Sign In** and **Create Account** access forms.
- Automatic email regex format verification.
- **Duplicate Account Blocker**: Prevents registering existing emails and displays error alerts.
- **Data Sandboxing**: Prefixes all local storage and backend sync profiles with active user emails.

### 3. 🏋️ Custom Dynamic Habits Checklist
- Add and delete custom habits.
- Simple checkbox tracking showing completion states.
- Abstracted reward badges showing **XP Gain** instead of raw numbers.

### 4. 📄 Notion-Style Customizable Pages
- Define custom workspaces (e.g. Fitness, Language Learning, Project Development).
- Set page durations (term days) and load AI-generated task lists.
- **Completion-Ratio XP Scaling**: Gaining task completion XP based on daily execution rates:
  - $\ge$ 75% day completion: awards **+10 XP** per task.
  - [50% - 75%) day completion: awards **+5 XP** per task.
  - < 50% day completion: awards **+3 XP** per task.
- Built-in anti-exploit trackers to subtract correct XP sums when unchecking items.

### 5. 🌟 Smart Progress Notifications & Achievement Chimes
- Lightweight toast notifications keep you informed about level milestones and status updates.
- Native Web Audio API chimes reward progress with immersive synth tones for promotions and streaks.
- Notifications are designed to feel like a gamified progression system, not an intrusive alert feed.

### 6. 📱 Standalone Desktop PWA Shell
- Standard PWA manifest (`manifest.json`) and caching service worker (`sw.js`).
- Installable directly from the browser onto your desktop or taskbar.
- Native app container frame featuring mock window control titlebars (minimize, maximize, close).

### 7. 🎨 obsidian light/dark themes
- obsidian light and dark theme mode switcher.
- Violet & Rose accents, completely avoiding blue and green.

---

## 🛠️ Technology Stack
- **Frontend Core**: React 19, Vite 8, TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Audio synthesis**: Native Web Audio API
- **Backend Server**: Node.js, Express, Helmet, CORS, JSON Web Token (JWT) authentication
- **Security**: bcrypt password hashing, token-based session handling, environment-driven CORS allow list
- **Database Storage**: MongoDB (Mongoose) with silent local memory database failover

---

## ⚙️ Installation & Running

### 1. Install All Dependencies
Install root, client, and server packages concurrently:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory to configure backend authentication and MongoDB support:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/levelup
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=4h
ALLOWED_ORIGINS=http://localhost:5173
```
Create a `.env` file in the `client` directory to point the frontend at the API server:
```env
VITE_API_BASE_URL=http://localhost:5000
```
*Note: If no MongoDB URI is provided, the backend falls back to an in-memory multi-user database.*

### 3. Run Development Servers
Start both the Vite client server and the Express API server concurrently:
```bash
npm run dev
```
- Client runs at: `http://localhost:5173/`
- Server runs at: `http://localhost:5000/`