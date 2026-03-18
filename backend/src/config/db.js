import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://varshedhaavr2023cse:varshu0715@cluster0.7xyfz.mongodb.net/local-book-exchange';

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};
