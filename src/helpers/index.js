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
      status: _.isEmpty(data) ? 404 : code,
      method: request.method,
      url: request.originalUrl,
      message: _.isEmpty(data) && _.isEmpty(message) ? { error: 'not found' } : message
    }
  };
}

// Function that handles all the data operation functions of the router.
// Currently, this really is only applicable to the 'find' endpoint.
// TODO: Data operators such as _gte, _lte, gt, and lt. These would be applicable to the other endpoints.
export function routerQueries(request, collection, collectionKey) {
  // Get data from relevant collection.
  // Define empty header object.
  let data = collection.get(collectionKey);
  const headers = {};

  // Set default slice parameters.
  const sliceParameters = {
    start: 0,
    end: data.size()
  };

  // _.forEach doesn't have an iterator...
  let forIteration = 0;

  // Checks each query operation in order.
  _.forEach(request.query, (queryValue, query) => {
    // Iterate on each cycle.
    forIteration += 1;

    // Checks to see if the _id query has been passed in.
    // This will only trigger if the query is the first parameter.
    // It will also mean, all other parameters are redundant.
    if (query === '_id' && forIteration === 1) {
      data = data.find({ id: queryValue });

      // This return line will break out of _.forEach.
      return false;
    }

    // Checks to see if the _filter query has been passed in.
    // If it has, it will then filter according to the JSON object passed in.
    // Reassign the filtered data to data.
    if (query === '_filter') {
      if (isJSONString(queryValue)) data = data.filter(JSON.parse(queryValue));
    }

    // Checks to see if the _sort query has been passed in.
    // If it has, it will then sort according to _order if it has been passed in.
    // Default sort order without _order is ascending.
    if (query === '_sort') {
      if (queryValue === 'desc') {
        data = data.orderBy(queryValue, 'desc');
      } else {
        data = data.orderBy(queryValue, 'asc');
      }
    }

    // Checks to see if _start or _end queries have been passed in.
    // If it has, it will then slice accordingly.
    // Default start is index 0 and end is index of array length.
    if (query === '_start' || query === '_end') {
      const index = parseInt(queryValue, 10);

      if (_.isNumber(index)) {
        if (query === '_start') _.assign(sliceParameters, { start: index });
        if (query === '_end') _.assign(sliceParameters, { end: index });
      }

      if (forIteration === _.size(request.query)) {
        _.assign(headers, {
          'X-Total-Count': data.size()
        });

        data = data.slice(sliceParameters.start, sliceParameters.end);
      }
    }
  });

  // Finally return queried data.
  return {
    headers,
    data
  };
}
