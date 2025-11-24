import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dropRoomIdIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("finalreports");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("📋 Current indexes:", indexes);

    // Drop the roomId_1 index if it exists
    try {
      await collection.dropIndex("roomId_1");
      console.log("✅ Successfully dropped roomId_1 index");
    } catch (error) {
      if (error.code === 27 || error.message.includes("index not found")) {
        console.log("ℹ️  roomId_1 index does not exist");
      } else {
        throw error;
      }
    }

    // Verify indexes after drop
    const indexesAfter = await collection.indexes();
    console.log("📋 Indexes after drop:", indexesAfter);

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

dropRoomIdIndex();
