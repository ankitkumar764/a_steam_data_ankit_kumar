const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search endpoint mapped from route-rule.md
router.get('/games', searchController.searchGames);

module.exports = router;
