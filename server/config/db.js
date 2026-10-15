import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kanban_board_db';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Running with auto-retry or fallback mode if needed.');
    return false;
  }
};

export default connectDB;
