import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/paytrack";

declare global {
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export const connectDb = async () => {
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(MONGODB_URI, { dbName: "paytrack" });
  }
  return global.mongooseConn;
};
