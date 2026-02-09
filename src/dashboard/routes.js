import { Router } from 'express';

import { getGlobalSettings, updateGlobalSettings } from '../services/settingsService.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await getGlobalSettings();
    res.render('index', { settings });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.post('/settings', async (req, res, next) => {
  try {
    const patch = {
      gifEnabled: req.body.gifEnabled === 'on',
      guessEnabled: req.body.guessEnabled === 'on',
      memoryEnabled: req.body.memoryEnabled === 'on'
    };

    await updateGlobalSettings(patch);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});
