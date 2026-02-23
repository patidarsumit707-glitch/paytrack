import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://patidarsumit707_db_user:LjQJYo4AQkNh3vyK@cluster0.ebme6qb.mongodb.net/?appName=Cluster0";

declare global {
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export const connectDb = async () => {
  if (!global.mongooseConn) {
    global.mongooseConn = mongoose.connect(MONGODB_URI, { dbName: "paytrack" });
  }
  return global.mongooseConn;
};
