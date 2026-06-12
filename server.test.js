const request = require('supertest');
const fs = require('fs');

jest.mock('fs');

let mockApp;

jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  return function mockExpress() {
    mockApp = actualExpress();
    // Override listen to avoid binding to a port
    mockApp.listen = jest.fn((port, host, callback) => {
      if (typeof host === 'function') {
        callback = host;
        host = undefined;
      }
      if (callback) callback();
      return { close: jest.fn() };
    });
    return mockApp;
  };
});

// Load the server module – this populates mockApp with all routes
require('./server');

describe('Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should inject Pico.css link into the HTML', async () => {
      const originalHtml = '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>';
      fs.readFile.mockImplementationOnce((path, encoding, callback) => {
        callback(null, originalHtml);
      });

      const response = await request(mockApp)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);

      // Verify the Pico.css link appears before the closing head tag
      expect(response.text).toContain('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">');
      const headCloseIndex = response.text.indexOf('</head>');
      const picoIndex = response.text.indexOf('pico.min.css');
      expect(picoIndex).toBeLessThan(headCloseIndex);
    });

    it('should return 500 when index.html cannot be read', async () => {
      fs.readFile.mockImplementationOnce((path, encoding, callback) => {
        callback(new Error('file not found'), null);
      });

      await request(mockApp)
        .get('/')
        .expect(500, 'Internal Server Error');
    });
  });

  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      await request(mockApp)
        .get('/health')
        .expect(200, { status: 'ok' });
    });
  });

  describe('POST /reverse', () => {
    it('should reverse the provided text', async () => {
      const payload = { text: 'hello' };
      await request(mockApp)
        .post('/reverse')
        .send(payload)
        .expect(200, { reversed: 'olleh' });
    });

    it('should return 400 when text field is missing', async () => {
      await request(mockApp)
        .post('/reverse')
        .send({})
        .expect(400, { error: 'text field must be a string' });
    });

    it('should return 400 when text field is not a string', async () => {
      const payload = { text: 123 };
      await request(mockApp)
        .post('/reverse')
        .send(payload)
        .expect(400, { error: 'text field must be a string' });
    });

    it('should reverse an empty string to an empty string', async () => {
      const payload = { text: '' };
      await request(mockApp)
        .post('/reverse')
        .send(payload)
        .expect(200, { reversed: '' });
    });
  });

  describe('Static file serving', () => {
    it('should not inject CSS into non-root static requests', async () => {
      // Since there is no file, the static middleware will return 404.
      // The important thing is that it does not return the modified root HTML.
      const response = await request(mockApp)
        .get('/any-static-file.txt')
        .expect(404);

      expect(response.text).not.toContain('pico.min.css');
    });
  });
});