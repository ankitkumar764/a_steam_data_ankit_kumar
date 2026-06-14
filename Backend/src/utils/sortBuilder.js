/**
 * Translates sorting keyword or route path into Mongoose sort configuration
 * @param {string} sortParam - Sort parameter keyword (e.g. 'price', 'rating-desc')
 * @returns {Object} - Mongoose sort configuration
 */
const buildSort = (sortParam) => {
  const sortObj = {};

  if (!sortParam) {
    // Default sort: alphabetical by name
    sortObj.name = 1;
    return sortObj;
  }

  const cleanParam = sortParam.trim();

  switch (cleanParam) {
    // Ascending Sorts
    case 'price':
    case 'price-asc':
      sortObj.price = 1;
      break;
    case 'rating':
    case 'rating-asc':
      sortObj.recommendations = 1;
      break;
    case 'downloads':
    case 'downloads-asc':
    case 'popularity':
    case 'popularity-asc':
      sortObj.recommendations = 1;
      break;
    case 'releaseDate':
    case 'releaseDate-asc':
      sortObj.release_year = 1;
      sortObj.release_date = 1;
      break;
    case 'title':
    case 'title-asc':
      sortObj.name = 1;
      break;

    // Descending Sorts
    case 'price-desc':
      sortObj.price = -1;
      break;
    case 'rating-desc':
      sortObj.recommendations = -1;
      break;
    case 'downloads-desc':
    case 'popularity-desc':
      sortObj.recommendations = -1;
      break;
    case 'releaseDate-desc':
      sortObj.release_year = -1;
      sortObj.release_date = -1;
      break;
    case 'title-desc':
      sortObj.name = -1;
      break;

    default:
      // Fallback
      sortObj.name = 1;
  }

  return sortObj;
};

module.exports = buildSort;
