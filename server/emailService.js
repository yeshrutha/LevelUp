import nodemailer from 'nodemailer';

export const emailLogs = [];

let transporter = null;

export let smtpStartupError = null;
export let smtpStartupStatus = 'pending';

const verifySMTPOnStartup = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    smtpStartupStatus = 'missing_credentials';
    console.warn('⚠️ Mailer: EMAIL_USER or EMAIL_PASS environment variables are missing.');
    return;
  }
  
  try {
    smtpStartupStatus = 'verifying';
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      family: 4 // Force IPv4 to prevent ENETUNREACH/timeout errors on IPv6 networks
    });
    await testTransporter.verify();
    smtpStartupStatus = 'success';
    console.log('✉️ Mailer: SMTP connection verified successfully on startup.');
  } catch (err) {
    smtpStartupStatus = 'error';
    smtpStartupError = err.message;
    console.error('❌ Mailer: SMTP connection verification failed on startup:', err.message);
  }
};

// Trigger SMTP verification asynchronously on startup
verifySMTPOnStartup();

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER or EMAIL_PASS environment variables are missing. Gmail SMTP cannot be initialized.');
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    },
    family: 4 // Force IPv4
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_USER;
  try {
    const client = await getTransporter();
    const result = await client.sendMail({
      from,
      to,
      subject,
      html
    });
    emailLogs.push({
      time: new Date().toISOString(),
      to,
      subject,
      status: 'success',
      result
    });
    if (emailLogs.length > 50) emailLogs.shift();
    return result;
  } catch (err) {
    emailLogs.push({
      time: new Date().toISOString(),
      to,
      subject,
      status: 'error',
      error: err.message
    });
    if (emailLogs.length > 50) emailLogs.shift();
    throw err;
  }
};

const getWebsiteUrl = () => {
  if (process.env.RENDER === 'true') {
    return 'https://levelup-assistant.vercel.app';
  }
  return process.env.WEBSITE_URL || 'https://levelup-assistant.vercel.app';
};

