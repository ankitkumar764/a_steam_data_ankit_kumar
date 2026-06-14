const gameService = require('../services/gameService');
const catchAsync = require('../utils/catchAsync');

// Search games endpoint
const searchGames = catchAsync(async (req, res) => {
  const query = req.query.q;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Validation: Check if q is empty
  if (query === undefined || query.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Search query parameter "q" cannot be empty'
    });
  }

  // Validation for page/limit
  if (page < 1 || limit < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page and limit must be positive integers greater than 0'
    });
  }

  const result = await gameService.searchGames(query.trim(), page, limit);

  res.status(200).json({
    success: true,
    message: `Games search for "${query}" completed successfully`,
    data: result.games,
    pagination: result.pagination
  });
});

module.exports = {
  searchGames
};
