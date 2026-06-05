const Game = require('../models/gameModel');

/*
=================================================================================
  SECTION 1: UTILITIES & FALLBACK DATA ENRICHMENT (UTILITY MODULES)
  -------------------------------------------------------------------------------
  Ye section helper functions provide karta hai jo appid normalize karne aur database 
  se fetch kiye gaye raw game objects mein ratings, platforms, downloads, aur discounts 
  jaise dynamic fallback details fill karne mein kaam aate hain.
=================================================================================
*/

// parseAppId: string appid ko normalized string format mein convert karta hai.
// Agar invalid value aaye toh null return karega.
const parseAppId = (value) => {
  const trimmed = String(value || '').trim();
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) ? null : String(n);
};

// appid string ke roop mein store aur compare karte hain.
const findAppIdQuery = (appid) => ({ appid });

// enrichGameData: Game document ko check karke rating, downloads, platforms aur extra details 
// dynamically add karta hai agar database mein ye information missing hai (pre-loaded games ke liye).
const enrichGameData = (game) => {
  if (!game) return game;
  
  // Game document ko raw JavaScript object mein badalte hain taki changes modify kar sakein.
  const gameObj = game.toObject ? game.toObject() : game;
  
  const appidNum = parseInt(gameObj.appid, 10) || 0;
  const recommendationsNum = parseInt(gameObj.recommendations, 10) || 0;
  
  // 1. Rating fallback: recommendations ke hisaab se realistic rating (65-98) generate karte hain.
  if (!gameObj.rating) {
    if (recommendationsNum > 0) {
      gameObj.rating = Math.min(98, Math.max(65, 75 + (recommendationsNum % 24)));
    } else {
      gameObj.rating = 60 + (appidNum % 30);
    }
  }
  
  // 2. Downloads fallback: recommendations aur appid se realistic download number calculate karte hain.
  if (!gameObj.downloads) {
    gameObj.downloads = (recommendationsNum * 12) + (appidNum % 500) + 50;
  }
  
  // 3. Platforms fallback: categories text parse karte hain ya default value PC, Mac, Linux set karte hain.
  if (!gameObj.platforms || !gameObj.platforms.length) {
    const categoriesStr = String(gameObj.categories || '').toLowerCase();
    const platforms = ['windows']; // Har Steam game Windows support karta hai
    if (categoriesStr.includes('mac') || categoriesStr.includes('apple') || (appidNum % 4 === 0)) {
      platforms.push('mac');
    }
    if (categoriesStr.includes('linux') || categoriesStr.includes('steam deck') || (appidNum % 5 === 0)) {
      platforms.push('linux');
    }
    gameObj.platforms = platforms;
  }
  
  // 4. Features fallback: categories ko semicolon se split karke list banate hain.
  if (!gameObj.features || !gameObj.features.length) {
    if (gameObj.categories) {
      gameObj.features = gameObj.categories.split(';').map(f => f.trim()).filter(Boolean);
    } else {
      gameObj.features = ['Single-player'];
    }
  }
  
  // 5. Tags fallback: genres aur categories ko tags array mein merge karte hain.
  if (!gameObj.tags || !gameObj.tags.length) {
    const tagsSet = new Set();
    if (gameObj.genres) {
      const genreStr = typeof gameObj.genres === 'string' ? gameObj.genres : String(gameObj.genres);
      genreStr.split(';').forEach(g => tagsSet.add(g.trim()));
    }
    if (gameObj.features) {
      gameObj.features.forEach(f => tagsSet.add(f));
    }
    gameObj.tags = Array.from(tagsSet);
  }
  
  // 6. Screenshots fallback: mock screenshots links generate karte hain.
  if (!gameObj.screenshots || !gameObj.screenshots.length) {
    gameObj.screenshots = [
      `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop`
    ];
  }
  
  // 7. Trailers fallback: mock trailers video links.
  if (!gameObj.trailers || !gameObj.trailers.length) {
    gameObj.trailers = [
      `https://www.w3schools.com/html/mov_bbb.mp4`
    ];
  }
  
  // 8. Reviews fallback: reviews blank hone par default user reviews add karte hain.
  if (!gameObj.reviews || !gameObj.reviews.length) {
    gameObj.reviews = [
      {
        _id: `rev-${appidNum}-1`,
        userId: 'gamer_alok',
        rating: 5,
        reviewText: `Bilkul gazab game hai! Iska gameplay aur graphics solid hain. Highly recommended!`,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        _id: `rev-${appidNum}-2`,
        userId: 'pro_steamer',
        rating: 4,
        reviewText: `Acha game hai, story line badhiya hai. Lekin minor bugs hain jo patches se fix ho sakte hain.`,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];
  }
  
  // 9. System Requirements fallback: basic PC configurations specifications.
  if (!gameObj.systemRequirements) {
    gameObj.systemRequirements = {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i5-4460 / AMD FX-6300',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GTX 760 / AMD Radeon R7 260x with 2GB VRAM',
        storage: '25 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel Core i7-3770 / AMD FX-9590',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 with 6GB VRAM / AMD Radeon RX 480 with 8GB VRAM',
        storage: '25 GB available space (SSD recommended)'
      }
    };
  }
  
  // 10. DLC list fallback.
  if (!gameObj.dlcList || !gameObj.dlcList.length) {
    gameObj.dlcList = [
      { name: `${gameObj.name} - Sound Track Bundle`, price: 2.99, appid: `${appidNum + 1}` },
      { name: `${gameObj.name} - Elite Skins Pack`, price: 4.99, appid: `${appidNum + 2}` }
    ];
  }
  
  // 11. Achievements fallback.
  if (!gameObj.achievements || !gameObj.achievements.length) {
    gameObj.achievements = [
      { name: 'First Blood', description: 'Kill your first enemy in the game', unlocked: true },
      { name: 'Survivor', description: 'Survive for 1 hour without dying', unlocked: false },
      { name: 'Completionist', description: 'Unlock 100% of all achievements', unlocked: false }
    ];
  }
  
  // 12. Leaderboards fallback.
  if (!gameObj.leaderboards || !gameObj.leaderboards.length) {
    gameObj.leaderboards = [
      { rank: 1, username: 'GamerGod_99', score: 99990 },
      { rank: 2, username: 'ShadowBlade', score: 87450 },
      { rank: 3, username: 'NinjaSteam', score: 75000 }
    ];
  }
  
  // 13. Updates fallback.
  if (!gameObj.updates || !gameObj.updates.length) {
    gameObj.updates = [
      { version: 'v1.0.2', title: 'Stability Patch', description: 'Fixed crash issues on startup and optimized memory usage.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { version: 'v1.0.1', title: 'Launch Hotfix', description: 'Resolved audio delay issue and fixed spelling mistakes.', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
    ];
  }
  
  // 14. News fallback.
  if (!gameObj.news || !gameObj.news.length) {
    gameObj.news = [
      { title: `${gameObj.name} Is Now Live!`, description: 'We are thrilled to launch the game worldwide. Thank you for your support!', publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { title: 'Upcoming Summer DLC Announcement', description: 'Stay tuned for a brand new map and outfits coming this July!', publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ];
  }
  
  // 15. Discount details fallback:
  // Kuch games ko discounted mark karenge based on appid and price > 0.
  // Original price aur discount_percent determine karte hain.
  const priceNum = parseFloat(gameObj.price) || 0;
  if (priceNum > 0 && appidNum % 3 === 0) {
    gameObj.discount = true;
    gameObj.discount_percent = 10 + (appidNum % 80); // 10% se 89% ke beech ka discount
    // Original price calculate karenge (current price discount hone ke baad ki price hai)
    gameObj.original_price = parseFloat((priceNum / (1 - gameObj.discount_percent / 100)).toFixed(2));
  } else {
    gameObj.discount = false;
    gameObj.discount_percent = 0;
    gameObj.original_price = priceNum;
  }

  return gameObj;
};

/*
=================================================================================
  SECTION 2: QUERY PARAMETER FILTERS (MAIN LISTING ENDPOINT)
  -------------------------------------------------------------------------------
  Ye route query params (?genre=action, ?developer=valve, ?minPrice=10, etc.) read 
  karke dynamic database query construct karta hai.
  Beginner logic:
  - req.query property Express framework automatically fill karta hai.
  - Agar filter parameters present hon, toh hum unhe flat conditions array mein push 
    karte hain aur Mongoose query check ($and/$or/$expr) pass karte hain.
=================================================================================
*/

// GET /api/v1/games
// Yahan se game list milta hai. search, pagination aur different filters query params ke roop mein optional hain.
const getGames = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const filter = {};
    const conditions = [];

    // Agar search param hai toh name field mein match kare (case-insensitive).
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // archived parameter ko bhi support karte hain.
    if (req.query.archived === 'true' || req.query.archived === 'false') {
      filter.isArchived = req.query.archived === 'true';
    }

    // 1. Genre filter: check for case-insensitive match on genres string
    if (req.query.genre) {
      conditions.push({ genres: { $regex: String(req.query.genre).trim(), $options: 'i' } });
    }

    // 2. Developer filter: check for case-insensitive match on developer
    if (req.query.developer) {
      conditions.push({ developer: { $regex: String(req.query.developer).trim(), $options: 'i' } });
    }

    // 3. Publisher filter: check for case-insensitive match on publisher
    if (req.query.publisher) {
      conditions.push({ publisher: { $regex: String(req.query.publisher).trim(), $options: 'i' } });
    }

    // 4. Platform filter: compatible systems check (Windows, Mac, Linux)
    if (req.query.platform) {
      const platform = String(req.query.platform).trim().toLowerCase();
      if (platform === 'windows') {
        conditions.push({
          $or: [
            { platforms: { $regex: 'windows', $options: 'i' } },
            { platforms: { $exists: false } },
            { platforms: { $size: 0 } }
          ]
        });
      } else if (platform === 'mac') {
        conditions.push({
          $or: [
            { platforms: { $regex: 'mac', $options: 'i' } },
            {
              $and: [
                { $or: [{ platforms: { $exists: false } }, { platforms: { $size: 0 } }] },
                {
                  $or: [
                    { categories: { $regex: 'mac|apple', $options: 'i' } },
                    {
                      $expr: {
                        $eq: [ { $mod: [ { $toInt: "$appid" }, 4 ] }, 0 ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        });
      } else if (platform === 'linux') {
        conditions.push({
          $or: [
            { platforms: { $regex: 'linux', $options: 'i' } },
            {
              $and: [
                { $or: [{ platforms: { $exists: false } }, { platforms: { $size: 0 } }] },
                {
                  $or: [
                    { categories: { $regex: 'linux|steam deck', $options: 'i' } },
                    {
                      $expr: {
                        $eq: [ { $mod: [ { $toInt: "$appid" }, 5 ] }, 0 ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        });
      } else {
        conditions.push({ platforms: { $regex: platform, $options: 'i' } });
      }
    }

    // 5. Tag filter: matches tags array or falls back to genres/categories regex search
    if (req.query.tag) {
      const tag = String(req.query.tag).trim();
      conditions.push({
        $or: [
          { tags: { $regex: tag, $options: 'i' } },
          {
            $and: [
              { $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] },
              {
                $or: [
                  { genres: { $regex: tag, $options: 'i' } },
                  { categories: { $regex: tag, $options: 'i' } }
                ]
              }
            ]
          }
        ]
      });
    }

    // 6. Price range filters (minPrice & maxPrice): string price converted to double in DB
    const priceExprs = [];
    if (req.query.minPrice !== undefined) {
      const minP = parseFloat(req.query.minPrice);
      if (!isNaN(minP)) {
        priceExprs.push({ $gte: [ { $toDouble: "$price" }, minP ] });
      }
    }
    if (req.query.maxPrice !== undefined) {
      const maxP = parseFloat(req.query.maxPrice);
      if (!isNaN(maxP)) {
        priceExprs.push({ $lte: [ { $toDouble: "$price" }, maxP ] });
      }
    }
    if (priceExprs.length > 0) {
      conditions.push({
        $expr: {
          $and: priceExprs
        }
      });
    }

    // 7. Rating filter: check standard or calculated ratings.
    // Scale detection: agar rating <= 10 hai, toh use 100-point scale mein transform karte hain (multiplied by 10).
    if (req.query.rating !== undefined) {
      let minRating = parseFloat(req.query.rating);
      if (!isNaN(minRating)) {
        if (minRating <= 10) {
          minRating = minRating * 10;
        }
        
        const calculatedRatingExpr = {
          $cond: [
            { $gt: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 0 ] },
            {
              $min: [
                98,
                {
                  $max: [
                    65,
                    { $add: [ 75, { $mod: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 24 ] } ] }
                  ]
                }
              ]
            },
            { $add: [ 60, { $mod: [ { $toInt: "$appid" }, 30 ] } ] }
          ]
        };

        conditions.push({
          $or: [
            { rating: { $gte: minRating } },
            {
              $and: [
                { $or: [ { rating: { $exists: false } }, { rating: 0 } ] },
                {
                  $expr: {
                    $gte: [
                      calculatedRatingExpr,
                      minRating
                    ]
                  }
                }
              ]
            }
          ]
        });
      }
    }

    // 8. Release Year filter: match release_year string or end of release_date string
    if (req.query.releaseYear) {
      const year = parseInt(req.query.releaseYear, 10);
      if (!isNaN(year)) {
        const yearStr = String(year);
        conditions.push({
          $or: [
            { release_year: yearStr },
            { release_date: { $regex: `${yearStr}$` } }
          ]
        });
      }
    }

    // 9. Discount filter: matches our virtual discount logic.
    // discount=true filters games with price > 0 and appid divisible by 3.
    if (req.query.discount !== undefined) {
      const isDiscounted = req.query.discount === 'true';
      if (isDiscounted) {
        conditions.push({
          $expr: {
            $and: [
              { $gt: [ { $toDouble: "$price" }, 0 ] },
              { $eq: [ { $mod: [ { $toInt: "$appid" }, 3 ] }, 0 ] }
            ]
          }
        });
      } else {
        conditions.push({
          $expr: {
            $or: [
              { $eq: [ { $toDouble: "$price" }, 0 ] },
              { $ne: [ { $mod: [ { $toInt: "$appid" }, 3 ] }, 0 ] }
            ]
          }
        });
      }
    }

    // 10. Multiplayer filter: matches online / local multiplayer keywords in categories or tags
    if (req.query.multiplayer !== undefined) {
      const isMultiplayer = req.query.multiplayer === 'true';
      const multiplayerRegex = 'multi-player|pvp|co-op|cooperative';
      if (isMultiplayer) {
        conditions.push({
          $or: [
            { tags: { $regex: 'multiplayer', $options: 'i' } },
            { categories: { $regex: multiplayerRegex, $options: 'i' } }
          ]
        });
      } else {
        conditions.push({
          $or: [
            { tags: { $not: { $regex: 'multiplayer', $options: 'i' } } },
            { tags: { $exists: false } }
          ]
        });
        conditions.push({
          $or: [
            { categories: { $exists: false } },
            { categories: { $not: { $regex: multiplayerRegex, $options: 'i' } } }
          ]
        });
      }
    }

    // 11. Free to Play filter: price is 0 or genres/categories contain 'free to play'
    if (req.query.freeToPlay !== undefined) {
      const isFree = req.query.freeToPlay === 'true';
      if (isFree) {
        conditions.push({
          $or: [
            { price: '0.0' },
            { price: 0 },
            { genres: { $regex: 'free to play', $options: 'i' } },
            { categories: { $regex: 'free to play', $options: 'i' } }
          ]
        });
      } else {
        conditions.push({
          $expr: { $gt: [ { $toDouble: "$price" }, 0 ] }
        });
        conditions.push({
          genres: { $not: { $regex: 'free to play', $options: 'i' } }
        });
        conditions.push({
          categories: { $not: { $regex: 'free to play', $options: 'i' } }
        });
      }
    }

    // Agar conditions array mein filters hain toh unhe $and query operator ke roop mein filter object mein add karte hain.
    if (conditions.length > 0) {
      filter.$and = conditions;
    }

    const total = await Game.countDocuments(filter);
    const games = await Game.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // List ke har ek game document ko enrichment function se format/add additional details set karte hain.
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({ page, limit, total, count: enrichedGames.length, games: enrichedGames });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games', error: e.message });
  }
};

/*
=================================================================================
  SECTION 3: BASIC CRUD (CREATE, READ, UPDATE, DELETE) & MAIN ACTIONS
  -------------------------------------------------------------------------------
  Ye section database mein specific game documents add, replace, update, delete, 
  exists check aur archives handle karne ke business logic operations handle karta hai.
  Beginner logic:
  - URL pattern /:appid se dynamically id target hoti hai jo req.params se read karte hain.
=================================================================================
*/

// GET /api/v1/games/:appid
// Ek specific game ko appid se laata hai.
const getGameByAppId = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Game details ko fallback parameters (rating, downloads, etc.) se enrich karte hain.
    const enrichedGame = enrichGameData(game);
    res.json(enrichedGame);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching game', error: e.message });
  }
};

// POST /api/v1/games
// Naya game create karta hai.
const createGame = async (req, res) => {
  try {
    const { appid, name } = req.body;
    if (!appid || !name) return res.status(400).json({ message: 'appid and name are required' });

    const parsedAppId = parseAppId(appid);
    if (parsedAppId === null) return res.status(400).json({ message: 'Invalid appid' });

    const existing = await Game.findOne(findAppIdQuery(parsedAppId));
    if (existing) return res.status(409).json({ message: 'Game already exists' });

    const game = await Game.create({ ...req.body, appid: parsedAppId });
    res.status(201).json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error creating game', error: e.message });
  }
};

// PUT /api/v1/games/:appid
// Game ko poori tarah replace karta hai. sare fields naya data se set ho jate hain.
const replaceGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    await Game.updateOne(findAppIdQuery(appid), { ...req.body, appid }, { runValidators: true });
    const updated = await Game.findOne(findAppIdQuery(appid));
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error replacing game', error: e.message });
  }
};

// PATCH /api/v1/games/:appid
// Sirf woh fields update karta hai jo request body mein hain.
const updateGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const changes = { ...req.body };
    delete changes.appid; // appid change nahi kar sakte
    if (!Object.keys(changes).length) return res.status(400).json({ message: 'No update fields' });

    Object.assign(game, changes);
    game.history.push({ updatedAt: new Date(), changes });
    await game.save();

    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error updating game', error: e.message });
  }
};

// DELETE /api/v1/games/:appid
// Database se game ko hata deta hai.
const deleteGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndDelete(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ message: 'Game deleted', game });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting game', error: e.message });
  }
};

// GET /api/v1/games/exists/:appid
// Sirf check karega agar game exist karta hai ya nahi.
const checkGameExists = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const exists = await Game.exists(findAppIdQuery(appid));
    res.json({ exists: Boolean(exists) });
  } catch (e) {
    res.status(500).json({ message: 'Error checking game', error: e.message });
  }
};

// GET /api/v1/games/:appid/summary
// Summary laata hai, full game details nahi.
const getGameSummary = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name short_description developer publisher release_date price isArchived');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching summary', error: e.message });
  }
};

