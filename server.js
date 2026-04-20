const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'beyond_everest';

const hasMongoUri =
  typeof mongoUri === 'string' &&
  (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'));

if (!hasMongoUri) {
  console.warn('MongoDB is not configured. Set MONGODB_URI to enable contact form storage.');
}

const client = hasMongoUri
  ? new MongoClient(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxIdleTimeMS: 60000
    })
  : null;

let contactsCollection;
let httpServer;

async function initMongo() {
  if (!client) return;
  await client.connect();
  const db = client.db(mongoDbName);
  contactsCollection = db.collection('contacts');
  await contactsCollection.createIndex({ createdAt: -1 });
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  try {
    if (!contactsCollection) {
      return res.status(503).json({
        ok: false,
        error: 'Contact service unavailable. Configure MONGODB_URI with a valid MongoDB connection string.'
      });
    }

    const { name, email, interest, message, page } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'name, email and message are required'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email address' });
    }

    const doc = {
      name: String(name).trim(),
      email: normalizedEmail,
      interest: interest ? String(interest).trim() : 'information',
      message: String(message).trim(),
      page: page ? String(page).trim() : 'unknown',
      createdAt: new Date()
    };

    if (!doc.name || !doc.message) {
      return res.status(400).json({ ok: false, error: 'name and message cannot be empty' });
    }

    await contactsCollection.insertOne(doc);
    return res.status(201).json({ ok: true, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongoConnected: Boolean(contactsCollection) });
});

function listenWithFallback(preferredPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    const basePort = Number(preferredPort);

    if (!Number.isInteger(basePort) || basePort <= 0) {
      reject(new Error('Invalid PORT value. Provide a positive integer.'));
      return;
    }

    const tryListen = (offset) => {
      const candidatePort = basePort + offset;
      const server = app.listen(candidatePort, () => {
        resolve({ server, port: candidatePort });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && offset < maxAttempts - 1) {
          tryListen(offset + 1);
          return;
        }
        reject(err);
      });
    };

    tryListen(0);
  });
}

async function start() {
  try {
    if (client) {
      try {
        await initMongo();
        console.log('MongoDB connected.');
      } catch (mongoError) {
        console.error('MongoDB connection failed. Server will continue without contact storage.');
        console.error(mongoError.message);
      }
    }

    const { server, port: activePort } = await listenWithFallback(port);
    httpServer = server;

    if (activePort !== port) {
      console.warn(`Port ${port} is busy. Using port ${activePort} instead.`);
    }

    console.log(`Server running at http://localhost:${activePort}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  if (httpServer) httpServer.close();
  if (client) await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (httpServer) httpServer.close();
  if (client) await client.close();
  process.exit(0);
});
