const Game = require('../models/gameModel');
const buildFilter = require('../utils/filterBuilder');
const buildSort = require('../utils/sortBuilder');

/**
 * Fetch all games with pagination support, filtering, and sorting
 * @param {number} page - Page number
 * @param {number} limit - Limit of records per page
 * @param {Object} filters - Filter criteria
 * @param {string} sortOption - Sort settings keyword
 * @returns {Promise<Object>} - Paginated games object
 */
const getAllGames = async (page = 1, limit = 10, filters = {}, sortOption = '') => {
  const skip = (page - 1) * limit;
  const query = buildFilter(filters);
  const sort = buildSort(sortOption);

  const [games, totalItems] = await Promise.all([
    Game.find(query)
      .collation({ locale: 'en', numericOrdering: true })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Game.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    games,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalItems
    }
  };
};

/**
 * Fetch a specific game by its appid
 * @param {string} appid - Game App ID
 * @returns {Promise<Object>} - Game document
 */
const getGameByAppid = async (appid) => {
  return await Game.findOne({ appid, isDeleted: { $ne: true } });
};

/**
 * Create a new game entry
 * @param {Object} gameData - Input fields for new game
 * @returns {Promise<Object>} - Created game document
 */
const createGame = async (gameData) => {
  const game = new Game(gameData);
  game.history.push({
    action: 'CREATE',
    changes: { message: 'Initial entry created' }
  });
  return await game.save();
};

/**
 * Replace entire game record (PUT)
 * @param {string} appid - Game App ID
 * @param {Object} gameData - Input fields for game replacement
 * @returns {Promise<Object>} - Updated game document
 */
const replaceGame = async (appid, gameData) => {
  const game = await Game.findOne({ appid, isDeleted: { $ne: true } });
  if (!game) return null;

  const changes = {};
  const fields = ['name', 'release_year', 'release_date', 'genres', 'categories', 'price', 'recommendations', 'developer', 'publisher'];

  for (const field of fields) {
    const oldValue = game[field];
    const newValue = gameData[field];
    if (newValue !== undefined && String(oldValue) !== String(newValue)) {
      changes[field] = `Changed from "${oldValue || ''}" to "${newValue}"`;
      game[field] = newValue;
    }
  }

  game.history.push({
    action: 'REPLACE',
    changes
  });

  return await game.save();
};

/**
 * Partially update game details (PATCH)
 * @param {string} appid - Game App ID
 * @param {Object} updateData - Input fields to update
 * @returns {Promise<Object>} - Updated game document
 */
const updateGamePartial = async (appid, updateData) => {
  const game = await Game.findOne({ appid, isDeleted: { $ne: true } });
  if (!game) return null;

  const changes = {};
  const fields = ['name', 'release_year', 'release_date', 'genres', 'categories', 'price', 'recommendations', 'developer', 'publisher'];

  for (const key of Object.keys(updateData)) {
    if (fields.includes(key) && String(game[key]) !== String(updateData[key])) {
      changes[key] = `Updated from "${game[key] || ''}" to "${updateData[key]}"`;
      game[key] = updateData[key];
    }
  }

  game.history.push({
    action: 'UPDATE',
    changes
  });

  return await game.save();
};

/**
 * Permanently delete a game
 * @param {string} appid - Game App ID
 * @returns {Promise<Object>} - Deleted game document
 */
const deleteGamePermanently = async (appid) => {
  return await Game.findOneAndDelete({ appid });
};

/**
 * Check whether a game exists
 * @param {string} appid - Game App ID
 * @returns {Promise<boolean>} - True if game exists, false otherwise
 */
const checkGameExists = async (appid) => {
  const count = await Game.countDocuments({ appid, isDeleted: { $ne: true } });
  return count > 0;
};

/**
 * Get summarized details of a game
 * @param {string} appid - Game App ID
 * @returns {Promise<Object>} - Summarized game details
 */
const getGameSummaryByAppid = async (appid) => {
  return await Game.findOne({ appid, isDeleted: { $ne: true } })
    .select('appid name genres price recommendations developer publisher');
};

/**
 * Archive a game (soft-delete)
 * @param {string} appid - Game App ID
 * @returns {Promise<Object>} - Archived game document
 */
const archiveGameByAppid = async (appid) => {
  const game = await Game.findOne({ appid, isDeleted: { $ne: true } });
  if (!game) return null;

  game.isDeleted = true;
  game.archivedAt = new Date();
  game.history.push({
    action: 'ARCHIVE',
    changes: { message: 'Game entry soft-deleted and archived' }
  });

  return await game.save();
};

/**
 * Restore an archived game
 * @param {string} appid - Game App ID
 * @returns {Promise<Object>} - Restored game document
 */
const restoreGameByAppid = async (appid) => {
  const game = await Game.findOne({ appid, isDeleted: true });
  if (!game) return null;

  game.isDeleted = false;
  game.archivedAt = undefined;
  game.history.push({
    action: 'RESTORE',
    changes: { message: 'Game entry restored from archive' }
  });

  return await game.save();
};

/**
 * Retrieve modification history of a game
 * @param {string} appid - Game App ID
 * @returns {Promise<Array>} - History logs of the game
 */
const getGameHistoryByAppid = async (appid) => {
  // We allow fetching history even for soft-deleted games, so we query Game.findOne({ appid })
  const game = await Game.findOne({ appid });
  return game ? game.history : null;
};

/**
 * Search games by title, genres, developer, or publisher using regex (case-insensitive)
 * @param {string} searchQuery - Search query string
 * @param {number} page - Page number
 * @param {number} limit - Limit of records per page
 * @returns {Promise<Object>} - Paginated search results
 */
const searchGames = async (searchQuery, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  if (!searchQuery) {
    return {
      games: [],
      pagination: { page: Number(page), limit: Number(limit), totalPages: 0, totalItems: 0 }
    };
  }

  const query = {
    isDeleted: { $ne: true },
    $or: [
      { name: { $regex: new RegExp(searchQuery, 'i') } },
      { genres: { $regex: new RegExp(searchQuery, 'i') } },
      { developer: { $regex: new RegExp(searchQuery, 'i') } },
      { publisher: { $regex: new RegExp(searchQuery, 'i') } }
    ]
  };

  const [games, totalItems] = await Promise.all([
    Game.find(query).skip(skip).limit(limit).lean(),
    Game.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    games,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalItems
    }
  };
};

module.exports = {
  getAllGames,
  getGameByAppid,
  createGame,
  replaceGame,
  updateGamePartial,
  deleteGamePermanently,
  checkGameExists,
  getGameSummaryByAppid,
  archiveGameByAppid,
  restoreGameByAppid,
  getGameHistoryByAppid,
  searchGames
};
