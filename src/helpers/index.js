/* eslint no-underscore-dangle: 0 */
// Import node modules.
import Ajv from 'ajv';
import _ from 'lodash';

// Create AJV object.
const ajv = new Ajv({ allErrors: true });

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

// Function that extracts and applies queries to the response data.
// TODO: Rewrite the logic for optimization as it currently has too many _.forEach iterations.
// TODO: Data operators such as _gte, _lte, gt, and lt. These would be applicable to the other endpoints.
export function requestQueryHandler(request, collection, collectionKey) {
  // Get data from relevant collection.
  // Define empty header object.
  let data = collection.get(collectionKey);
  const headers = {};

  // Set default data operator parameters.
  const filterParameters = {};
  const sortParameters = {
    sort: '',
    order: 'asc'
  };
  const sliceParameters = {
    start: 0,
    end: data.size()
  };

  // Checks to see if the _id query has been passed in.
  // This will only trigger if the query is the first parameter.
  // It will also mean, all other parameters are redundant.
  if (request.query._id) {
    data = data.find({ id: request.query._id });

    // Return headers and data objects.
    return {
      headers,
      data
    };
  }

  // First _.forEach iteration to extract queries from the request queries object.
  _.forEach(request.query, (queryValue, query) => {
    // Checks to see if the _filter query has been passed in.
    if (query === '_filter') {
      if (isJSONString(queryValue)) _.assign(filterParameters, JSON.parse(queryValue));
    }

    // Checks to see if the _sort query has been passed in.
    if (query === '_sort' || query === '_order') {
      if (query === '_sort') _.assign(sortParameters, { sort: queryValue });
      if (query === '_order') _.assign(sortParameters, { order: queryValue });
    }

    // Checks to see if _start or _end queries have been passed in.
    if (query === '_start' || query === '_end') {
      // Incase a string number is passed in, make sure it's a number.
      const index = parseInt(queryValue, 10);

      // Check that the index is an actual number.
      if (_.isNumber(index)) {
        if (query === '_start') _.assign(sliceParameters, { start: index });
        if (query === '_end') _.assign(sliceParameters, { end: index });

        // Assign total count of documents in collection to the header property 'X-Total-Count'.
        _.assign(headers, {
          'X-Total-Count': data.size()
        });
      }
    }
  });

  // Second forEach iteration to apply the queries to the data in order based on the request queries object.
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

// Simple straight forward schema validation.
export function validateSchema(object, schema) {
  const check = ajv.compile(schema);
  const isValid = check(object);

  return isValid;
}
