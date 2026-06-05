const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameController');

/*
=================================================================================
  SECTION 1: BASIC CRUD (CREATE, READ, UPDATE, DELETE) OPERATIONS
  -------------------------------------------------------------------------------
  Ye section database mein games data par simple Operations (CRUD) perform karne ke 
  liye routes provide karta hai. Kisi specific game ko address karne ke liye hum 
  URL path ke dynamic parameters (Route Parameter, jaise :appid) use karte hain.
=================================================================================
*/

// GET /api/v1/games/:appid
// [READ SINGLE] Ek specific game ki complete details details page par display karne ke liye fetch karta hai.
router.get('/:appid', controller.getGameByAppId);

// POST /api/v1/games
// [CREATE] Naya game document database mein insert/create karta hai. Request body mein appid aur name mandatory hain.
router.post('/', controller.createGame);

// PUT /api/v1/games/:appid
// [UPDATE COMPLETE] Appid ke unique game record ko completely replace (overwrite) kar deta hai.
router.put('/:appid', controller.replaceGame);

// PATCH /api/v1/games/:appid
// [UPDATE PARTIAL] Game ke sirf wahi key-values update karta hai jo request body mein send kiye gaye hain.
router.patch('/:appid', controller.updateGame);

// DELETE /api/v1/games/:appid
// [DELETE] Game document ko permanently delete kar deta hai.
router.delete('/:appid', controller.deleteGame);

// GET /api/v1/games/exists/:appid
// [STATUS CHECK] Check karta hai ki dynamic :appid wala game database mein active exist karta hai ya nahi.
router.get('/exists/:appid', controller.checkGameExists);

// GET /api/v1/games/:appid/summary
// [READ SHORT] UI card ya tooltips display karne ke liye game ki brief detail fetch karta hai (name, dev, publisher, price).
router.get('/:appid/summary', controller.getGameSummary);

// GET /api/v1/games/:appid/history
// [AUDIT LOG] Game record update history (jo change logs database array history mein track hue the) fetch karta hai.
router.get('/:appid/history', controller.getGameHistory);

// PATCH /api/v1/games/:appid/archive
// [ARCHIVE / SOFT-DELETE] Game record ko archive status set karke visible query search se temporary hide karta hai.
router.patch('/:appid/archive', controller.archiveGame);

// PATCH /api/v1/games/:appid/restore
// [RESTORE ARCHIVED] Archived game ko active pool mein restore/re-activate karta hai.
router.patch('/:appid/restore', controller.restoreGame);

// GET /api/v1/games/:appid/related
// [RECOMMENDATIONS] Same genre matching database logic utilize karke related games/suggestions load karta hai.
router.get('/:appid/related', controller.getRelatedGames);


/*
=================================================================================
  SECTION 2: QUERY PARAMETER FILTERS (e.g. ?genre=action&minPrice=10)
  -------------------------------------------------------------------------------
  🚨 BEGINNER NOTE (IMPORTANT CONCEPT):
  Express.js mein, Query Parameters (jo URL mein '?' ke baad aate hain) ke liye 
  humein alag se koi route specify karne ki zaroorat nahi hoti!
  
  Jaise agar URL hai "/api/v1/games?genre=action" toh:
  - Route path sirf "/" (ya "/api/v1/games") hi match hota hai.
  - Express.js query params ko automatic parse karke humein controller ke andar 
    "req.query" object (jaise req.query.genre) mein de deta hai.
  - Isiliye routes file mein sirf ek line "router.get('/', controller.getGames);" hai, 
    par yahi single line upar likhe sabhi 12 query params ko automatically handle kar leti hai!
  
  Example URLs (Sabhi isi single '/' route par request bhejte hain):
  - /api/v1/games?genre=action (Filter games by genre)
  - /api/v1/games?developer=valve (Filter games by developer)
  - /api/v1/games?publisher=ea (Filter games by publisher)
  - /api/v1/games?platform=windows (Filter games by platform)
  - /api/v1/games?tag=multiplayer (Filter games using tags)
  - /api/v1/games?minPrice=10 (Filter games using minimum price)
  - /api/v1/games?maxPrice=50 (Filter games using maximum price)
  - /api/v1/games?rating=9 (Filter games using ratings - scales 1-10 to 1-100)
  - /api/v1/games?releaseYear=2024 (Filter games using release year)
  - /api/v1/games?discount=true (Filter discounted games)
  - /api/v1/games?multiplayer=true (Filter multiplayer games)
  - /api/v1/games?freeToPlay=true (Filter free-to-play games)
=================================================================================
*/

// GET /api/v1/games
// Yahi ek simple GET request '/' query parameters (?genre=action, ?price=10 etc.) ko parse karne ke liye Controller function (controller.getGames) ko call karti hai.
router.get('/', controller.getGames);