export const EmailService = {
  sendWelcomeEmail: async (toEmail, displayName) => {
    const websiteUrl = getWebsiteUrl();
    return await sendEmail({
      to: toEmail,
      subject: '🚀 Welcome to LevelUp - System Initialized!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">🚀 Welcome to LevelUp, ${displayName}!</h2>
          <p>Your user profile has been generated successfully. Let's LevelUp your skills, complete challenges, track milestones, and conquer your roadmaps.</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${websiteUrl}" style="background-color: #00e5ff; color: #020617; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Access Terminal</a>
          </div>
          <hr style="border-color: #1e293b; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">LevelUp Terminal Sync Systems.</p>
        </div>
      `
    });
  },

  sendVerificationEmail: async (toEmail, code) => {
    const websiteUrl = getWebsiteUrl();
    return await sendEmail({
      to: toEmail,
      subject: '✉️ LevelUp: Verify Your Email Address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">✉️ Verify Your Email Address</h2>
          <p>Please use the verification code below to verify your email inside the Settings portal:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #00e5ff; font-family: monospace;">${code}</span>
          </div>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${websiteUrl}/#settings" style="color: #00e5ff; font-family: monospace; text-decoration: underline; font-size: 13px;">Return to Settings Portal</a>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">This code expires in 15 minutes. If you did not request this, you can ignore this message.</p>
        </div>
      `
    });
  },

  sendPasswordResetEmail: async (toEmail, code) => {
    const websiteUrl = getWebsiteUrl();
    return await sendEmail({
      to: toEmail,
      subject: '🔑 LevelUp: Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">🔑 Reset Your Password</h2>
          <p>We received a password reset request. Use the code below to configure a new password:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #00e5ff; font-family: monospace;">${code}</span>
          </div>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${websiteUrl}" style="color: #00e5ff; font-family: monospace; text-decoration: underline; font-size: 13px;">Return to Authentication Terminal</a>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">This code is active for 15 minutes. If you did not make this request, update your security credentials immediately.</p>
        </div>
      `
    });
  },

  sendDailyTaskReminder: async (toEmail, displayName, tasks = []) => {
    const websiteUrl = getWebsiteUrl();
    let taskListHtml = '';
    if (tasks.length > 0) {
      taskListHtml = `<ul style="text-align: left; line-height: 1.6; margin: 0; padding-left: 20px;">` + 
        tasks.map(t => `<li style="margin-bottom: 8px; color: #f3f4f6;">🔹 ${t.text || t}</li>`).join('') + 
        `</ul>`;
    } else {
      taskListHtml = `<p style="color: #9ca3af; font-style: italic; margin: 0;">No active tasks in your list today! Deploy new milestones to continue leveling up.</p>`;
    }

    return await sendEmail({
      to: toEmail,
      subject: '📅 LevelUp: Your Daily Task Reminder',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace; text-align: center;">📅 Daily Task Checklist</h2>
          <p>Hello ${displayName}, here are your key objectives for today:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${taskListHtml}
          </div>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${websiteUrl}" style="background-color: #00e5ff; color: #020617; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-family: monospace; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Update Dashboard Checklist</a>
          </div>
          <p style="text-align: center; font-size: 12px; color: #9ca3af;">Complete these tasks in your dashboard to earn XP and increase your readiness score!</p>
        </div>
      `
    });
  },

  sendWeeklyProgressReport: async (toEmail, displayName, progressStats) => {
    const websiteUrl = getWebsiteUrl();
    const { xpEarned = 0, tasksCompleted = 0, habitsMaintained = 0, readinessDelta = 0 } = progressStats;

    return await sendEmail({
      to: toEmail,
      subject: '📈 LevelUp: Your Weekly Progress Report',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace; text-align: center;">📈 Weekly Growth Metrics</h2>
          <p>Excellent work this week, ${displayName}! Here is a summary of your telemetry stats:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.8;">
            <div>⭐️ <strong>XP Acquired:</strong> +${xpEarned} XP</div>
            <div>✅ <strong>Tasks Completed:</strong> ${tasksCompleted} items</div>
            <div>🔥 <strong>Streak Level:</strong> ${habitsMaintained} days active</div>
            <div>⚡️ <strong>Readiness Variance:</strong> ${readinessDelta >= 0 ? '+' : ''}${readinessDelta}% delta</div>
          </div>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${websiteUrl}" style="background-color: #00e5ff; color: #020617; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-family: monospace; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Go to Dashboard</a>
          </div>
          <p style="text-align: center;">Keep pushing forward. Consistency is the key to mastering your domains!</p>
        </div>
      `
    });
  },

  sendAchievementNotification: async (toEmail, displayName, achievementName, xpReward) => {
    const websiteUrl = getWebsiteUrl();
    return await sendEmail({
      to: toEmail,
      subject: '🏆 Achievement Unlocked: ' + achievementName,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6; text-align: center;">
          <h2 style="color: #ffd700; margin-top: 0; text-transform: uppercase; font-family: monospace;">🏆 Achievement Unlocked!</h2>
          <p>Outstanding performance, ${displayName}!</p>
          <div style="background-color: #0b0f19; border: 1px dashed #ffd700; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 20px; font-weight: bold; color: #ffd700; display: block; margin-bottom: 5px;">${achievementName}</span>
            <span style="font-size: 12px; color: #9ca3af;">Bonus Reward: +${xpReward} XP has been credited.</span>
          </div>
          <div style="margin: 20px 0;">
            <a href="${websiteUrl}" style="color: #ffd700; font-family: monospace; text-decoration: underline; font-size: 13px;">View Achievements Catalog</a>
          </div>
          <p>Visit your achievement catalog inside LevelUp to view unlocked badges.</p>
        </div>
      `
    });
  },

  sendSupportTicketConfirmation: async (toEmail, displayName, message) => {
    return await sendEmail({
      to: toEmail,
      subject: '🎟️ LevelUp Support: Ticket Received',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">🎟️ Support Ticket Acknowledged</h2>
          <p>Hello ${displayName},</p>
          <p>We apologize for the issues faced and we will resolve it for you and thank you for approaching us.</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #9ca3af; font-size: 11px; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 5px;">Your Message:</strong>
            <span style="font-size: 13px; color: #f3f4f6;">${message}</span>
          </div>
          <p>Regards,<br /><strong>LevelUp Team</strong></p>
          <hr style="border-color: #1e293b; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">LevelUp automated ticket tracking systems.</p>
        </div>
      `
    });
  },

  sendDeveloperTicketNotification: async (fromUserEmail, fromUserName, message) => {
    const toEmail = process.env.EMAIL_USER;
    return await sendEmail({
      to: toEmail,
      subject: `🚨 LevelUp SUPPORT: New Ticket from ${fromUserName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e11d48; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #e11d48; margin-top: 0; text-transform: uppercase; font-family: monospace;">🚨 New Developer Alert</h2>
          <p>A new support request has been logged by a user:</p>
          <div style="background-color: #0b0f19; border: 1px solid #e11d48; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
            <div><strong>User:</strong> ${fromUserName} (${fromUserEmail})</div>
            <div style="margin-top: 10px;"><strong>Issue/Feedback:</strong></div>
            <div style="margin-top: 5px; color: #cbd5e1; font-style: italic; white-space: pre-wrap;">${message}</div>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">LevelUp automated notification engine.</p>
        </div>
      `
    });
  },

  sendHabitReminderEmail: async (toEmail, displayName, habitName) => {
    const websiteUrl = getWebsiteUrl();
    const MOTIVATIONAL_PHRASES = [
      "Consistency is the foundation of virtue. Do it for your future self!",
      "Small daily habits compound into massive lifetime gains. You can do this!",
      "Make today count. Your streaks define your resilience and power!",
      "Every completed habit is a step closer to mastering your potential.",
      "Focus on the process, not just the results. Power through your routine!",
      "Action cures fear and builds momentum. Go tick this off!",
      "Your potential is endless. Keep the momentum high and complete this task!"
    ];
    const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];

    return await sendEmail({
      to: toEmail,
      subject: `⏰ Reminder: Time for "${habitName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0c0f17; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #00e5ff; font-size: 24px; letter-spacing: 2px; margin: 0;">LEVELUP ALERTS</h1>
            <p style="color: #64748b; font-size: 10px; text-transform: uppercase; margin-top: 5px;">Habit Master Engine</p>
          </div>
          
          <div style="background-color: #020617; padding: 25px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
            <p style="font-size: 14px; color: #94a3b8; margin-top: 0;">Hi <strong>${displayName}</strong>,</p>
            
            <p style="font-size: 18px; color: #ffffff; line-height: 1.6; font-weight: bold; margin: 15px 0;">
              It's time to complete your habit: <br/>
              <span style="color: #00e5ff; font-size: 22px;">"${habitName}"</span>
            </p>
            
            <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; border: 1px dashed rgba(0, 229, 255, 0.3); margin: 20px 0; color: #cbd5e1; font-style: italic; font-size: 13px;">
              "${phrase}"
            </div>
            
            <div style="margin-top: 25px; margin-bottom: 10px;">
              <a href="${websiteUrl}" style="background-color: #00e5ff; color: #020617; padding: 12px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 15px rgba(0,229,255,0.4);">
                Check Off Habit
              </a>
            </div>
          </div>
        </div>
      `
    });
  }
};
