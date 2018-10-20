// Import node modules.
import _ from 'lodash';

// Function that parses a DB_CONFIG.COLLECTION object to determine the number of collections.
export function getTotalCollections(collection) {
  let collectionCount = 0;

  _.forEach(collection, () => {
    collectionCount += 1;
  });

  return collectionCount;
}

export function APIResponse(state, request, data = {}, message = {}) {
  return {
    data,
    event: {
      status: state ? 'success' : 'fail',
      method: request.method,
      url: request.originalUrl,
      message
    }
  };
}
