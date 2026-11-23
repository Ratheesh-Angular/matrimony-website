import mongoose from "mongoose";
import { runtimeEnv } from "@/lib/runtime-env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = runtimeEnv("MONGODB_URI");
  const MONGODB_DB_NAME = runtimeEnv("MONGODB_DB_NAME") || "business_site";

  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in your environment");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getDbName() {
  return runtimeEnv("MONGODB_DB_NAME") || "business_site";
}