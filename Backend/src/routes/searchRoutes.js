const express = require('express');
const router = express.Router();
const controller = require('../controllers/searchController');

/*
=================================================================================
  SEARCH ROUTES MODULE
  -------------------------------------------------------------------------------
  Ye route module games search query execution ko search controller ke actions 
  par map karta hai.
  
  Beginner logic:
  - Route standard `/` register hota hai, par is router ko `app.js` ke andar 
    `/api/v1/search/games` base path par mount kiya jata hai.
  - Path parameters ki jagah yahan query parameters (`?q=keyword`) use hote hain.
  - query parameters URL mein dynamic values bhejte hain bina naye path endpoints banaye.
  
  Example URLs (All mapped to this file's root route GET `/`):
  - GET /api/v1/search/games?q=elden
  - GET /api/v1/search/games?q=cyberpunk
  - GET /api/v1/search/games?q=multiplayer
  - GET /api/v1/search/games?q=horror
  - GET /api/v1/search/games?q=survival
  - GET /api/v1/search/games?q=vr
  - GET /api/v1/search/games?q=anime
  - GET /api/v1/search/games?q=controller
  - GET /api/v1/search/games?q=co-op
  - GET /api/v1/search/games?q=indie
=================================================================================
*/

// GET /api/v1/search/games
// Main search query endpoint jo req.query.q read karke relevant database search results return karta hai.
router.get('/', controller.searchGames);

module.exports = router;
