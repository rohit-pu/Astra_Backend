import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send('ok');
});

// Authentication routes
router.use('/auth', authRoutes);

export default router;

