/* eslint no-underscore-dangle: 0 */
// Import node modules.
import _ from 'lodash';

// Import additional.
import { isJSONString, responseBuilder, routerQueries } from '../helpers';

// Define and export a function that automatically generates a CRUD API for a particular collection.
export default function Router(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Endpoint: Find all, find by id, find by filter.
    Server.get(`/${key}:?`, (request, response) => {
      const result = routerQueries(request, Collection, key);

      _.forEach(result.headers, (value, header) => {
        response.set(header, value);
      });

      response.json(responseBuilder(200, request, result.data));
    });

    // Endpoint: Create one.
    Server.post(`/${key}/create`, (request, response) => {
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
        response.json(responseBuilder(404, request));
      }
    });

    // Endpoint: Remove by id or remove by filter.
    Server.post(`/${key}/remove:?`, (request, response) => {
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
        response.json(responseBuilder(404, request));
      }
    });
  });
}
