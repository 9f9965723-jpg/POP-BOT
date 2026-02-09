import mongoose from 'mongoose';

export async function connectMongo(mongoUri) {
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    console.log('MongoDB connected');
  } catch (err) {
    const msg = String(err?.message || err);

    if (msg.toLowerCase().includes('authentication failed') || msg.toLowerCase().includes('bad auth')) {
      throw new Error(
        [
          'MongoDB authentication failed (bad auth).',
          'Fix checklist:',
          '1) Ensure MONGODB_URI username/password are correct.',
          '2) URL-encode special characters in the password (e.g. @ becomes %40).',
          '3) In Atlas: Database Access -> user must have access to the target database.',
          '4) In Atlas: Network Access -> allow Render egress IPs or temporarily 0.0.0.0/0.',
          '5) Ensure your connection string includes the correct database name and authSource if needed.'
        ].join('\n')
      );
    }

    throw err;
  }
}
