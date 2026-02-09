import dotenv from 'dotenv';

dotenv.config();

import { startBot } from './bot/client.js';
import { startDashboard } from './dashboard/app.js';
import { connectMongo } from './mongo/connect.js';

const PORT = process.env.PORT || 10000;

async function main() {
  await connectMongo(process.env.MONGODB_URI);

  await Promise.all([
    startBot(),
    startDashboard({ port: PORT })
  ]);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
