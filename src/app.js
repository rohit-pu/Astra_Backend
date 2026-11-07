import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { config } from './config/index.js';
import './config/passport.js';
import routes from './routes/index.js';

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/', routes);

export default app;

