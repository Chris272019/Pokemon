const express = require('express');
const cors = require('cors');
const { json } = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-netlify-app-url.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/teams', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  res.json(db.teams || []);
});

app.post('/teams', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const newTeam = { ...req.body, id: Date.now().toString() };
  db.teams = db.teams || [];
  db.teams.push(newTeam);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json(newTeam);
});

app.delete('/teams/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  db.teams = db.teams.filter(team => team.id !== req.params.id);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json({ message: 'Team deleted successfully' });
});

app.get('/decks', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  res.json(db.decks || []);
});

app.post('/decks', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const newDeck = { ...req.body, id: Date.now().toString() };
  db.decks = db.decks || [];
  db.decks.push(newDeck);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json(newDeck);
});

app.get('/decks/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const deck = db.decks.find(d => d.id === req.params.id);
  if (deck) {
    res.json(deck);
  } else {
    res.status(404).json({ message: 'Deck not found' });
  }
});

app.patch('/decks/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const deckIndex = db.decks.findIndex(d => d.id === req.params.id);
  if (deckIndex !== -1) {
    db.decks[deckIndex] = { ...db.decks[deckIndex], ...req.body };
    fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
    res.json(db.decks[deckIndex]);
  } else {
    res.status(404).json({ message: 'Deck not found' });
  }
});

app.delete('/decks/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  db.decks = db.decks.filter(deck => deck.id !== req.params.id);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json({ message: 'Deck deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 