const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Mock express to avoid binding to a real port
jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  const mockApp = actualExpress();

  // Prevent actual listening
  mockApp.listen = jest.fn((port, ...args) => ({ close: jest.fn() }));

  // Return a mock function that behaves like express()
  const mockExpress = jest.fn(() => mockApp);

  // Forward static methods (needed by express.static, express.json, etc.)
  mockExpress.static = actualExpress.static;
  mockExpress.json = actualExpress.json;
  mockExpress.response = actualExpress.response;
  mockExpress.request = actualExpress.request;

  return mockExpress;
});

// Now retrieve the mock app instance
const express = require('express');
const app = express();

// Load server – all routes/middleware will be attached to our app
require('./server');

describe('Express server', () => {
  beforeAll(() => {
    // Create a minimal public folder for the root / route
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    fs.writeFileSync(
      path.join(publicDir, 'index.html'),
      '<html><body>Test</body></html>'
    );
  });

  afterAll(() => {
    // Clean up the public folder
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
      fs.rmSync(publicDir, { recursive: true, force: true });
    }
  });

  test('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /reverse with valid text returns reversed string', async () => {
    const res = await request(app)
      .post('/reverse')
      .send({ text: 'hello' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reversed: 'olleh' });
  });

  test('POST /reverse with missing text returns 400', async () => {
    const res = await request(app)
      .post('/reverse')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'text field must be a string' });
  });

  test('POST /reverse with non-string text returns 400', async () => {
    const res = await request(app)
      .post('/reverse')
      .send({ text: 12345 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'text field must be a string' });
  });

  test('POST /reverse with empty string returns reversed empty string', async () => {
    const res = await request(app)
      .post('/reverse')
      .send({ text: '' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reversed: '' });
  });

  test('GET / serves the index.html page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html>');
  });
});