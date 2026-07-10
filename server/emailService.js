import { Resend } from 'resend';

const getResendInstance = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing in environmental variables. Integration failed.');
  }
  return new Resend(apiKey);
};

export const EmailService = {
  sendWelcomeEmail: async (toEmail, displayName) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    return await resend.emails.send({
      from,
      to: toEmail,
      subject: '🚀 Welcome to LevelUp - System Initialized!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">🚀 Welcome to LevelUp, ${displayName}!</h2>
          <p>Your user profile has been generated successfully. Let's LevelUp your skills, complete challenges, track milestones, and conquer your roadmaps.</p>
          <hr style="border-color: #1e293b; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">LevelUp Terminal Sync Systems.</p>
        </div>
      `
    });
  },

  sendVerificationEmail: async (toEmail, code) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    return await resend.emails.send({
      from,
      to: toEmail,
      subject: '✉️ LevelUp: Verify Your Email Address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">✉️ Verify Your Email Address</h2>
          <p>Please use the verification code below to verify your email inside the Settings portal:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #00e5ff; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">This code expires in 15 minutes. If you did not request this, you can ignore this message.</p>
        </div>
      `
    });
  },

  sendPasswordResetEmail: async (toEmail, code) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    return await resend.emails.send({
      from,
      to: toEmail,
      subject: '🔑 LevelUp: Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace;">🔑 Reset Your Password</h2>
          <p>We received a password reset request. Use the code below to configure a new password:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #00e5ff; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.5;">This code is active for 15 minutes. If you did not make this request, update your security credentials immediately.</p>
        </div>
      `
    });
  },

  sendDailyTaskReminder: async (toEmail, displayName, tasks = []) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    let taskListHtml = '';
    if (tasks.length > 0) {
      taskListHtml = `<ul style="text-align: left; line-height: 1.6; margin: 0; padding-left: 20px;">` + 
        tasks.map(t => `<li style="margin-bottom: 8px; color: #f3f4f6;">🔹 ${t.text || t}</li>`).join('') + 
        `</ul>`;
    } else {
      taskListHtml = `<p style="color: #9ca3af; font-style: italic; margin: 0;">No active tasks in your list today! Deploy new milestones to continue leveling up.</p>`;
    }

    return await resend.emails.send({
      from,
      to: toEmail,
      subject: '📅 LevelUp: Your Daily Task Reminder',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 10px; background-color: #030712; color: #f3f4f6;">
          <h2 style="color: #00e5ff; margin-top: 0; text-transform: uppercase; font-family: monospace; text-align: center;">📅 Daily Task Checklist</h2>
          <p>Hello ${displayName}, here are your key objectives for today:</p>
          <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${taskListHtml}
          </div>
          <p style="text-align: center;">Complete these tasks in your dashboard to earn XP and increase your readiness score!</p>
        </div>
      `
    });
  },

  sendWeeklyProgressReport: async (toEmail, displayName, progressStats) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { xpEarned = 0, tasksCompleted = 0, habitsMaintained = 0, readinessDelta = 0 } = progressStats;

    return await resend.emails.send({
      from,
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
          <p style="text-align: center;">Keep pushing forward. Consistency is the key to mastering your domains!</p>
        </div>
      `
    });
  },

  sendAchievementNotification: async (toEmail, displayName, achievementName, xpReward) => {
    const resend = getResendInstance();
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    return await resend.emails.send({
      from,
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
          <p>Visit your achievement catalog inside LevelUp to view unlocked badges.</p>
        </div>
      `
    });
  }
};