// GET /api/v1/games/:appid/history
// Game ki update history dikhata hai.
const getGameHistory = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name history');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ appid: game.appid, name: game.name, history: game.history || [] });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching history', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/archive
// Game ko archived flag true kar deta hai.
const archiveGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndUpdate(findAppIdQuery(appid), { isArchived: true }, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error archiving game', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/restore
// Archived game ko wapas active karta hai.
const restoreGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndUpdate(findAppIdQuery(appid), { isArchived: false }, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error restoring game', error: e.message });
  }
};

// GET /api/v1/games/:appid/related
// Same genre wale related games laata hai.
const getRelatedGames = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const related = await Game.find({ _id: { $ne: game._id }, genres: { $in: game.genres } })
      .limit(10)
      .select('appid name genres developer publisher');
    res.json({ related });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching related games', error: e.message });
  }
};

/*
=================================================================================
  SECTION 4: GAME INFORMATION & SUB-RESOURCES (DETAILS & SOCIALS)
  -------------------------------------------------------------------------------
  Ye section specific game key arrays aur sub-resources query and modify karne ke 
  methods hold karta hai: jaise user reviews, screenshots gallery, gameplay trailers, 
  system requirements (minimum & recommended configurations), updates logs, and 
  bulletin news channels.
=================================================================================
*/

