const gameService = require('../services/gameService');
const catchAsync = require('../utils/catchAsync');

// Fetch all Steam games with pagination support
const getGames = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Basic validation for pagination
  if (page < 1 || limit < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page and limit must be positive integers greater than 0'
    });
  }

  // Pass req.query and sort option for dynamic filtering and sorting
  const result = await gameService.getAllGames(page, limit, req.query, req.query.sort);
  
  res.status(200).json({
    success: true,
    message: 'Games fetched successfully',
    data: result.games,
    pagination: result.pagination
  });
});

// Fetch complete details of a specific game
const getGameDetails = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const game = await gameService.getGameByAppid(appid);

  if (!game) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Game details retrieved successfully',
    data: game
  });
});

// Create a new game entry
const createNewGame = catchAsync(async (req, res) => {
  const { appid, name } = req.body;

  // Basic validation
  if (!appid || !name) {
    return res.status(400).json({
      success: false,
      message: 'App ID (appid) and Game Name (name) are required fields'
    });
  }

  // Check if game already exists
  const exists = await gameService.checkGameExists(appid);
  if (exists) {
    return res.status(400).json({
      success: false,
      message: `Game with App ID ${appid} already exists`
    });
  }

  const newGame = await gameService.createGame(req.body);

  res.status(201).json({
    success: true,
    message: 'Game entry created successfully',
    data: newGame
  });
});

// Replace entire game record (PUT)
const replaceGameDetails = catchAsync(async (req, res) => {
  const { appid } = req.params;
  
  const updatedGame = await gameService.replaceGame(appid, req.body);

  if (!updatedGame) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Game record replaced successfully',
    data: updatedGame
  });
});

// Partially update game details (PATCH)
const updateGameDetails = catchAsync(async (req, res) => {
  const { appid } = req.params;
  
  const updatedGame = await gameService.updateGamePartial(appid, req.body);

  if (!updatedGame) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Game details updated successfully',
    data: updatedGame
  });
});

// Permanently delete a game
const deleteGame = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const deletedGame = await gameService.deleteGamePermanently(appid);

  if (!deletedGame) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: `Game with App ID ${appid} permanently deleted successfully`,
    data: deletedGame
  });
});

// Check whether game exists
const checkExists = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const exists = await gameService.checkGameExists(appid);

  res.status(200).json({
    success: true,
    message: exists ? 'Game exists' : 'Game does not exist',
    exists
  });
});

// Get summarized details of a game
const getSummary = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const summary = await gameService.getGameSummaryByAppid(appid);

  if (!summary) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Game summary retrieved successfully',
    data: summary
  });
});

// Archive a game entry (soft-delete)
const archiveGame = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const archivedGame = await gameService.archiveGameByAppid(appid);

  if (!archivedGame) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found or already archived`
    });
  }

  res.status(200).json({
    success: true,
    message: `Game with App ID ${appid} archived successfully`,
    data: archivedGame
  });
});

// Restore archived game
const restoreGame = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const restoredGame = await gameService.restoreGameByAppid(appid);

  if (!restoredGame) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found in archive or already active`
    });
  }

  res.status(200).json({
    success: true,
    message: `Game with App ID ${appid} restored successfully`,
    data: restoredGame
  });
});

// Retrieve update history of a game
const getGameHistory = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const history = await gameService.getGameHistoryByAppid(appid);

  if (!history) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: `Game history retrieved successfully`,
    data: history
  });
});

module.exports = {
  getGames,
  getGameDetails,
  createNewGame,
  replaceGameDetails,
  updateGameDetails,
  deleteGame,
  checkExists,
  getSummary,
  archiveGame,
  restoreGame,
  getGameHistory
};

