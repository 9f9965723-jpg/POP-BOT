import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';

import { dashboardRouter } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startDashboard({ port }) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).send('ok'));

  app.use('/', dashboardRouter);

  await new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Dashboard listening on :${port}`);
      resolve();
    });
  });
}
