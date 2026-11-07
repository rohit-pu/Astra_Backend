import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './index.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl
    },
    (accessToken, refreshToken, profile, done) => {
      // Pass the OAuth profile to the callback handler
      return done(null, profile);
    }
  )
);

export default passport;

