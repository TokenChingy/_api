/* eslint no-underscore-dangle: 0 */
// Import node modules.
import _ from 'lodash';

// Function that checks if a string is of valid JSON.
export function isJSONString(string) {
  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
}

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
      status: _.isEmpty(data) && _.isEmpty(message) ? 404 : code,
      method: request.method,
      url: request.originalUrl,
      message: _.isEmpty(data) && _.isEmpty(message) ? { error: 'not found' } : message
    }
  };
}

export function routerQueries(request, collection, collectionKey) {
  let data = collection.get(collectionKey);
  const headers = {};

  // Checks to see if the _filter query has been passed in.
  // If it has, it will then filter according to the JSON object passed in.
  // Reassign the filtered data to data.
  if (request.query._filter) {
    if (isJSONString(request.query._filter)) data = data.filter(JSON.parse(request.query._filter));
  }

  // Checks to see if the _sort query has been passed in.
  // If it has, it will then sort according to _order if it has been passed in.
  // Default sort order without _order is ascending.
  if (request.query._sort) {
    if (request.query._order === 'desc') {
      data = data.orderBy(request.query._sort, 'desc');
    } else {
      data = data.orderBy(request.query._sort, 'asc');
    }
  }

  // Checks to see if _start, _end, or _limit queries have been passed in.
  // If it has, it will then slice accordingly.
  // Default start is index 0 and end is index of array length.
  if (request.query._start || request.query._end || request.query._limit) {
    let startIndex = 0;
    let endIndex = data.size();

    _.assign(headers, {
      'X-Total-Count': endIndex
    });

    if (request.query._start && _.isNumber(parseInt(request.query._start, 10)))
      startIndex = request.query._start;
    if (request.query._end && _.isNumber(parseInt(request.query._end, 10)))
      endIndex = request.query._end;
    if (request.query._limit && _.isNumber(parseInt(request.query._limit, 10)))
      endIndex = request.query._limit;

    data = data.slice(startIndex, endIndex);
  }

  // Finally return queried data.
  return {
    headers,
    data
  };
}
