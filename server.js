const path = require('path');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const QUESTIONS = require('./questions');

const PORT = process.env.PORT || 3000;
const PRESENTER_KEY = process.env.PRESENTER_KEY || crypto.randomBytes(3).toString('hex');
const PUBLIC_URL = process.env.PUBLIC_URL || ''; // ex. https://quiz-ia.onrender.com

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ---------- État du quiz (en mémoire) ----------
// phase : 'lobby' (attente) | 'open' (votes ouverts) | 'closed' (votes fermés) | 'reveal' (résultats)
const state = { index: -1, phase: 'lobby' };
const votes = QUESTIONS.map(() => new Map()); // clientId -> réponse

function baseUrl(req) {
  if (PUBLIC_URL) return PUBLIC_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return `${proto}://${req.headers.host}`;
}

function normalizeText(s) {
  return String(s).trim().replace(/\s+/g, ' ').slice(0, 40);
}

function tally(i) {
  const q = QUESTIONS[i];
  const v = votes[i];
  if (q.type === 'text') {
    const counts = new Map();
    for (const answer of v.values()) {
      const key = answer.toLowerCase();
      const entry = counts.get(key) || { word: answer, count: 0 };
      entry.count++;
      counts.set(key, entry);
    }
    return { total: v.size, words: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 60) };
  }
  const counts = q.options.map(() => 0);
  for (const answer of v.values()) counts[answer]++;
  return { total: v.size, counts };
}

// Ce que voient les participants : jamais la bonne réponse avant la révélation
function publicState() {
  const q = QUESTIONS[state.index];
  const base = { index: state.index, count: QUESTIONS.length, phase: state.phase };
  if (!q) return base;
  const question = { type: q.type, title: q.title, options: q.options, hint: q.hint };
  if (state.phase === 'reveal') {
    question.correct = q.correct;
    question.explanation = q.explanation;
  }
  return { ...base, question };
}

function presenterState() {
  const q = QUESTIONS[state.index];
  return {
    index: state.index,
    count: QUESTIONS.length,
    phase: state.phase,
    question: q || null,
    results: q ? tally(state.index) : null,
    participants: io.of('/').adapter.rooms.get('participants')?.size || 0,
  };
}

function participantId(s) {
  return String(s.handshake.auth?.clientId || s.id).slice(0, 64);
}

// Chaque participant reçoit l'état et son propre vote pour la question courante
function broadcast() {
  const pub = publicState();
  for (const [, s] of io.of('/').sockets) {
    if (!s.rooms.has('participants')) continue;
    s.emit('state', pub);
    s.emit('myvote', votes[state.index]?.get(participantId(s)) ?? null);
  }
  io.to('presenters').emit('presenter', presenterState());
}

// ---------- Routes ----------
app.use(express.static(path.join(__dirname, 'public')));

app.get('/presenter', (req, res) => {
  if (req.query.key !== PRESENTER_KEY) return res.status(403).send('Clé animateur invalide.');
  res.sendFile(path.join(__dirname, 'public', 'presenter.html'));
});

app.get('/qr.svg', async (req, res) => {
  const svg = await QRCode.toString(baseUrl(req), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  res.type('image/svg+xml').send(svg);
});

app.get('/join-url', (req, res) => res.json({ url: baseUrl(req) }));

// ---------- Temps réel ----------
io.on('connection', (socket) => {
  const isPresenter = socket.handshake.auth?.key === PRESENTER_KEY;

  if (isPresenter) {
    socket.join('presenters');
    socket.emit('presenter', presenterState());

    socket.on('control', (action) => {
      if (action === 'next' && state.index < QUESTIONS.length - 1) {
        state.index++;
        state.phase = 'open';
      } else if (action === 'prev' && state.index > 0) {
        state.index--;
        state.phase = 'reveal';
      } else if (action === 'open' && state.index >= 0) {
        state.phase = 'open';
      } else if (action === 'close' && state.index >= 0) {
        state.phase = 'closed';
      } else if (action === 'reveal' && state.index >= 0) {
        state.phase = 'reveal';
      } else if (action === 'clear' && state.index >= 0) {
        votes[state.index].clear();
      } else if (action === 'restart') {
        votes.forEach((v) => v.clear());
        state.index = -1;
        state.phase = 'lobby';
      }
      broadcast();
    });
    return;
  }

  // Participant
  const clientId = participantId(socket);
  socket.join('participants');
  socket.emit('state', publicState());
  socket.emit('myvote', votes[state.index]?.get(clientId) ?? null);
  io.to('presenters').emit('presenter', presenterState());

  socket.on('vote', ({ index, answer }) => {
    const q = QUESTIONS[index];
    if (!q || index !== state.index || state.phase !== 'open') return;
    let value;
    if (q.type === 'text') {
      value = normalizeText(answer);
      if (!value) return;
    } else {
      value = Number(answer);
      if (!Number.isInteger(value) || value < 0 || value >= q.options.length) return;
    }
    votes[index].set(clientId, value);
    socket.emit('myvote', value);
    io.to('presenters').emit('presenter', presenterState());
  });

  socket.on('disconnect', () => io.to('presenters').emit('presenter', presenterState()));
});

server.listen(PORT, () => {
  console.log(`Quiz prêt sur le port ${PORT}`);
  console.log(`Vue animateur : /presenter?key=${PRESENTER_KEY}`);
});
