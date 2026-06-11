document.getElementById('reverseButton').addEventListener('click', async () => {
  const text = document.getElementById('textInput').value;
  const resultEl = document.getElementById('result');

  if (!text.trim()) {
    resultEl.textContent = 'Please enter some text.';
    return;
  }

  try {
    const response = await fetch('/reverse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.json();
      resultEl.textContent = 'Error: ' + (err.error || 'Unknown error');
      return;
    }

    const data = await response.json();
    resultEl.textContent = 'Reversed: ' + data.reversed;
  } catch (err) {
    resultEl.textContent = 'Network error: ' + err.message;
  }
});
