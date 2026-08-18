# CodePad — Online IDE starter

A small, responsive browser IDE for JavaScript, Python, C++, and Java. It uses Monaco for editing and sends code to a Piston execution service, so the server never executes visitor code directly.

## Run locally

1. Install Node.js 18 or later.
2. In this folder, run `npm install` (on Windows systems that block PowerShell scripts, use `npm.cmd install`).
3. Run `npm start` (or `npm.cmd start` in the same Windows case).
4. Open `http://localhost:3000`.

## Production note

The default Piston endpoint is a public community service. For a real deployment, host Piston yourself (or use a managed sandbox provider), set `PISTON_API_URL` to it, add authentication/rate limiting, and avoid sending secrets through the editor.
