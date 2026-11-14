import test from 'node:test';
import assert from 'node:assert/strict';

// Set test-only environment placeholders before importing config/app
process.env.GOOGLE_CLIENT_ID ??= 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-client-secret';
process.env.JWT_SECRET ??= 'test-jwt-secret';

const { buildApp } = await import('../src/app.js');

test('GET /api/health endpoint returns 200 { message: "ok" }', async () => {
  const app = await buildApp();

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.deepEqual(body, { message: 'ok' });
  } finally {
    await app.close();
  }
});
