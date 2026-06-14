const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const subresourceController = require('../controllers/subresourceController');
const reviewController = require('../controllers/reviewController');

// Game endpoints mapped from route-rule.md
router.route('/')
  .get(gameController.getGames)
  .post(gameController.createNewGame);

router.get('/exists/:appid', gameController.checkExists);
router.get('/:appid/summary', gameController.getSummary);
router.get('/:appid/history', gameController.getGameHistory);
router.patch('/:appid/archive', gameController.archiveGame);
router.patch('/:appid/restore', gameController.restoreGame);

// Game sub-resources (mock and related recommendation routes)
router.get('/:appid/screenshots', subresourceController.getScreenshots);
router.get('/:appid/trailers', subresourceController.getTrailers);
router.get('/:appid/system-requirements', subresourceController.getSystemRequirements);
router.get('/:appid/dlc', subresourceController.getDlc);
router.get('/:appid/achievements', subresourceController.getAchievements);
router.get('/:appid/leaderboards', subresourceController.getLeaderboards);
router.get('/:appid/updates', subresourceController.getUpdates);
router.get('/:appid/news', subresourceController.getNews);
router.get('/:appid/related', subresourceController.getRelated);

// Game Reviews endpoints
router.route('/:appid/reviews')
  .get(reviewController.getReviews)
  .post(reviewController.addReview);

router.route('/:appid/reviews/:reviewId')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// Game Filter Groups (placed before route parameters and generic routes to prevent conflicts)
router.get('/filter/free-to-play', gameController.getGamesByFilterGroup('free-to-play'));
router.get('/filter/paid', gameController.getGamesByFilterGroup('paid'));
router.get('/filter/discounted', gameController.getGamesByFilterGroup('discounted'));
router.get('/filter/early-access', gameController.getGamesByFilterGroup('early-access'));
router.get('/filter/vr-only', gameController.getGamesByFilterGroup('vr-only'));
router.get('/filter/controller-support', gameController.getGamesByFilterGroup('controller-support'));
router.get('/filter/multiplayer', gameController.getGamesByFilterGroup('multiplayer'));
router.get('/filter/singleplayer', gameController.getGamesByFilterGroup('singleplayer'));
router.get('/filter/coop', gameController.getGamesByFilterGroup('coop'));
router.get('/filter/open-world', gameController.getGamesByFilterGroup('open-world'));
router.get('/filter/survival', gameController.getGamesByFilterGroup('survival'));
router.get('/filter/horror', gameController.getGamesByFilterGroup('horror'));
router.get('/filter/anime', gameController.getGamesByFilterGroup('anime'));
router.get('/filter/indie', gameController.getGamesByFilterGroup('indie'));
router.get('/filter/top-rated', gameController.getGamesByFilterGroup('top-rated'));

// Game Sort Descs
router.get('/sort/price-desc', gameController.getSortedGames('price-desc'));
router.get('/sort/rating-desc', gameController.getSortedGames('rating-desc'));
router.get('/sort/downloads-desc', gameController.getSortedGames('downloads-desc'));
router.get('/sort/releaseDate-desc', gameController.getSortedGames('releaseDate-desc'));
router.get('/sort/popularity-desc', gameController.getSortedGames('popularity-desc'));

// Route parameter filters (placed before generic /:appid route to prevent route parameter collision)
router.get('/genre/:genre', gameController.getGamesByGenre);
router.get('/developer/:developer', gameController.getGamesByDeveloper);
router.get('/publisher/:publisher', gameController.getGamesByPublisher);
router.get('/platform/:platform', gameController.getGamesByPlatform);
router.get('/tag/:tag', gameController.getGamesByTag);
router.get('/release-year/:year', gameController.getGamesByReleaseYear);
router.get('/rating/:rating', gameController.getGamesByRating);
router.get('/price/:price', gameController.getGamesByPrice);
router.get('/feature/:feature', gameController.getGamesByFeature);

router.route('/:appid')
  .get(gameController.getGameDetails)
  .put(gameController.replaceGameDetails)
  .patch(gameController.updateGameDetails)
  .delete(gameController.deleteGame);

module.exports = router;
