const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.get('/games/count', statsController.getGamesCount);
router.get('/games/top-rated', statsController.getTopRatedStats);
router.get('/games/most-downloaded', statsController.getMostDownloadedStats);
router.get('/games/average-price', statsController.getAveragePrice);
router.get('/games/average-rating', statsController.getAverageRating);
router.get('/games/genre-count', statsController.getGenreCount);
router.get('/games/platform-count', statsController.getPlatformCount);
router.get('/games/free-to-play-count', statsController.getFreeToPlayCount);
router.get('/games/multiplayer-count', statsController.getMultiplayerCount);
router.get('/games/monthly-releases', statsController.getMonthlyReleases);

module.exports = router;
