import mongoose from 'mongoose';

let isConnected = false;
let isInMemoryFallback = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm_saas';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to local MongoDB (${error.message}).`);
    console.info('[Data Layer]: Operating in Resilient In-Memory Mock Mode. Full REST APIs and dynamic state remain active.');
    isConnected = false;
    isInMemoryFallback = true;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  fallbackMode: isInMemoryFallback,
});
