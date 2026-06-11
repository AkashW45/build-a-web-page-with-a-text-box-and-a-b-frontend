// Test suite for public/script.js
const flushPromises = () => new Promise(setImmediate);

describe('Reverse text form', () => {
  beforeEach(() => {
    // Set up a fresh DOM environment
    document.body.innerHTML = `
      <input id="textInput" value="" />
      <button id="reverseButton">Reverse</button>
      <div id="result"></div>
    `;
    // Mock global fetch
    global.fetch = jest.fn();
    // Clear module cache so script runs again with fresh DOM
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('displays reversed text on successful fetch (happy path)', async () => {
    require('./script.js');
    const input = document.getElementById('textInput');
    const button = document.getElementById('reverseButton');
    const result = document.getElementById('result');

    input.value = 'hello';
    const mockJson = jest.fn().mockResolvedValueOnce({ reversed: 'olleh' });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: mockJson,
    });

    button.click();
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/reverse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    expect(result.textContent).toBe('Reversed: olleh');
  });

  test('displays error message when server returns an error (error path)', async () => {
    require('./script.js');
    const input = document.getElementById('textInput');
    const button = document.getElementById('reverseButton');
    const result = document.getElementById('result');

    input.value = 'test';
    const mockJson = jest.fn().mockResolvedValueOnce({ error: 'Invalid input' });
    fetch.mockResolvedValueOnce({
      ok: false,
      json: mockJson,
    });

    button.click();
    await flushPromises();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.textContent).toBe('Error: Invalid input');
  });

  test('shows generic error when server returns no error key (error path)', async () => {
    require('./script.js');
    const input = document.getElementById('textInput');
    const button = document.getElementById('reverseButton');
    const result = document.getElementById('result');

    input.value = 'test';
    const mockJson = jest.fn().mockResolvedValueOnce({});
    fetch.mockResolvedValueOnce({
      ok: false,
      json: mockJson,
    });

    button.click();
    await flushPromises();

    expect(result.textContent).toBe('Error: Unknown error');
  });

  test('shows network error message when fetch throws (error path)', async () => {
    require('./script.js');
    const input = document.getElementById('textInput');
    const button = document.getElementById('reverseButton');
    const result = document.getElementById('result');

    input.value = 'test';
    fetch.mockRejectedValueOnce(new Error('Network failure'));

    button.click();
    await flushPromises();

    expect(result.textContent).toBe('Network error: Network failure');
  });

  test('shows prompt when input is empty or whitespace (edge case)', async () => {
    require('./script.js');
    const input = document.getElementById('textInput');
    const button = document.getElementById('reverseButton');
    const result = document.getElementById('result');

    // Test with whitespace only
    input.value = '   ';
    button.click();
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect(result.textContent).toBe('Please enter some text.');

    // Reset mocks and test with empty string
    jest.clearAllMocks();
    input.value = '';
    button.click();
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect(result.textContent).toBe('Please enter some text.');
  });
});