/*
=================================================================================
  SECTION 3: ROUTE PARAMETER FILTERS (e.g. /genre/:genre, /price/:price)
  -------------------------------------------------------------------------------
  Route parameters tab use hote hain jab filter query string ke roop mein nahi, 
  balki directly url path ka subfolder element banakar design kiya gaya ho.
  Beginner logic:
  - Dynamic route parameters ko controller req.params ke use se read karta hai.
  - Custom endpoint separation maintain karne ke liye design kiya gaya hai.
=================================================================================
*/

// GET /api/v1/games/genre/:genre
// Dynamic genre path (jaise action, rpg, adventure) ke compatible list returns karta hai.
router.get('/genre/:genre', controller.getGamesByGenre);

// GET /api/v1/games/developer/:developer
// Dynamic developer name match query.
router.get('/developer/:developer', controller.getGamesByDeveloper);

// GET /api/v1/games/publisher/:publisher
// Dynamic publisher name match query.
router.get('/publisher/:publisher', controller.getGamesByPublisher);

// GET /api/v1/games/platform/:platform
// Dynamic platform string (windows, mac, linux) checks compatible list.
router.get('/platform/:platform', controller.getGamesByPlatform);

// GET /api/v1/games/tag/:tag
// Specific game tag list match filters.
router.get('/tag/:tag', controller.getGamesByTag);

// GET /api/v1/games/release-year/:year
// Specific year (jaise 2023, 2024) ke compatibility list check karta hai.
router.get('/release-year/:year', controller.getGamesByReleaseYear);

// GET /api/v1/games/rating/:rating
// Specific minimum rating benchmark filter.
router.get('/rating/:rating', controller.getGamesByRating);

// GET /api/v1/games/price/:price
// Explicit range check values filter (e.g., "free", "0-500", "500-1000", "1000-above").
router.get('/price/:price', controller.getGamesByPrice);

// GET /api/v1/games/feature/:feature
// Dynamic feature parameters filter list (jaise coop, achievements, single-player).
router.get('/feature/:feature', controller.getGamesByFeature);

// GET /api/v1/games/filter/:filterType
// Presets based filtering routes (e.g. /filter/free-to-play, /filter/top-rated, /filter/horror, etc.)
router.get('/filter/:filterType', controller.getGamesByFilterType);



/*
=================================================================================
  SECTION 4: GAME INFORMATION & SUB-RESOURCES (TECHNICAL & SOCIAL DETAILS)
  -------------------------------------------------------------------------------
  Ye endpoints specific game ke sub-arrays/relational data resources fetch karne 
  ke liye design kiye gaye hain. Jaise game reviews, system specs, trailers, patches, etc.
=================================================================================
*/

// GET /api/v1/games/:appid/screenshots
// Game screenshot slider links collection fetch.
router.get('/:appid/screenshots', controller.getScreenshots);

// GET /api/v1/games/:appid/trailers
// Video gameplay trailer links collection fetch.
router.get('/:appid/trailers', controller.getTrailers);

// --- USER REVIEWS SECTION ---
// GET /api/v1/games/:appid/reviews - User comments & feedback list page query.
router.get('/:appid/reviews', controller.getReviews);

// POST /api/v1/games/:appid/reviews - Naya rating feedback comment record create/save logic.
router.post('/:appid/reviews', controller.addReview);

// PATCH /api/v1/games/:appid/reviews/:reviewId - Purane review content edit details update operations.
router.patch('/:appid/reviews/:reviewId', controller.updateReview);

// DELETE /api/v1/games/:appid/reviews/:reviewId - User review document remove.
router.delete('/:appid/reviews/:reviewId', controller.deleteReview);

// --- TECHNICAL REQUIREMENTS & METRICS ---
// GET /api/v1/games/:appid/system-requirements - Minimum OS memory specs fetch.
router.get('/:appid/system-requirements', controller.getSystemRequirements);

// GET /api/v1/games/:appid/dlc - Extra downloadable content/DLCs listing check.
router.get('/:appid/dlc', controller.getDLC);

// GET /api/v1/games/:appid/achievements - Unlocked badges list metrics.
router.get('/:appid/achievements', controller.getAchievements);

// GET /api/v1/games/:appid/leaderboards - Top scoring players board listings metrics.
router.get('/:appid/leaderboards', controller.getLeaderboards);

// GET /api/v1/games/:appid/updates - Patch list descriptions log check.
router.get('/:appid/updates', controller.getUpdates);

// GET /api/v1/games/:appid/news - Developer bulletins feed lists check.
router.get('/:appid/news', controller.getNews);

module.exports = router;
