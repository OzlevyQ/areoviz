// src/lib/mongodb.ts

import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ozlevy9:Qq63415355@cluster0.9crpo4m.mongodb.net/areovizn?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
