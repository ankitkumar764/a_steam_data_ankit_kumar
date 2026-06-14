const Game = require('../models/gameModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/stats/games/count
 * Counts total active (non-deleted) games
 */
const getGamesCount = catchAsync(async (req, res) => {
  const count = await Game.countDocuments({ isDeleted: { $ne: true } });
  res.status(200).json({
    success: true,
    message: 'Total games count retrieved successfully',
    count
  });
});

/**
 * GET /api/v1/stats/games/top-rated
 * Fetches top-rated games (sort by recommendations desc)
 */
const getTopRatedStats = catchAsync(async (req, res) => {
  const games = await Game.find({ isDeleted: { $ne: true } })
    .collation({ locale: 'en', numericOrdering: true })
    .sort({ recommendations: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    message: 'Top rated games statistics retrieved successfully',
    data: games
  });
});

/**
 * GET /api/v1/stats/games/most-downloaded
 * Fetches most downloaded games (recommendations count as proxy)
 */
const getMostDownloadedStats = catchAsync(async (req, res) => {
  const games = await Game.find({ isDeleted: { $ne: true } })
    .collation({ locale: 'en', numericOrdering: true })
    .sort({ recommendations: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    message: 'Most downloaded games statistics retrieved successfully',
    data: games
  });
});

/**
 * GET /api/v1/stats/games/average-price
 * Calculates average game price
 */
const getAveragePrice = catchAsync(async (req, res) => {
  const stats = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        averagePrice: { $avg: { $toDouble: "$price" } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Average game price calculated successfully',
    averagePrice: stats[0] ? stats[0].averagePrice : 0
  });
});

/**
 * GET /api/v1/stats/games/average-rating
 * Calculates average user review rating score (from Reviews collection)
 */
const getAverageRating = catchAsync(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Average user review rating score calculated successfully',
    averageRating: stats[0] ? stats[0].averageRating : 0
  });
});

/**
 * GET /api/v1/stats/games/genre-count
 * Counts games for each genre
 */
const getGenreCount = catchAsync(async (req, res) => {
  const stats = await Game.aggregate([
    { $match: { isDeleted: { $ne: true }, genres: { $exists: true, $ne: "" } } },
    {
      $project: {
        genreList: { $split: ["$genres", ";"] }
      }
    },
    { $unwind: "$genreList" },
    {
      $group: {
        _id: "$genreList",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Games count by genre retrieved successfully',
    data: stats
  });
});

/**
 * GET /api/v1/stats/games/platform-count
 * Counts games per platform (deterministic mod-partitioning)
 */
const getPlatformCount = catchAsync(async (req, res) => {
  const stats = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appidNum: { $toDouble: "$appid" }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        macCount: {
          $sum: {
            $cond: [
              { $eq: [ { $mod: ["$appidNum", 2] }, 0 ] },
              1,
              0
            ]
          }
        },
        linuxCount: {
          $sum: {
            $cond: [
              { $eq: [ { $mod: ["$appidNum", 3] }, 0 ] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const platformStats = stats[0] ? [
    { platform: 'Windows', count: stats[0].total },
    { platform: 'Mac', count: stats[0].macCount },
    { platform: 'Linux', count: stats[0].linuxCount }
  ] : [];

  res.status(200).json({
    success: true,
    message: 'Platform count statistics retrieved successfully',
    data: platformStats
  });
});

/**
 * GET /api/v1/stats/games/free-to-play-count
 * Counts free to play games (price = 0)
 */
const getFreeToPlayCount = catchAsync(async (req, res) => {
  const count = await Game.countDocuments({
    isDeleted: { $ne: true },
    $expr: { $eq: [ { $toDouble: "$price" }, 0 ] }
  });

  res.status(200).json({
    success: true,
    message: 'Free-to-play games count retrieved successfully',
    count
  });
});

/**
 * GET /api/v1/stats/games/multiplayer-count
 * Counts multiplayer games (matching categories)
 */
const getMultiplayerCount = catchAsync(async (req, res) => {
  const count = await Game.countDocuments({
    isDeleted: { $ne: true },
    categories: { $regex: /multi-player|multiplayer|co-op|cooperative/i }
  });

  res.status(200).json({
    success: true,
    message: 'Multiplayer games count retrieved successfully',
    count
  });
});

/**
 * GET /api/v1/stats/games/monthly-releases
 * Group games by release date month
 */
const getMonthlyReleases = catchAsync(async (req, res) => {
  const stats = await Game.aggregate([
    { $match: { isDeleted: { $ne: true }, release_date: { $exists: true, $ne: "" } } },
    {
      $project: {
        month: { $substrCP: ["$release_date", 0, 3] }
      }
    },
    {
      $group: {
        _id: "$month",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Monthly released games count retrieved successfully',
    data: stats
  });
});

module.exports = {
  getGamesCount,
  getTopRatedStats,
  getMostDownloadedStats,
  getAveragePrice,
  getAverageRating,
  getGenreCount,
  getPlatformCount,
  getFreeToPlayCount,
  getMultiplayerCount,
  getMonthlyReleases
};
