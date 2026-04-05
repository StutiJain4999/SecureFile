import mongoose from "mongoose";

const connectDb = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not configured");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
};

export default connectDb;
