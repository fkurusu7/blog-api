import mongoose from "mongoose";
import { error, info, success, warn } from "./../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION, {
      autoIndex: true,
    });
    success("MongoDB connecttion was success!");

    // Connection States
    mongoose.connection.on("connected", () => info("Mongoose connected to DB"));
    mongoose.connection.on("error", (err) =>
      error("Mongoose connection error", err)
    );
    mongoose.connection.on("disconnected", () =>
      warn("Mongoose connection disconnected")
    );

    // Handle application termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        info("Mongoose connection closed through app termination");
        process.exit(0);
      } catch (err) {
        error("Error closing Mongoose connection:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    error("MongoDB connection error:", err);
    // Optionally exit the process on connection failure
    process.exit(1);
  }
};

export default connectDB;
