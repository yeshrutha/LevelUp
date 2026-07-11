import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

export const pushLogs = [];

let vapidKeys = null;

const getVapidKeys = () => {
  if (vapidKeys) return vapidKeys;

  const pubKey = process.env.VAPID_PUBLIC_KEY;
  const privKey = process.env.VAPID_PRIVATE_KEY;

  if (pubKey && privKey) {
    vapidKeys = { publicKey: pubKey, privateKey: privKey };
  } else {
    // Persistent VAPID keys fallback across reboots
    const vapidPath = path.resolve('vapid.json');
    if (fs.existsSync(vapidPath)) {
      try {
        vapidKeys = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ WebPush: Failed to parse vapid.json, regenerating...');
      }
    }
    
    if (!vapidKeys) {
      vapidKeys = webpush.generateVAPIDKeys();
      try {
        fs.writeFileSync(vapidPath, JSON.stringify(vapidKeys), 'utf8');
        console.log('🤖 WebPush: Generated and saved persistent VAPID keys.');
      } catch (err) {
        console.error('❌ WebPush: Failed to save vapid.json key file:', err.message);
      }
    }
  }

  webpush.setVapidDetails(
    'mailto:yeshruthagowda@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  return vapidKeys;
};

// Initialize VAPID details immediately on load
getVapidKeys();

export const NotificationService = {
  getPublicKey: () => {
    const keys = getVapidKeys();
    return keys.publicKey;
  },

  sendPushNotification: async (subscription, payload) => {
    try {
      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      pushLogs.push({
        time: new Date().toISOString(),
        endpoint: subscription.endpoint,
        title: payload.title,
        status: 'success'
      });
      if (pushLogs.length > 50) pushLogs.shift();
      return { success: true, result };
    } catch (err) {
      pushLogs.push({
        time: new Date().toISOString(),
        endpoint: subscription.endpoint,
        title: payload.title,
        status: 'error',
        error: err.message
      });
      if (pushLogs.length > 50) pushLogs.shift();
      
      // 410 (Gone) or 404 (Not Found) means the push subscription is expired/unsubscribed
      if (err.statusCode === 410 || err.statusCode === 404) {
        return { success: false, expired: true, error: err.message };
      }
      return { success: false, expired: false, error: err.message };
    }
  }
};
