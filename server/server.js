const express = require('express');
const cors = require('cors');
const { json } = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://your-netlify-app.netlify.app' // Replace with your Netlify URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize empty arrays if they don't exist in db.json
const initializeDB = () => {
  const dbPath = path.join(__dirname, '../db.json');
  let db = { teams: [], battles: [], favorites: [], decks: [] };
  
  try {
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    // Ensure all required collections exist
    db.teams = db.teams || [];
    db.battles = db.battles || [];
    db.favorites = db.favorites || [];
    db.decks = db.decks || [];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on server start
initializeDB();

// Teams endpoints
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

// Battles endpoints
app.get('/battles', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  res.json(db.battles || []);
});

app.post('/battles', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const newBattle = { ...req.body, id: Date.now().toString() };
  db.battles = db.battles || [];
  db.battles.push(newBattle);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json(newBattle);
});

// Favorites endpoints
app.get('/favorites', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  res.json(db.favorites || []);
});

app.post('/favorites', (req, res) => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'));
  const newFavorite = { ...req.body, id: Date.now().toString() };
  db.favorites = db.favorites || [];
  db.favorites.push(newFavorite);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(db, null, 2));
  res.json(newFavorite);
});

// Decks endpoints
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