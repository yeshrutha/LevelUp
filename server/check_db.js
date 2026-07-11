import mongoose from 'mongoose';
const MONGODB_URI = 'mongodb+srv://yeshruthagowda_db_user:Yeshrutha1609@yeshrutha910.kfby60a.mongodb.net/levelup?retryWrites=true&w=majority&appName=Yeshrutha910';

const UserDataSchema = new mongoose.Schema({
  email: String,
  profile: Object,
  pushSubscriptions: Array,
  habitList: Array,
  habits: Object,
  updatedAt: Date
});

const UserData = mongoose.model('UserData', UserDataSchema, 'userdatas');

async function run() {
  await mongoose.connect(MONGODB_URI);
  const u = await UserData.findOne({ email: 'yeshruthagowda@gmail.com' });
  if (u) {
    console.log(`Email: ${u.email}`);
    console.log(`Habit List Checklist:`, JSON.stringify(u.habitList, null, 2));
    console.log(`Habits Check log:`, JSON.stringify(u.habits, null, 2));
    console.log(`Last Updated At: ${u.updatedAt}`);
  } else {
    console.log('User not found.');
  }
  await mongoose.disconnect();
}

run().catch(console.error);
