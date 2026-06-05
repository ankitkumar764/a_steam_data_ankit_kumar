const Game = require('../models/gameModel');
const { enrichGameData } = require('./gameController');

/*
=================================================================================
  SEARCH CONTROLLER - UNIFIED KEYWORD SEARCH LOGIC
  -------------------------------------------------------------------------------
  Ye controller `/api/v1/search/games?q=<term>` endpoint ke business logic ko 
  handle karta hai.
  
  Beginner explanation (How it works):
  1. User request ke query string mein 'q' parameter bhejta hai (e.g. ?q=elden).
  2. Hum `req.query.q` se is term ko read karte hain aur dynamic Regex search pattern banate hain.
  3. Database query mein `$or` operator ka use karke is single query ko multiple fields 
     (name, genres, categories, developer, publisher, tags) par check karte hain.
  4. Isse user chahe title search kare ("cyberpunk") ya fir type/genres ("multiplayer", "horror", "co-op", "vr"),
     sare results dynamic single database call mein return ho jate hain!
  5. Search results ko clean format mein pagination support (page, limit) ke saath 
     enrich karke (virtual ratings, discounts set karke) return karte hain.
=================================================================================
*/

const searchGames = async (req, res) => {
  try {
    // 1. Query parameter 'q' read karte hain aur extra spaces clean karte hain.
    const query = String(req.query.q || '').trim();
    
    // Pagination parameters read karte hain.
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);

    // Agar query parameters empty/blank hai toh 400 Bad Request return karte hain.
    if (!query) {
      return res.status(400).json({ message: 'Search query parameter "q" required hai' });
    }

    // 2. Case-insensitive Regex pattern create karte hain.
    // 'i' option ka matlab hai ki Action aur action dono match honge.
    const searchRegex = { $regex: query, $options: 'i' };

    // 3. MongoDB Filter object construct karte hain.
    // Hum multiple fields par check lagate hain taaki dynamic themes match ho sakein:
    const filter = {
      $or: [
        { name: searchRegex },             // Title/Name matching (e.g. "cyberpunk", "elden")
        { genres: searchRegex },           // Genre matching (e.g. "indie", "horror", "survival")
        { categories: searchRegex },       // Categories/Features matching (e.g. "multiplayer", "co-op", "controller")
        { developer: searchRegex },        // Developer matching (e.g. "valve")
        { publisher: searchRegex },        // Publisher matching (e.g. "ea")
        { tags: searchRegex }              // Custom tags array matching
      ]
    };

    // 4. Total count fetch karte hain pagination response structure ke liye.
    const total = await Game.countDocuments(filter);

    // 5. Database search query chalate hain sorting aur skipping (pagination) ke saath.
    const games = await Game.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 6. Har matched game record ko complete fallback parameters (ratings, virtual discounts) se enrich karte hain.
    const enrichedGames = games.map(game => enrichGameData(game));

    // 7. Success JSON response send karte hain.
    res.json({
      query,
      page,
      limit,
      total,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ 
      message: 'Error performing games search', 
      error: e.message 
    });
  }
};

module.exports = {
  searchGames
};
