const Game = require('../models/gameModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/analytics/games/top-rated
 * Returns top 10 highest-rated games based on recommendation count (using double conversion)
 */
const getTopRatedAnalytics = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appid: 1,
        name: 1,
        developer: 1,
        publisher: 1,
        recommendations: 1,
        recCount: { $toDouble: "$recommendations" }
      }
    },
    { $sort: { recCount: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Top rated games analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/most-downloaded
 * Returns top 10 most downloaded games (mapped to recommendations count as proxy)
 */
const getMostDownloadedAnalytics = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appid: 1,
        name: 1,
        developer: 1,
        publisher: 1,
        downloadsProxy: { $toDouble: "$recommendations" }
      }
    },
    { $sort: { downloadsProxy: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Most downloaded games analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/revenue
 * Returns top 10 games by estimated revenue (price * recommendations count)
 */
const getRevenueAnalytics = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appid: 1,
        name: 1,
        priceNum: { $toDouble: "$price" },
        recCount: { $toDouble: "$recommendations" }
      }
    },
    {
      $project: {
        appid: 1,
        name: 1,
        estimatedRevenue: { $multiply: ["$priceNum", "$recCount"] }
      }
    },
    { $sort: { estimatedRevenue: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Revenue analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/platform-distribution
 * Returns game count distribution across Windows, Mac, and Linux (using appid mod partitioning)
 */
const getPlatformDistribution = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
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
    },
    {
      $project: {
        _id: 0,
        platforms: [
          { name: 'Windows', count: "$total" },
          { name: 'Mac', count: "$macCount" },
          { name: 'Linux', count: "$linuxCount" }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Platform distribution analytics retrieved successfully',
    data: analytics[0] || { platforms: [] }
  });
});

/**
 * GET /api/v1/analytics/games/genre-distribution
 * Returns count of games grouped by split genres
 */
const getGenreDistribution = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
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
    message: 'Genre distribution analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/trending
 * Returns trending games (top 10 based on high recommendations count)
 */
const getTrendingAnalytics = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appid: 1,
        name: 1,
        developer: 1,
        publisher: 1,
        score: { $toDouble: "$recommendations" }
      }
    },
    { $sort: { score: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Trending games analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/release-trends
 * Returns count of games released per year
 */
const getReleaseTrends = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true }, release_year: { $exists: true, $ne: "" } } },
    {
      $group: {
        _id: "$release_year",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Release trends analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/user-activity
 * Returns standard user review posting activity counts
 */
const getUserActivityAnalytics = catchAsync(async (req, res) => {
  const analytics = await Review.aggregate([
    {
      $group: {
        _id: "$userId",
        reviewsCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        username: "$user.username",
        email: "$user.email",
        reviewsCount: 1
      }
    },
    { $sort: { reviewsCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: 'User review posting activity analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/wishlist-analysis
 * Simulates wishlist estimates based on recommendations count and price
 */
const getWishlistAnalysis = catchAsync(async (req, res) => {
  const analytics = await Game.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        appid: 1,
        name: 1,
        priceNum: { $toDouble: "$price" },
        recCount: { $toDouble: "$recommendations" }
      }
    },
    {
      $project: {
        appid: 1,
        name: 1,
        estimatedWishlists: {
          $cond: [
            { $eq: ["$priceNum", 0] },
            { $multiply: ["$recCount", 1.5] },
            { $multiply: ["$recCount", 2.5] }
          ]
        }
      }
    },
    { $sort: { estimatedWishlists: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    message: 'Wishlist analysis analytics retrieved successfully',
    data: analytics
  });
});

/**
 * GET /api/v1/analytics/games/review-analysis
 * Analyzes average review ratings per game
 */
const getReviewAnalysis = catchAsync(async (req, res) => {
  const analytics = await Review.aggregate([
    {
      $group: {
        _id: "$appid",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'Games',
        localField: '_id',
        foreignField: 'appid',
        as: 'game'
      }
    },
    { $unwind: "$game" },
    {
      $project: {
        _id: 0,
        appid: "$_id",
        gameName: "$game.name",
        averageRating: 1,
        totalReviews: 1
      }
    },
    { $sort: { averageRating: -1, totalReviews: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Game review metrics analytics retrieved successfully',
    data: analytics
  });
});

module.exports = {
  getTopRatedAnalytics,
  getMostDownloadedAnalytics,
  getRevenueAnalytics,
  getPlatformDistribution,
  getGenreDistribution,
  getTrendingAnalytics,
  getReleaseTrends,
  getUserActivityAnalytics,
  getWishlistAnalysis,
  getReviewAnalysis
};
