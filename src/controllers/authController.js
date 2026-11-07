import { config } from '../config/index.js';
import { findActiveUserByEmail } from '../services/userService.js';
import { generateToken } from '../services/authService.js';

export async function googleCallback(req, res) {
  try {
    const email = req.user?.emails?.[0]?.value?.toLowerCase();

    if (!email) {
      return res.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }

    // Only active users in the database are allowed to sign in
    const user = await findActiveUserByEmail(email);

    if (!user) {
      return res.redirect(`${config.frontendUrl}/login?error=access_denied`);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.cookie('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.redirect(`${config.frontendUrl}/dashboard`);
  } catch (error) {
    console.error('Error during authentication callback:', error);
    return res.redirect(`${config.frontendUrl}/login?error=access_denied`);
  }
}

export function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });
}

export function logout(req, res) {
  res.clearCookie('session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction
  });

  return res.json({ message: 'Logged out successfully' });
}

