/* eslint no-underscore-dangle: 0 */
// Import node modules.
import Ajv from 'ajv';
import _ from 'lodash';

// Create AJV object.
const ajv = new Ajv({ allErrors: true });

function extractKeyFromComparator(query) {
  const regex = new RegExp('.+?(?=_)');
  const queryKey = query.match(regex);
  return queryKey[0];
}

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

  // Checks to see if the _id query has been passed in.
  // If it has, discard all other queries and return the document with that particular id.
  if (request.query._id) {
    data = data.find({ id: request.query._id });

    // Return headers and data objects.
    return {
      headers,
      data
    };
  }

  // Define an object to store the query parameters.
  const queryParameters = {
    slice: {
      start: 0,
      end: data.size().value()
    },
    filter: {},
    compare: {
      gt: {
        key: undefined,
        benchmark: undefined
      },
      gte: {
        key: undefined,
        benchmark: undefined
      },
      lt: {
        key: undefined,
        benchmark: undefined
      },
      lte: {
        key: undefined,
        benchmark: undefined
      }
    },
    sort: {
      key: '',
      order: 'asc'
    }
  };

  // Parse the request query object and populate the queryParameters object with queries.
  _.forEach(request.query, (queryValue, query) => {
    // Define an empty comparator variable.
    let comparatorType;

    // Check if the query includes a comparator.
    // Example: If the query is key_gt, then the comparator will be _gt.
    if (query.includes('_gt')) comparatorType = '_gt';
    if (query.includes('_gte')) comparatorType = '_gte';
    if (query.includes('_lt')) comparatorType = '_lt';
    if (query.includes('_lte')) comparatorType = '_lte';

    // Check for the comparator types.
    // Assign the parameters to queryParameters.comparator.comparatorType.key/benchmark.
    switch (comparatorType) {
      case '_gt':
        queryParameters.compare.gt.key = extractKeyFromComparator(query);
        queryParameters.compare.gt.benchmark = parseInt(queryValue, 10);
        break;
      case '_gte':
        queryParameters.compare.gte.key = extractKeyFromComparator(query);
        queryParameters.compare.gte.benchmark = parseInt(queryValue, 10);
        break;
      case '_lt':
        queryParameters.compare.lt.key = extractKeyFromComparator(query);
        queryParameters.compare.lt.benchmark = parseInt(queryValue, 10);
        break;
      case '_lte':
        queryParameters.compare.lte.key = extractKeyFromComparator(query);
        queryParameters.compare.lte.benchmark = parseInt(queryValue, 10);
        break;
      default:
        break;
    }

    // Check for the different types of queries.
    // Assign the respective query parameters to the queryParameter object.
    switch (query) {
      case '_start':
        queryParameters.slice.start = parseInt(queryValue, 10);
        break;
      case '_end':
        queryParameters.slice.end = parseInt(queryValue, 10);
        break;
      case '_filter':
        if (isJSONString(queryValue)) _.assign(queryParameters.filter, JSON.parse(queryValue));
        break;
      case '_sort':
        queryParameters.sort.key = queryValue;
        break;
      case '_order':
        queryParameters.sort.order = queryValue;
        break;
      default:
        break;
    }
  });

  // Once the queryParameter object has been filled, run through the object and execute queries.
  // NOTE: The queries are exectures in the order of destructive first then ordering.
  // ORDER: Slice -> Filter -> Compare -> Sort.
  _.forEach(queryParameters, (queryValue, query) => {
    switch (query) {
      case 'slice':
        data = data.slice(queryValue.start, queryValue.end);
        _.assign(headers, {
          'X-Total-Count': data.size()
        });
        break;
      case 'filter':
        if (!_.isEmpty(queryValue)) data = data.filter(queryValue);
        break;
      case 'comparator':
        if (queryValue.gt.key !== undefined) {
          data = data.filter(document => document[queryValue.gt.key] > queryValue.gt.benchmark);
        }
        if (queryValue.gte.key !== undefined) {
          data = data.filter(document => document[queryValue.gte.key] >= queryValue.gte.benchmark);
        }
        if (queryValue.lt.key !== undefined) {
          data = data.filter(document => document[queryValue.lt.key] < queryValue.lt.benchmark);
        }
        if (queryValue.lte.key !== undefined) {
          data = data.filter(document => document[queryValue.lte.key] <= queryValue.lte.benchmark);
        }
        break;
      case 'sort':
        if (!_.isEmpty(queryValue.key)) data = data.orderBy(queryValue.key, queryValue.order);
        break;
      default:
        break;
    }
  });

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
