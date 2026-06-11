# Text Reverser

A simple Node.js/Express web application that serves a static page at `/` and provides a REST API to reverse text.

## Features

- **Home page:** a form with a text input and a "Reverse" button.
- **Reverse endpoint:** `POST /reverse` — expects `{"text": "..."}` and returns `{"reversed": "..."}`.
- **Health check:** `GET /health` returns `{"status": "ok"}`.

## Running Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.

## Platform Compliance

- Listens on **TCP port 8000** bound to `0.0.0.0`.
- `GET /health` returns 200 with JSON body `{"status":"ok"}` — no authentication or external dependencies.
- Frontend is served as static files from the same Express server on the same port (single-container pattern).
- All API calls use relative paths (e.g., `fetch('/reverse')`).
- The root path `/` serves the HTML page.

## API

### `GET /health`

Returns a simple health check response.

**Response:** 200 OK
```json
{"status": "ok"}
```

### `POST /reverse`

Reverses the provided text.

**Request body:**
```json
{"text": "hello"}
```

**Response:** 200 OK
```json
{"reversed": "olleh"}
```

**Error:** 400 if `text` is missing or not a string.
```json
{"error": "text field must be a string"}
```
