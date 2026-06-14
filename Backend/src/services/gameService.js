const Game = require('../models/gameModel');

/**
 * Fetch all games with pagination support
 * @param {number} page - Page number
 * @param {number} limit - Limit of records per page
 * @returns {Promise<Object>} - Paginated games object
 */
const getAllGames = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Filter out soft-deleted games
  const query = { isDeleted: { $ne: true } };

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
  return await Game.create(gameData);
};

/**
 * Replace entire game record (PUT)
 * @param {string} appid - Game App ID
 * @param {Object} gameData - Input fields for game replacement
 * @returns {Promise<Object>} - Updated game document
 */
const replaceGame = async (appid, gameData) => {
  // We specify overwrite: true to replace the entire document except internal fields like _id
  return await Game.findOneAndUpdate(
    { appid, isDeleted: { $ne: true } },
    gameData,
    { new: true, runValidators: true, overwrite: true }
  );
};

/**
 * Partially update game details (PATCH)
 * @param {string} appid - Game App ID
 * @param {Object} updateData - Input fields to update
 * @returns {Promise<Object>} - Updated game document
 */
const updateGamePartial = async (appid, updateData) => {
  return await Game.findOneAndUpdate(
    { appid, isDeleted: { $ne: true } },
    { $set: updateData },
    { new: true, runValidators: true }
  );
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
  // Select only basic summary fields
  return await Game.findOne({ appid, isDeleted: { $ne: true } })
    .select('appid name genres price recommendations developer publisher');
};

module.exports = {
  getAllGames,
  getGameByAppid,
  createGame,
  replaceGame,
  updateGamePartial,
  deleteGamePermanently,
  checkGameExists,
  getGameSummaryByAppid
};
