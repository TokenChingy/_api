/* eslint no-underscore-dangle: 0 */
// Import node modules.
import _ from 'lodash';

// Import additional.
import { isJSONString, responseBuilder, requestQueryHandler } from '../helpers';

// Define and export a function that automatically generates a CRUD API for a particular collection.
export default function Router(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Endpoint: Find all, find by id, and find by filter.
    Server.get(`/${key}:?`, (request, response) => {
      // Pass request query object as well as reference to the relevant collection.
      // The result returned will be data queried, and operated on with the relevant data operators.
      const result = requestQueryHandler(request, Collection, key);

      // Iterate through the header object returned by the query handler and set additional headers.
      _.forEach(result.headers, (value, header) => {
        response.set(header, value);
      });

      // Build and send the response object.
      response.json(responseBuilder(200, request, result.data));
    });

    // Endpoint: Create one.
    Server.post(`/${key}/create`, (request, response) => {
      // Get a handle on the correct collection.
      // Insert the new document JSON object.
      // Write it to disk.
      // After write; build and send a response object.
      Collection.get(key)
        .insert(request.body)
        .write()
        .then(created => {
          response.json(responseBuilder(200, request, created));
        })
        .catch();
    });

    // Endpoint: Update by id or update by filter.
    Server.post(`/${key}/update:?`, (request, response) => {
      // Check if there is an _id query in the request query object.
      // If there is, then update the document/documents by id.
      // If there isn't an _id query, then check if there is a _filter query.
      // If there is a _filter query, update by filter.
      // Else, return not found.
      if (!_.isEmpty(request.query._id)) {
        Collection.get(key)
          .updateById(request.query._id, request.body)
          .write()
          .then(updated => {
            response.json(responseBuilder(200, request, updated));
          })
          .catch(error => {
            throw new Error(error);
          });
      } else if (request.query._filter && isJSONString(request.query._filter)) {
        Collection.get(key)
          .updateWhere(JSON.parse(request.query._filter), request.body)
          .write()
          .then(updated => {
            response.json(responseBuilder(200, request, updated));
          })
          .catch(error => {
            throw new Error(error);
          });
      } else {
        response.json(responseBuilder(400, request, {}, { error: 'bad request' }));
      }
    });

    // Endpoint: Remove by id or remove by filter.
    Server.post(`/${key}/remove:?`, (request, response) => {
      // Check if there is an _id query in the request query object.
      // If there is, then remove the document/documents by id.
      // If there isn't an _id query, then check if there is a _filter query.
      // If there is a _filter query, remove by filter.
      // Else, return not found.
      if (!_.isEmpty(request.query._id)) {
        Collection.get(key)
          .removeById(request.query._id, request.body)
          .write()
          .then(removed => {
            response.json(responseBuilder(200, request, removed, {}));
          })
          .catch(error => {
            throw new Error(error);
          });
      } else if (request.query._filter && isJSONString(request.query._filter)) {
        Collection.get(key)
          .removeWhere(JSON.parse(request.query._filter), request.body)
          .write()
          .then(removed => {
            response.json(responseBuilder(200, request, removed));
          })
          .catch(error => {
            throw new Error(error);
          });
      } else {
        response.json(responseBuilder(400, request, {}, { error: 'bad request' }));
      }
    });
  });
}