// GET /api/v1/games/:appid/screenshots
// Game ke images (screenshots) ko data se nikaal kar bhejta hai
// Images ek list ke andar save hote hain
// Wapas mein game ki ID, naam aur images ki list milti hai
const getScreenshots = async (req, res) => {
  try {
    // URL se game ki ID nikaal kar use karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Data se game ko dhund kar usci images nikaalte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name screenshots');
    
    // Agar game nahi mila toh error bhejte hain
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Images ki list return karte hain
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      screenshots: game.screenshots || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching screenshots', error: e.message });
  }
};

// GET /api/v1/games/:appid/trailers
// Game ke videos (trailers) ko data se nikaal kar bhejta hai
// Videos ek list mein store hote hain
// Wapas mein game ka naam aur videos ki list milti hai
const getTrailers = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke videos ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name trailers');
    
    // Agar game nahi hai toh error message bhejte hain
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Videos ki list return karte hain (ya empty list agar video nahi hai)
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      trailers: game.trailers || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching trailers', error: e.message });
  }
};

// GET /api/v1/games/:appid/reviews
// Game ke user reviews (jo log likhe the) sabko bhejta hai
// Reviews ek list mein store hote hain
// Chahte to URL mein limit de kar sirf kuch reviews likha kar sakte ho
// Example: /api/v1/games/123/reviews?limit=10 (sirf 10 reviews dikhega)
const getReviews = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke reviews ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name reviews');
    
    // Agar game nahi hai toh error
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne reviews dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // Reviews ko slice karke sirf limit number tak dikhate hain
    const reviews = (game.reviews || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalReviews: (game.reviews || []).length,
      reviews 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching reviews', error: e.message });
  }
};

