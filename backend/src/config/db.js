import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local-book-exchange';

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};
