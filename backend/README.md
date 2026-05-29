# Skill Issue Backend

Backend for Skill Issue — Peer Coding & Skill Exchange Platform.

Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies:

```bash
npm install
```

3. Start server:

```bash
npm run dev
```

4. Seed sample data:

```bash
npm run seed
```

Notes
- Socket.io instance is exposed via `config/socket.js`.
- Uploads are stored locally in `uploads/`.
