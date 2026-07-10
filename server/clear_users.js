import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not set in .env");
  process.exit(1);
}

// Since MongoDB collection is UserData, we bind to the collection named 'userdatas' or explicitly specify collection name
const UserDataSchema = new mongoose.Schema({}, { strict: false });
const UserData = mongoose.model('UserData', UserDataSchema, 'userdatas');

mongoose.connect(mongoURI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const deleteResult = await UserData.deleteMany({});
    console.log(`Deleted all users! Result:`, deleteResult);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect/delete:", err);
    process.exit(1);
  });
