const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Express app banaya.
const app = express();

// Middleware lagaya:
// cors() se browser se dusre origin se request allow hoti hai.
// express.json() se JSON body parse hoti hai aur req.body milta hai.
app.use(cors());
app.use(express.json());

// Basic test route.
app.get('/', (req, res) => res.json({ message: 'Welcome to Steam Clone API' }));

// Route modules add kiye:
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/v1/games', require('./routes/gameRoutes'));
app.use('/api/v1/search/games', require('./routes/searchRoutes'));

module.exports = app;
