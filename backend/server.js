const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ["https://pokemaine1.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["https://pokemaine1.netlify.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Load data from db.json
let db = {};
const loadDb = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    db = JSON.parse(data);
    console.log('Database loaded successfully');
  } catch (error) {
    console.error('Error loading database:', error);
    db = { pokemon: [], teams: [], battles: [], decks: [] };
  }
};

const saveDb = async () => {
  try {
    await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
};

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Pokemon routes
app.get('/api/pokemon', async (req, res) => {
  try {
    await loadDb();
    res.json(db.pokemon || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pokemon' });
  }
});

app.get('/api/pokemon/:id', async (req, res) => {
  try {
    await loadDb();
    const pokemon = db.pokemon?.find(p => p.id === parseInt(req.params.id));
    if (pokemon) {
      res.json(pokemon);
    } else {
      res.status(404).json({ error: 'Pokemon not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pokemon' });
  }
});

app.post('/api/pokemon', async (req, res) => {
  try {
    await loadDb();
    const newPokemon = req.body;
    db.pokemon = db.pokemon || [];
    db.pokemon.push(newPokemon);
    await saveDb();
    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pokemon' });
  }
});

// Teams routes
app.get('/teams', async (req, res) => {
  try {
    await loadDb();
    res.json(db.teams || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/teams', async (req, res) => {
  try {
    await loadDb();
    const newTeam = req.body;
    db.teams = db.teams || [];
    db.teams.push(newTeam);
    await saveDb();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.delete('/teams/:id', async (req, res) => {
  try {
    await loadDb();
    const id = parseInt(req.params.id);
    db.teams = db.teams.filter(team => team.id !== id);
    await saveDb();
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Battles routes
app.get('/battles', async (req, res) => {
  try {
    await loadDb();
    res.json(db.battles || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battles' });
  }
});

app.post('/battles', async (req, res) => {
  try {
    await loadDb();
    const newBattle = req.body;
    db.battles = db.battles || [];
    db.battles.push(newBattle);
    await saveDb();
    res.status(201).json(newBattle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create battle' });
  }
});

// Decks routes
app.get('/decks', async (req, res) => {
  try {
    await loadDb();
    res.json(db.decks || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

app.get('/decks/:id', async (req, res) => {
  try {
    await loadDb();
    const deck = db.decks?.find(d => d.id === parseInt(req.params.id));
    if (deck) {
      res.json(deck);
    } else {
      res.status(404).json({ error: 'Deck not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
});

app.post('/decks', async (req, res) => {
  try {
    await loadDb();
    const newDeck = req.body;
    db.decks = db.decks || [];
    db.decks.push(newDeck);
    await saveDb();
    res.status(201).json(newDeck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

app.patch('/decks/:id', async (req, res) => {
  try {
    await loadDb();
    const id = parseInt(req.params.id);
    const deckIndex = db.decks.findIndex(d => d.id === id);
    if (deckIndex === -1) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    db.decks[deckIndex] = { ...db.decks[deckIndex], ...req.body };
    await saveDb();
    res.json(db.decks[deckIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

app.delete('/decks/:id', async (req, res) => {
  try {
    await loadDb();
    const id = parseInt(req.params.id);
    db.decks = db.decks.filter(deck => deck.id !== id);
    await saveDb();
    res.status(200).json({ message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3004;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 