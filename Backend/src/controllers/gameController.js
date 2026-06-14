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

  const result = await gameService.getAllGames(page, limit);
  
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

module.exports = {
  getGames,
  getGameDetails,
  createNewGame,
  replaceGameDetails,
  updateGameDetails,
  deleteGame,
  checkExists,
  getSummary
};