// POST /api/v1/games/:appid/reviews
// Naya review add karta hai (user apna feedback likhe)
// Request mein: userId (kaun likha), rating (1-5), reviewText (kya likha)
// Example:
// {
//   "userId": "user123",
//   "rating": 5,
//   "reviewText": "Bilkul asaan game!"
// }
const addReview = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Request se data nikaalte hain
    const { userId, rating, reviewText } = req.body;
    
    // Check karte hain ki sab data mile hai ya nahi
    if (!userId || !rating || !reviewText) {
      return res.status(400).json({ message: 'userId, rating, and reviewText are required' });
    }

    // Rating ko check karte hain (1 se 5 ke beech hona chahiye)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Naya review object banate hain (date/time ke saath)
    const newReview = {
      userId,
      rating,
      reviewText,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Reviews list ko check karte hain aur naya review add karte hain
    if (!game.reviews) game.reviews = [];
    game.reviews.push(newReview);

    // Game ko save karte hain
    await game.save();

    // Success message de kar naya review return karte hain
    res.status(201).json({ 
      message: 'Review add hogaya', 
      review: newReview 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error adding review', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/reviews/:reviewId
// Purana review ko badal deta hai (update karta hai)
// Request mein sirf wo data de jo badlana ho
// Example: {"rating": 4} - sirf rating badlega
const updateReview = async (req, res) => {
  try {
    // URL se game ID aur review ID nikaalte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const { reviewId } = req.params;
    if (!reviewId) return res.status(400).json({ message: 'Review ID required hai' });

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Reviews list mein se specific review ko dhundhte hain
    const review = game.reviews?.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ message: 'Review nahi mila' });

    // Request se jo data mile wo update karte hain
    // Rating ko check karte hain pehle
    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ message: 'Rating 1 se 5 ke beech hona chahiye' });
      }
      review.rating = req.body.rating;
    }

    // Review text ko update karte hain agar diya ho
    if (req.body.reviewText) review.reviewText = req.body.reviewText;

    // Update ka time set karte hain
    review.updatedAt = new Date();

    // Game ko save karte hain
    await game.save();

    // Updated review return karte hain
    res.json({ 
      message: 'Review update ho gaya', 
      review 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error updating review', error: e.message });
  }
};

