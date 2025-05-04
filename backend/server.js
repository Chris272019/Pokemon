const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();
const httpServer = createServer(app);

// Configure CORS
const allowedOrigins = [
  'https://pokemaine1.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Load data from db.json
let db = {
  pokemon: [],
  teams: [],
  battles: [],
  decks: []
};

const loadDb = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    const parsedData = JSON.parse(data);
    db = {
      pokemon: parsedData.pokemon || [],
      teams: parsedData.teams || [],
      battles: parsedData.battles || [],
      decks: parsedData.decks || []
    };
    console.log('Database loaded successfully:', Object.keys(db));
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No database file found, initializing with empty collections');
      await saveDb();
      return true;
    }
    console.error('Error loading database:', error);
    return false;
  }
};

const saveDb = async () => {
  try {
    await fs.writeFile(
      path.join(__dirname, 'db.json'),
      JSON.stringify(db, null, 2)
    );
    console.log('Database saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
};

// Initialize database
(async () => {
  console.log('Initializing database...');
  await loadDb();
  console.log('Database initialized with collections:', Object.keys(db));
})();

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = {
    initialized: Object.keys(db).length > 0,
    collections: Object.keys(db),
    counts: Object.fromEntries(
      Object.entries(db).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])
    )
  };

  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
});

// Test route for diagnostics
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API test route is working' });
});

// Pokemon routes
app.get('/api/pokemon', async (req, res) => {
  try {
    await loadDb();
    res.json(db.pokemon || []);
  } catch (error) {
    console.error('Error fetching pokemon:', error);
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
    console.error('Error fetching pokemon:', error);
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
    console.error('Error creating pokemon:', error);
    res.status(500).json({ error: 'Failed to create pokemon' });
  }
});

// Teams routes
app.get('/teams', async (req, res) => {
  console.log('GET /teams - Fetching teams');
  try {
    await loadDb();
    const teams = db.teams || [];
    console.log(`Found ${teams.length} teams`);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.post('/teams', async (req, res) => {
  console.log('POST /teams - Adding new team member');
  try {
    await loadDb();
    const newTeam = req.body;
    console.log('New team member:', newTeam);
    db.teams = db.teams || [];
    db.teams.push(newTeam);
    await saveDb();
    console.log('Team member added successfully');
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
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
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Battles routes
app.get('/api/battles', async (req, res) => {
  console.log('GET /api/battles - Fetching battles');
  try {
    await loadDb();
    const battles = db.battles || [];
    console.log(`Found ${battles.length} battles`);
    res.json(battles);
  } catch (error) {
    console.error('Error fetching battles:', error);
    res.status(500).json({ error: 'Failed to fetch battles' });
  }
});

app.post('/api/battles', async (req, res) => {
  try {
    await loadDb();
    const newBattle = req.body;
    db.battles = db.battles || [];
    db.battles.push(newBattle);
    await saveDb();
    res.status(201).json(newBattle);
  } catch (error) {
    console.error('Error creating battle:', error);
    res.status(500).json({ error: 'Failed to create battle' });
  }
});

// Decks routes
app.get('/decks', async (req, res) => {
  try {
    await loadDb();
    res.json(db.decks || []);
  } catch (error) {
    console.error('Error fetching decks:', error);
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
    console.error('Error fetching deck:', error);
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
    console.error('Error creating deck:', error);
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
    console.error('Error updating deck:', error);
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
    console.error('Error deleting deck:', error);
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

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Add 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 3004;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 