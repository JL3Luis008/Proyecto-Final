import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    let dbURI = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === "test" && process.env.MONGODB_URI_TEST) {
      dbURI = process.env.MONGODB_URI_TEST;
      console.log("🧪 Usando base de datos de PRUEBAS");
    }

    if (!dbURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Trim and Aggressive Clean: Remove whitespace and illegal characters like < > { } " '
    dbURI = dbURI.trim().replace(/[<>{}"']/g, '');

    // Strip "MONGODB_URI=" prefix if it was accidentally copy-pasted into the env value
    if (dbURI.includes('MONGODB_URI=')) {
      dbURI = dbURI.split('MONGODB_URI=').pop().trim();
    }

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
