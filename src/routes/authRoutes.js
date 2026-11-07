import { Router } from 'express';
import passport from 'passport';
import { config } from '../config/index.js';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Google OAuth callback
router.get(
  '/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(`${config.frontendUrl}/login?error=access_denied`);
      }
      req.user = user;
      return authController.googleCallback(req, res, next);
    })(req, res, next);
  }
);

// Current user profile
router.get('/me', requireAuth, authController.me);

// Log out and clear session cookie
router.post('/logout', authController.logout);

export default router;