// DELETE /api/v1/games/:appid/reviews/:reviewId
// Review ko delete karta hai (hata deta hai)
// URL mein game ID aur review ID dono zaroori hain
const deleteReview = async (req, res) => {
  try {
    // URL se IDs nikaalte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const { reviewId } = req.params;
    if (!reviewId) return res.status(400).json({ message: 'Review ID required hai' });

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Reviews list se us review ko nikaal dete hain jo delete karna hai
    // Filter se sirf wo reviews bathe hain jo delete nahi hona
    const originalLength = game.reviews?.length || 0;
    game.reviews = game.reviews?.filter(r => r._id?.toString() !== reviewId) || [];

    // Check karte hain ki review actually delete hua ya nahi
    if (game.reviews.length === originalLength) {
      return res.status(404).json({ message: 'Review nahi mila' });
    }

    // Game ko save karte hain
    await game.save();

    // Success message bhejte hain
    res.json({ message: 'Review delete ho gaya' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting review', error: e.message });
  }
};

// GET /api/v1/games/:appid/system-requirements
// Game ke computer specs (jaroorat) bhejta hai
// Ismein minimum aur recommended dono specs hote hain
// Example:
// {
//   "minimum": {"os": "Windows 10", "cpu": "Intel i5", "ram": "8GB"},
//   "recommended": {"os": "Windows 11", "cpu": "Intel i7", "ram": "16GB"}
// }
const getSystemRequirements = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke specs ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name systemRequirements');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Specs return karte hain
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      systemRequirements: game.systemRequirements || null 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching system requirements', error: e.message });
  }
};

// GET /api/v1/games/:appid/dlc
// Game ke extra content (DLC) ki list bhejta hai
// DLC matlab downloadable content - jaise extra levels, characters, outfits etc.
// Example:
// {
//   "dlcList": [
//     {"name": "Season Pass", "price": "$19.99"},
//     {"name": "Expansion Pack", "price": "$29.99"}
//   ]
// }
const getDLC = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke DLC ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name dlcList');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // DLC list return karte hain (kitne DLC hain aur list kya hai)
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      dlcCount: (game.dlcList || []).length,
      dlcList: game.dlcList || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching DLC', error: e.message });
  }
};

// GET /api/v1/games/:appid/achievements
// Game ke achievements (badges/medals) ki list bhejta hai
// Achievements matlab jo medals milte hain game khelne par
// Jaise "10 enemies kill karo toh 'Killer' achievement milegi"
const getAchievements = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke achievements ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name achievements');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne achievements dikhane hain, default 50)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    
    // Achievements ko slice karke limit tak dikhate hain
    const achievements = (game.achievements || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalAchievements: (game.achievements || []).length,
      achievements 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching achievements', error: e.message });
  }
};

// GET /api/v1/games/:appid/leaderboards
// Game ke rankings (leaderboard) bhejta hai
// Leaderboard mein top players aur unke scores likhe hote hain
// Jaise "Top 100 players aur unka rank"
const getLeaderboards = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke rankings ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name leaderboards');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (top kitne players dikhane hain, default 100)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 100);
    
    // Top players ko limit tak dikhate hain
    const leaderboards = (game.leaderboards || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      leaderboardCount: (game.leaderboards || []).length,
      leaderboards 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching leaderboards', error: e.message });
  }
};

// GET /api/v1/games/:appid/updates
// Game ke latest updates/patches bhejta hai
// Updates matlab jo fixes aur naye features add hote hain
// Jaise "bug fix kiya ya naya level add kiya"
const getUpdates = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke updates ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name updates');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne latest updates dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // Updates ko newest pehle karke limit tak dikhate hain
    const updates = (game.updates || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalUpdates: (game.updates || []).length,
      updates 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching updates', error: e.message });
  }
};

// GET /api/v1/games/:appid/news
// Game ki news/announcements bhejta hai
// News matlab dev ne kya bola - jaise "naya update aa raha hai" ya "tournament ho raha hai"
// URL se limit nikaal kar sirf latest news dikha sakte ho
const getNews = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ki news ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name news');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitni latest news dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // News ko newest pehle karke limit tak dikhate hain
    const news = (game.news || [])
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalNews: (game.news || []).length,
      news 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching news', error: e.message });
  }
};

/*
=================================================================================
  SECTION 5: ROUTE PARAMETER FILTERS (e.g. /genre/:genre, /platform/:platform)
  -------------------------------------------------------------------------------
  Ye section path-based dynamic route parameters se filter karne ke methods handle 
  karta hai.
  Beginner logic:
  - URL parameter read karne ke liye req.params read hota hai.
  - Har method custom MongoDB match pipelines ya regex pattern search use karke 
    specific collection subsets filter aur return karta hai.
=================================================================================
*/

// GET /api/v1/games/genre/:genre
// Genre (jaise Action, RPG, Strategy) ke hisaab se games return karta hai.
// Genre case-insensitive match (Action aur action dono) ke liye hum regex utilize karte hain.
const getGamesByGenre = async (req, res) => {
  try {
    // 1. URL parameters se genre nikaalte hain aur extra spaces clean karte hain.
    const genre = String(req.params.genre || '').trim();
    if (!genre) {
      return res.status(400).json({ message: 'Genre required hai' });
    }

    // 2. Database mein regex $regex ka use karke genres field search karte hain.
    // $options: 'i' se case-insensitive matching hoti hai.
    const games = await Game.find({ 
      genres: { $regex: genre, $options: 'i' } 
    }).limit(100); // Server resources protect karne ke liye max 100 games load karte hain.

    // 3. Sabhi games ko enrichGameData function se process karte hain taaki missing frontend requirements (ratings, screenshots, etc.) fill ho ske.
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'genre',
      value: genre,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by genre', error: e.message });
  }
};

// GET /api/v1/games/developer/:developer
// Game banane wale Developer (company) ke base par games filter karta hai.
// Example: Rockstar Games, Valve, FromSoftware.
const getGamesByDeveloper = async (req, res) => {
  try {
    // 1. Developer name check karte hain request parameters se.
    const developer = String(req.params.developer || '').trim();
    if (!developer) {
      return res.status(400).json({ message: 'Developer name required hai' });
    }

    // 2. Developer field pe regex query chalate hain.
    const games = await Game.find({ 
      developer: { $regex: developer, $options: 'i' } 
    }).limit(100);

    // 3. Return karne se pehle results ko model fallbacks se enrich karte hain.
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'developer',
      value: developer,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by developer', error: e.message });
  }
};

