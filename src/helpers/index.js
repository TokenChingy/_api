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

  let filterParameters;

  // Set default sort parameters.
  const sortParameters = {
    sort: '',
    order: 'asc'
  };

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
    if (query === '_filter') {
      if (isJSONString(queryValue)) filterParameters = JSON.parse(queryValue);
    }

    // Checks to see if the _sort query has been passed in.
    if (query === '_sort' || query === '_order') {
      if (query === '_sort') _.assign(sortParameters, { sort: queryValue });
      if (query === '_order') _.assign(sortParameters, { order: queryValue });
    }

    // Checks to see if _start or _end queries have been passed in.
    if (query === '_start' || query === '_end') {
      const index = parseInt(queryValue, 10);

      if (_.isNumber(index)) {
        if (query === '_start') _.assign(sliceParameters, { start: index });
        if (query === '_end') _.assign(sliceParameters, { end: index });

        _.assign(headers, {
          'X-Total-Count': data.size()
        });
      }
    }
  });

  _.forEach(request.query, (queryValue, query) => {
    // Filter data according to the parameters.
    if (query === '_filter') data = data.filter(filterParameters);

    // Sort data according to the parameters.
    if (query === '_sort') data = data.orderBy(sortParameters.sort, sortParameters.order);

    // Slice data according to the parameters.
    if (query === '_start' || query === '_end')
      data = data.slice(sliceParameters.start, sliceParameters.end);
  });

  // Finally return queried data.
  return {
    headers,
    data
  };
}
