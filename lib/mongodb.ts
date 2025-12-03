import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
};

let client: MongoClient | null = null;

export async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(uri, options);
    }

    await client.connect();
    const db = client.db('health-sync');
    await db.command({ ping: 1 });

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (client) {
      await client.close();
      client = null;
    }
    throw error;
  }
}

process.on('SIGTERM', async () => {
  if (client) {
    await client.close();
    client = null;
  }
});