// GET /api/v1/games/publisher/:publisher
// Publisher (game launch/market karne wali company) ke hisaab se games filter karta hai.
// Example: Electronic Arts, Ubisoft, Sony Interactive Entertainment.
const getGamesByPublisher = async (req, res) => {
  try {
    // 1. Publisher name retrieve aur trim karte hain.
    const publisher = String(req.params.publisher || '').trim();
    if (!publisher) {
      return res.status(400).json({ message: 'Publisher name required hai' });
    }

    // 2. Case-insensitive search on publisher field.
    const games = await Game.find({ 
      publisher: { $regex: publisher, $options: 'i' } 
    }).limit(100);

    // 3. Response ko fallback values ke sath map karte hain.
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'publisher',
      value: publisher,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by publisher', error: e.message });
  }
};

// GET /api/v1/games/platform/:platform
// specific systems (Windows, Mac, Linux) ke compatible games return karta hai.
// NOTE: Kyuki DB mein platforms array har game ke liye empty ([]) hai, isliye hum enrichGameData 
// ke platform fallback logic ko MongoDB query level par translate karenge taaki results valid hon.
const getGamesByPlatform = async (req, res) => {
  try {
    // 1. Parameter read karke lowercase format banate hain.
    const platform = String(req.params.platform || '').trim().toLowerCase();
    if (!platform) {
      return res.status(400).json({ message: 'Platform required hai' });
    }

    let platformQuery = {};
    
    // 2. Har game default windows support karta hai (Windows filter check):
    if (platform === 'windows') {
      platformQuery = {
        $or: [
          { platforms: { $regex: 'windows', $options: 'i' } },
          { platforms: { $exists: false } },
          { platforms: { $size: 0 } }
        ]
      };
    } 
    // 3. Mac compatibility calculation (categories contains mac/apple ya appid % 4 === 0):
    else if (platform === 'mac') {
      platformQuery = {
        $or: [
          { platforms: { $regex: 'mac', $options: 'i' } },
          {
            $and: [
              { $or: [{ platforms: { $exists: false } }, { platforms: { $size: 0 } }] },
              {
                $or: [
                  { categories: { $regex: 'mac|apple', $options: 'i' } },
                  {
                    $expr: {
                      $eq: [ { $mod: [ { $toInt: "$appid" }, 4 ] }, 0 ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      };
    } 
    // 4. Linux compatibility calculation (categories contains linux/steam deck ya appid % 5 === 0):
    else if (platform === 'linux') {
      platformQuery = {
        $or: [
          { platforms: { $regex: 'linux', $options: 'i' } },
          {
            $and: [
              { $or: [{ platforms: { $exists: false } }, { platforms: { $size: 0 } }] },
              {
                $or: [
                  { categories: { $regex: 'linux|steam deck', $options: 'i' } },
                  {
                    $expr: {
                      $eq: [ { $mod: [ { $toInt: "$appid" }, 5 ] }, 0 ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      };
    } 
    // 5. Default/Other platform matching:
    else {
      platformQuery = { platforms: { $regex: platform, $options: 'i' } };
    }

    // 6. DB fetch query run karte hain:
    const games = await Game.find(platformQuery).limit(100);
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'platform',
      value: platform,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by platform', error: e.message });
  }
};

// GET /api/v1/games/tag/:tag
// Game tags (jaise multiplayer, survival, indie) se games search karta hai.
// DB mein tags array blank hone ki wajah se, hum tags fallback ke roop mein
// genres aur categories strings ke content ko check karte hain.
const getGamesByTag = async (req, res) => {
  try {
    const tag = String(req.params.tag || '').trim();
    if (!tag) {
      return res.status(400).json({ message: 'Tag required hai' });
    }

    // Tags matching query check:
    const tagQuery = {
      $or: [
        { tags: { $regex: tag, $options: 'i' } },
        {
          $and: [
            { $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] },
            {
              $or: [
                { genres: { $regex: tag, $options: 'i' } },
                { categories: { $regex: tag, $options: 'i' } }
              ]
            }
          ]
        }
      ]
    };

    const games = await Game.find(tagQuery).limit(100);
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'tag',
      value: tag,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by tag', error: e.message });
  }
};

// GET /api/v1/games/release-year/:year
// Kis saal (Jaise 2023, 2024) game release hua tha, us saal ke games return karta hai.
// DB fields check: database mein 'release_year' string aur 'release_date' string store hain.
const getGamesByReleaseYear = async (req, res) => {
  try {
    // 1. Year input validate aur convert karte hain
    const year = parseInt(req.params.year, 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ message: 'Valid year required hai (1900-2100)' });
    }

    const yearStr = String(year);
    // 2. Query release_year match karega aur fallback release_date string ke end mein year match karega (e.g. "Jun 30, 2023" ends with "2023").
    const yearQuery = {
      $or: [
        { release_year: yearStr },
        { release_date: { $regex: `${yearStr}$` } }
      ]
    };

    const games = await Game.find(yearQuery).limit(100);
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'release-year',
      value: year,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by release year', error: e.message });
  }
};

// GET /api/v1/games/rating/:rating
// Min rating (jaise 80+, 90+) se game search karne ke liye.
// DB fallback logic check: ratings DB documents mein default 0 hain. 
// Hum queries par rating formula apply karke real ratings determine karenge.
const getGamesByRating = async (req, res) => {
  try {
    const minRating = parseFloat(req.params.rating);
    if (isNaN(minRating) || minRating < 0 || minRating > 100) {
      return res.status(400).json({ message: 'Valid rating required hai (0-100)' });
    }

    // MongoDB expression jo raw parameters (recommendations & appid) se rating calculate karegi.
    // 75 + (recommendations % 24) bounds between 65 and 98.
    // appid % 30 + 60 bounds between 60 and 89.
    const calculatedRatingExpr = {
      $cond: [
        { $gt: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 0 ] },
        // recommendationsNum > 0:
        {
          $min: [
            98,
            {
              $max: [
                65,
                { $add: [ 75, { $mod: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 24 ] } ] }
              ]
            }
          ]
        },
        // else:
        { $add: [ 60, { $mod: [ { $toInt: "$appid" }, 30 ] } ] }
      ]
    };

    // query check standard rating ya runtime calculate criteria meet ho:
    const ratingQuery = {
      $or: [
        { rating: { $gte: minRating } },
        {
          $and: [
            { $or: [ { rating: { $exists: false } }, { rating: 0 } ] },
            {
              $expr: {
                $gte: [
                  calculatedRatingExpr,
                  minRating
                ]
              }
            }
          ]
        }
      ]
    };

    // aggregation pipeline chalayege taaki sorting dynamically calculated rating descending ho.
    const pipeline = [
      { $match: ratingQuery },
      {
        $addFields: {
          calculatedRating: {
            $cond: [
              { $gt: [ { $type: "$rating" }, "missing" ] },
              {
                $cond: [
                  { $eq: [ "$rating", 0 ] },
                  calculatedRatingExpr,
                  "$rating"
                ]
              },
              calculatedRatingExpr
            ]
          }
        }
      },
      { $sort: { calculatedRating: -1 } },
      { $limit: 100 }
    ];

    const rawGames = await Game.aggregate(pipeline);
    
    // document convert aur model values mapping
    const games = rawGames.map(game => {
      game.rating = game.calculatedRating; // calculate rating field overwrite mapping
      delete game.calculatedRating;
      return enrichGameData(game);
    });

    res.json({
      filter: 'rating',
      value: minRating,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by rating', error: e.message });
  }
};

// GET /api/v1/games/price/:price
// Price parameter/range search route: "free", "0-500", "500-1000", "1000-above".
// NOTE: DB mein price string ('3.99', '0.0') hai. Aggregation with $toDouble handles number range correctly.
const getGamesByPrice = async (req, res) => {
  try {
    const priceRange = String(req.params.price || '').trim();
    let minPrice = 0, maxPrice = 999999;

    // Price query string matching:
    if (priceRange === 'free') {
      minPrice = 0;
      maxPrice = 0;
    } else if (priceRange.includes('-above')) {
      minPrice = parseInt(priceRange.split('-')[0], 10);
      maxPrice = 999999;
    } else if (priceRange.includes('-')) {
      const parts = priceRange.split('-');
      minPrice = parseInt(parts[0], 10);
      maxPrice = parseInt(parts[1], 10);
    } else {
      return res.status(400).json({ 
        message: 'Price format invalid. Use: "free", "0-500", "1000-above"' 
      });
    }

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ message: 'Invalid price parameters' });
    }

    // Dynamic price string double casting query setup:
    const priceQuery = {
      $expr: {
        $and: [
          { $gte: [ { $toDouble: "$price" }, minPrice ] },
          { $lte: [ { $toDouble: "$price" }, maxPrice ] }
        ]
      }
    };

    // Aggregation pipeline to cast and sort results numerically (cheapest first):
    const pipeline = [
      { $match: priceQuery },
      {
        $addFields: {
          numericPrice: { $toDouble: "$price" }
        }
      },
      { $sort: { numericPrice: 1 } },
      { $limit: 100 }
    ];

    const rawGames = await Game.aggregate(pipeline);
    const games = rawGames.map(game => enrichGameData(game));

    res.json({
      filter: 'price',
      value: priceRange,
      priceRange: { min: minPrice, max: maxPrice },
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by price', error: e.message });
  }
};

// GET /api/v1/games/feature/:feature
// Game features (jaise Coop, achievements, singleplayer) filter route.
// DB features list empty hone ki wajah se, hum categories fallback check match karenge.
const getGamesByFeature = async (req, res) => {
  try {
    const feature = String(req.params.feature || '').trim();
    if (!feature) {
      return res.status(400).json({ message: 'Feature required hai' });
    }

    let featureQuery = {};
    
    // Single-player handling (default fallback check for missing categories):
    if (feature.toLowerCase() === 'single-player') {
      featureQuery = {
        $or: [
          { features: { $regex: 'single-player', $options: 'i' } },
          {
            $and: [
              { $or: [{ features: { $exists: false } }, { features: { $size: 0 } }] },
              {
                $or: [
                  { categories: { $regex: 'single-player', $options: 'i' } },
                  { categories: { $exists: false } },
                  { categories: '' }
                ]
              }
            ]
          }
        ]
      };
    } 
    // Standard feature category matching:
    else {
      featureQuery = {
        $or: [
          { features: { $regex: feature, $options: 'i' } },
          {
            $and: [
              { $or: [{ features: { $exists: false } }, { features: { $size: 0 } }] },
              { categories: { $regex: feature, $options: 'i' } }
            ]
          }
        ]
      };
    }

    const games = await Game.find(featureQuery).limit(100);
    const enrichedGames = games.map(game => enrichGameData(game));

    res.json({
      filter: 'feature',
      value: feature,
      count: enrichedGames.length,
      games: enrichedGames
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by feature', error: e.message });
  }
};


// GET /api/v1/games/filter/:filterType
// Presets based filtering routes (e.g. /filter/free-to-play, /filter/top-rated, etc.)
// Ye method dynamic path parameters parse karke preset criteria ke matching game collections return karta hai.
const getGamesByFilterType = async (req, res) => {
  try {
    const filterType = String(req.params.filterType || '').trim().toLowerCase();
    if (!filterType) {
      return res.status(400).json({ message: 'Filter type parameter required hai' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    let queryObj = { isArchived: { $ne: true } }; // Default: actively showing games only
    let useAggregation = false;
    let games = [];
    let total = 0;

    // Rating calculations fallback expression for games that don't have explicit rating field.
    const calculatedRatingExpr = {
      $cond: [
        { $gt: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 0 ] },
        {
          $min: [
            98,
            {
              $max: [
                65,
                { $add: [ 75, { $mod: [ { $toInt: { $ifNull: [ "$recommendations", "0" ] } }, 24 ] } ] }
              ]
            }
          ]
        },
        { $add: [ 60, { $mod: [ { $toInt: "$appid" }, 30 ] } ] }
      ]
    };

    switch (filterType) {
      case 'free-to-play':
        // Price is 0 or 0.0 or category/genre string matches 'free to play'
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { price: '0.0' },
            { price: 0 },
            { genres: { $regex: 'free to play', $options: 'i' } },
            { categories: { $regex: 'free to play', $options: 'i' } }
          ]
        };
        break;

      case 'paid':
        // Price > 0 and free-to-play is NOT present in genres/categories
        queryObj = {
          isArchived: { $ne: true },
          $and: [
            { $expr: { $gt: [ { $toDouble: "$price" }, 0 ] } },
            { genres: { $not: { $regex: 'free to play', $options: 'i' } } },
            { categories: { $not: { $regex: 'free to play', $options: 'i' } } }
          ]
        };
        break;

      case 'discounted':
        // Virtual discount logic matching getGames where appid % 3 === 0 and price > 0
        queryObj = {
          isArchived: { $ne: true },
          $expr: {
            $and: [
              { $gt: [ { $toDouble: "$price" }, 0 ] },
              { $eq: [ { $mod: [ { $toInt: "$appid" }, 3 ] }, 0 ] }
            ]
          }
        };
        break;

      case 'early-access':
        // Early Access keyword matches in genres, categories, or tags
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { genres: { $regex: 'early access', $options: 'i' } },
            { categories: { $regex: 'early access', $options: 'i' } },
            { tags: { $regex: 'early access', $options: 'i' } }
          ]
        };
        break;

      case 'vr-only':
        // VR support/exclusivity matches in categories or name
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { categories: { $regex: 'vr only|vr supported|tracked controller support', $options: 'i' } },
            { name: { $regex: '\\bvr\\b|virtual reality', $options: 'i' } }
          ]
        };
        break;

      case 'controller-support':
        // Controller support features match in categories or tags
        queryObj = {
          isArchived: { $ne: true },
          categories: { $regex: 'controller support|full controller support|partial controller support', $options: 'i' }
        };
        break;

      case 'multiplayer':
        // Matches online or local multiplayer keywords in tags or categories
        const multiplayerRegex = 'multi-player|pvp|co-op|cooperative|multiplayer';
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { genres: { $regex: 'multiplayer', $options: 'i' } },
            { categories: { $regex: multiplayerRegex, $options: 'i' } }
          ]
        };
        break;

      case 'singleplayer':
        // Matches singleplayer keyword in genres, categories, or tags
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { genres: { $regex: 'single-player|singleplayer', $options: 'i' } },
            { categories: { $regex: 'single-player|singleplayer', $options: 'i' } }
          ]
        };
        break;

      case 'coop':
        // Matches co-op / cooperative keywords in categories
        queryObj = {
          isArchived: { $ne: true },
          categories: { $regex: 'co-op|cooperative|coop', $options: 'i' }
        };
        break;

      case 'open-world':
        // Matches open world in name field (as description/tags are empty in raw DB)
        queryObj = {
          isArchived: { $ne: true },
          name: { $regex: 'open world|open-world', $options: 'i' }
        };
        break;

      case 'survival':
        // Matches survival in name field (as description/tags are empty in raw DB)
        queryObj = {
          isArchived: { $ne: true },
          name: { $regex: 'survival', $options: 'i' }
        };
        break;

      case 'horror':
        // Matches horror in name field (as description/tags are empty in raw DB)
        queryObj = {
          isArchived: { $ne: true },
          name: { $regex: 'horror', $options: 'i' }
        };
        break;

      case 'anime':
        // Matches anime in name field (as description/tags are empty in raw DB)
        queryObj = {
          isArchived: { $ne: true },
          name: { $regex: 'anime', $options: 'i' }
        };
        break;

      case 'indie':
        // Matches indie in genres
        queryObj = {
          isArchived: { $ne: true },
          genres: { $regex: 'indie', $options: 'i' }
        };
        break;

      case 'top-rated':
        // Matches rating >= 80 (explicit rating or calculated rating)
        useAggregation = true;
        queryObj = {
          isArchived: { $ne: true },
          $or: [
            { rating: { $gte: 80 } },
            {
              $and: [
                { $or: [ { rating: { $exists: false } }, { rating: 0 } ] },
                {
                  $expr: {
                    $gte: [
                      calculatedRatingExpr,
                      80
                    ]
                  }
                }
              ]
            }
          ]
        };
        break;

      default:
        return res.status(400).json({ 
          message: `Invalid filter type: '${filterType}'. Available presets: free-to-play, paid, discounted, early-access, vr-only, controller-support, multiplayer, singleplayer, coop, open-world, survival, horror, anime, indie, top-rated.` 
        });
    }

    if (useAggregation) {
      // Aggregate use karte hain rating calculate aur sorted desc order mein return karne ke liye
      total = await Game.countDocuments(queryObj);
      const pipeline = [
        { $match: queryObj },
        {
          $addFields: {
            calculatedRating: {
              $cond: [
                { $gt: [ { $type: "$rating" }, "missing" ] },
                {
                  $cond: [
                    { $eq: [ "$rating", 0 ] },
                    calculatedRatingExpr,
                    "$rating"
                  ]
                },
                calculatedRatingExpr
              ]
            }
          }
        },
        { $sort: { calculatedRating: -1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      const rawGames = await Game.aggregate(pipeline);
      games = rawGames.map(game => {
        game.rating = game.calculatedRating;
        delete game.calculatedRating;
        return enrichGameData(game);
      });
    } else {
      // Normal find query with pagination, sorted by recommendations/date descending
      total = await Game.countDocuments(queryObj);
      const rawGames = await Game.find(queryObj)
        .sort({ recommendations: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
      games = rawGames.map(game => enrichGameData(game));
    }

    res.json({
      filter: 'preset',
      value: filterType,
      page,
      limit,
      total,
      count: games.length,
      games: games
    });

  } catch (e) {
    res.status(500).json({ 
      message: `Error fetching games by preset filter: ${req.params.filterType}`, 
      error: e.message 
    });
  }
};


module.exports = {
  getGames,
  getGameByAppId,
  createGame,
  replaceGame,
  updateGame,
  deleteGame,
  checkGameExists,
  getGameSummary,
  getGameHistory,
  archiveGame,
  restoreGame,
  getRelatedGames,
  getScreenshots,
  getTrailers,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getSystemRequirements,
  getDLC,
  getAchievements,
  getLeaderboards,
  getUpdates,
  getNews,
  // Filter methods
  getGamesByGenre,
  getGamesByDeveloper,
  getGamesByPublisher,
  getGamesByPlatform,
  getGamesByTag,
  getGamesByReleaseYear,
  getGamesByRating,
  getGamesByPrice,
  getGamesByFeature,
  getGamesByFilterType,
  enrichGameData,
};

