// Import node modules.
import _ from 'lodash';

// Function that parses a DB_CONFIG.COLLECTION object to determine the total number of collections.
export function getTotalCollections(collection) {
  let collectionCount = 0;

  _.forEach(collection, () => {
    collectionCount += 1;
  });

  return collectionCount;
}

// Function to handle and construct a response object that passes back data requested as well as information on the request.
export function responseBuilder(code, request, data = {}, message = {}) {
  return {
    data,
    feedback: {
      status: code,
      method: request.method,
      url: request.originalUrl,
      message
    }
  };
}
