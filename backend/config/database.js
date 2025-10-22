import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Server will continue running, but database operations will fail');
    // Don't exit process - let the server handle errors gracefully
  }
  
  // Handle connection errors after initial connection
  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB Error: ${err.message}`);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
  });
};

export default connectDB;
