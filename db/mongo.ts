import { MongoClient, ServerApiVersion } from 'mongodb';

const connectionOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const CONNECTION_STRING = process.env.CONNECTION_STRING;
const DATABASE_NAME = process.env.DATABASE_NAME;

const client = new MongoClient(CONNECTION_STRING, connectionOptions);
const database = client.db(DATABASE_NAME);

const closeConnection = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('Error closing the MongoDB connection:', error);
  }
};

export { database, closeConnection };
