import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    let dbURI = process.env.MONGODB_URI;

    if (!dbURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Aggressive Clean: Remove whitespace and illegal characters like < > { } " '
    // These characters often appear when users copy-paste placeholders or JSON snippets.
    dbURI = dbURI.trim().replace(/[<>{}"']/g, '');

    // Debug logging (masking password)
    // Mask everything between the first : (after the scheme) and the @
    const maskedURI = dbURI.replace(/:([^@:]+)@/, ':****@');
    console.log(`📡 Attempting to connect to: ${maskedURI}`);

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
