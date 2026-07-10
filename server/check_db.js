import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yeshruthagowda_db_user:Yeshrutha1609@yeshrutha910.kfby60a.mongodb.net/levelup?retryWrites=true&w=majority&appName=Yeshrutha910';

const UserDataSchema = new mongoose.Schema({
  email: String,
  profile: Object,
  habits: Object,
  habitList: Array,
});

const UserData = mongoose.model('UserData', UserDataSchema, 'userdatas');

async function check() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const users = await UserData.find({});
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log('--------------------------------------------------');
    console.log(`Email: ${u.email}`);
    console.log(`Profile:`, JSON.stringify(u.profile, null, 2));
    console.log(`Habit List:`, u.habitList);
    console.log(`Habits Logs:`, JSON.stringify(u.habits, null, 2));
  }

  await mongoose.disconnect();
}

check().catch(console.error);
