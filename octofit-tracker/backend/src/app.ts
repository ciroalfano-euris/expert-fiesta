import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/api.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/', (_request, response) => response.json({
    service: 'OctoFit API',
    health: '/health',
    endpoints: {
      activities: '/api/activities',
      teams: '/api/teams',
      leaderboard: '/api/leaderboard',
      workoutSuggestions: '/api/workouts/suggestions/:userEmail',
    },
  }));
  app.get('/health', (_request, response) => response.json({ ok: true }));
  app.use('/api', apiRouter);
  app.use((error: Error & { status?: number }, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(error.status ?? 500).json({ error: error.message });
  });
  return app;
}
