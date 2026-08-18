const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const pistonUrl = (process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston').replace(/\/$/, '');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const languages = {
  javascript: { language: 'javascript', version: '*', filename: 'main.js' },
  python: { language: 'python', version: '*', filename: 'main.py' },
  cpp: { language: 'c++', version: '*', filename: 'main.cpp' },
  java: { language: 'java', version: '*', filename: 'Main.java' }
};

app.get('/api/languages', (_req, res) => res.json(Object.keys(languages)));

app.post('/api/run', async (req, res) => {
  const { language, code, stdin = '' } = req.body || {};
  const selected = languages[language];

  if (!selected || typeof code !== 'string' || typeof stdin !== 'string') {
    return res.status(400).json({ error: 'Please provide a supported language, code, and optional input.' });
  }
  if (code.length > 50_000 || stdin.length > 10_000) {
    return res.status(413).json({ error: 'Code or input is too large for this playground.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${pistonUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: selected.language,
        version: selected.version,
        files: [{ name: selected.filename, content: code }],
        stdin,
        compile_timeout: 10_000,
        run_timeout: 5_000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      })
    });

    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.message || 'The code runner could not complete your request.' });
    res.json(result);
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The code runner took too long to respond.'
      : 'Could not reach the code runner. Check your internet connection or PISTON_API_URL.';
    res.status(502).json({ error: message });
  } finally {
    clearTimeout(timer);
  }
});

app.listen(port, () => console.log(`CodePad is running at http://localhost:${port}`));