// Retrieve games by genre
const getGamesByGenre = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { genre } = req.params;

  const result = await gameService.getAllGames(page, limit, { genre });
  res.status(200).json({
    success: true,
    message: `Games filtered by genre '${genre}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by developer
const getGamesByDeveloper = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { developer } = req.params;

  const result = await gameService.getAllGames(page, limit, { developer });
  res.status(200).json({
    success: true,
    message: `Games filtered by developer '${developer}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by publisher
const getGamesByPublisher = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { publisher } = req.params;

  const result = await gameService.getAllGames(page, limit, { publisher });
  res.status(200).json({
    success: true,
    message: `Games filtered by publisher '${publisher}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by platform
const getGamesByPlatform = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { platform } = req.params;

  const result = await gameService.getAllGames(page, limit, { platform });
  res.status(200).json({
    success: true,
    message: `Games filtered by platform '${platform}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by tag
const getGamesByTag = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { tag } = req.params;

  const result = await gameService.getAllGames(page, limit, { tag });
  res.status(200).json({
    success: true,
    message: `Games filtered by tag '${tag}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by release year
const getGamesByReleaseYear = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { year } = req.params;

  const result = await gameService.getAllGames(page, limit, { releaseYear: year });
  res.status(200).json({
    success: true,
    message: `Games filtered by release year '${year}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by rating recommendations
const getGamesByRating = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { rating } = req.params;

  const result = await gameService.getAllGames(page, limit, { rating });
  res.status(200).json({
    success: true,
    message: `Games filtered by rating threshold '${rating}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by exact price
const getGamesByPrice = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { price } = req.params;

  const result = await gameService.getAllGames(page, limit, { price });
  res.status(200).json({
    success: true,
    message: `Games filtered by price '${price}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Retrieve games by feature
const getGamesByFeature = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { feature } = req.params;

  const result = await gameService.getAllGames(page, limit, { feature });
  res.status(200).json({
    success: true,
    message: `Games filtered by feature '${feature}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

module.exports = {
  getGames,
  getGameDetails,
  createNewGame,
  replaceGameDetails,
  updateGameDetails,
  deleteGame,
  checkExists,
  getSummary,
  archiveGame,
  restoreGame,
  getGameHistory,
  getGamesByGenre,
  getGamesByDeveloper,
  getGamesByPublisher,
  getGamesByPlatform,
  getGamesByTag,
  getGamesByReleaseYear,
  getGamesByRating,
  getGamesByPrice,
  getGamesByFeature
};

// Dynamic Filter Group factory
const getGamesByFilterGroup = (filterKey) => catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const filters = {};
  if (filterKey === 'free-to-play') filters.freeToPlay = true;
  else if (filterKey === 'paid') filters.minPrice = '0.01'; // price > 0
  else if (filterKey === 'discounted') filters.discount = true;
  else if (filterKey === 'early-access') filters.genre = 'Early Access';
  else if (filterKey === 'vr-only') filters.tag = 'VR';
  else if (filterKey === 'controller-support') filters.feature = 'Controller';
  else if (filterKey === 'multiplayer') filters.multiplayer = true;
  else if (filterKey === 'singleplayer') filters.feature = 'Single-player';
  else if (filterKey === 'coop') filters.tag = 'Co-op';
  else if (filterKey === 'open-world') filters.tag = 'Open World';
  else if (filterKey === 'survival') filters.tag = 'Survival';
  else if (filterKey === 'horror') filters.tag = 'Horror';
  else if (filterKey === 'anime') filters.tag = 'Anime';
  else if (filterKey === 'indie') filters.genre = 'Indie';
  else if (filterKey === 'top-rated') filters.rating = 8; // rating threshold 8 maps to recommendations >= 8000
  
  const result = await gameService.getAllGames(page, limit, filters);
  res.status(200).json({
    success: true,
    message: `Games filtered by group '${filterKey}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

// Dynamic Sort route factory
const getSortedGames = (sortOption) => catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  // Combines route sorting with query parameter filtering
  const result = await gameService.getAllGames(page, limit, req.query, sortOption);
  res.status(200).json({
    success: true,
    message: `Games sorted by '${sortOption}' retrieved successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

module.exports = {
  getGames,
  getGameDetails,
  createNewGame,
  replaceGameDetails,
  updateGameDetails,
  deleteGame,
  checkExists,
  getSummary,
  archiveGame,
  restoreGame,
  getGameHistory,
  getGamesByGenre,
  getGamesByDeveloper,
  getGamesByPublisher,
  getGamesByPlatform,
  getGamesByTag,
  getGamesByReleaseYear,
  getGamesByRating,
  getGamesByPrice,
  getGamesByFeature,
  getGamesByFilterGroup,
  getSortedGames
};
