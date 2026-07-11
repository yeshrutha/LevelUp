import mongoose from 'mongoose';
const MONGODB_URI = 'mongodb+srv://yeshruthagowda_db_user:Yeshrutha1609@yeshrutha910.kfby60a.mongodb.net/levelup?retryWrites=true&w=majority&appName=Yeshrutha910';

const UserDataSchema = new mongoose.Schema({
  email: String,
  profile: Object,
  pushSubscriptions: Array
});

const UserData = mongoose.model('UserData', UserDataSchema, 'userdatas');

async function run() {
  await mongoose.connect(MONGODB_URI);
  const users = await UserData.find({});
  for (const u of users) {
    console.log(`Email: ${u.email}`);
    console.log(`DisplayName: ${u.profile?.displayName}`);
    console.log(`Subscriptions Count: ${u.pushSubscriptions?.length || 0}`);
    console.log(`Subscriptions:`, JSON.stringify(u.pushSubscriptions));
    console.log('-------------------------------------------');
  }
  await mongoose.disconnect();
}

run().catch(console.error);
