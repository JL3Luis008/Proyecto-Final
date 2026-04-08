import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    let dbURI = process.env.MONGODB_URI;

    if (!dbURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Smart Fix: Automatically remove < > brackets if they were left by mistake
    if (dbURI.includes('<') || dbURI.includes('>')) {
      console.warn("⚠️ Warning: MONGODB_URI contains '<' or '>' brackets. Cleaning them automatically...");
      dbURI = dbURI.replace(/[<>]/g, '');
    }

    await mongoose.connect(dbURI, {});

    console.log(`MongoDB is connected`);
  } catch (error) {
    console.error("❌ Database Connection Error:");
    console.error(error.message);
    // On production/render, it's better to log the full error for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error(error);
    }
    process.exit(1);
  }
};

export default dbConnection;
