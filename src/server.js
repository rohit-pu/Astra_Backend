import { buildApp } from './app.js';
import { config } from './config/index.js';

const app = await buildApp();

try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Astra backend server listening on port ${config.port}`);
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
}

export default app;
