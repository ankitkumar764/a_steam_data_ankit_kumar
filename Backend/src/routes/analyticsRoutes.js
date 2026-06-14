const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/games/top-rated', analyticsController.getTopRatedAnalytics);
router.get('/games/most-downloaded', analyticsController.getMostDownloadedAnalytics);
router.get('/games/revenue', analyticsController.getRevenueAnalytics);
router.get('/games/platform-distribution', analyticsController.getPlatformDistribution);
router.get('/games/genre-distribution', analyticsController.getGenreDistribution);
router.get('/games/trending', analyticsController.getTrendingAnalytics);
router.get('/games/release-trends', analyticsController.getReleaseTrends);
router.get('/games/user-activity', analyticsController.getUserActivityAnalytics);
router.get('/games/wishlist-analysis', analyticsController.getWishlistAnalysis);
router.get('/games/review-analysis', analyticsController.getReviewAnalysis);

module.exports = router;
