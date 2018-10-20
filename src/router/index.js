/* eslint no-underscore-dangle: 0 */
// Import node modules.
import _ from 'lodash';

// TODO:
// - All.
// - Filter.
// - Sort.
// - Paginate.
// - Slice.
// - Operators.
// - Full text search.
// - Relationships.
// - DB.

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

// // Define and export a function that automatically generates a CRUD API for a particular collection.
// export default function API(Server, Collection) {
//   _.forEach(Collection.value(), (object, key) => {
//     // Find all endpoint.
//     Server.get(`/${key}/`, (request, response) => {
//       const foundAll = Collection.get(key).value();
//       response.json(responseBuilder(200, request, foundAll, {}));
//     });

//     // Find where endpoint.
//     Server.get(`/${key}/where:?/`, (request, response) => {
//       if (!_.isEmpty(request.query.id)) {
//         const foundOne = Collection.get(key)
//           .getById(request.query.id)
//           .value();

//         response.json(responseBuilder(200, request, foundOne, {}));
//       } else {
//         const foundAllWhere = Collection.get(key)
//           .filter(request.query)
//           .value();

//         response.json(responseBuilder(200, request, foundAllWhere, {}));
//       }
//     });

//     // Create one endpoint.
//     Server.post(`/${key}/create`, (request, response) => {
//       Collection.get(key)
//         .insert(request.body)
//         .write()
//         .then(created => {
//           response.json(responseBuilder(200, request, created, {}));
//         })
//         .catch(error => {
//           throw new Error(error);
//         });
//     });

//     // Update one or where endpoint.
//     Server.post(`/${key}/update/:where?`, (request, response) => {
//       if (!_.isEmpty(request.query.id)) {
//         Collection.get(key)
//           .updateById(request.query.id, request.body)
//           .write()
//           .then(updated => {
//             response.json(responseBuilder(200, request, updated, {}));
//           })
//           .catch(error => {
//             throw new Error(error);
//           });
//       } else {
//         Collection.get(key)
//           .updateWhere(request.query, request.body)
//           .write()
//           .then(updated => {
//             response.json(responseBuilder(200, request, updated, {}));
//           })
//           .catch(error => {
//             throw new Error(error);
//           });
//       }
//     });

//     // Remove one or where endpoint.
//     Server.post(`/${key}/remove/:where?`, (request, response) => {
//       if (!_.isEmpty(request.query.id)) {
//         Collection.get(key)
//           .removeById(request.query.id, request.body)
//           .write()
//           .then(removed => {
//             response.json(responseBuilder(200, request, removed, {}));
//           })
//           .catch(error => {
//             throw new Error(error);
//           });
//       } else {
//         Collection.get(key)
//           .removeWhere(request.query, request.body)
//           .write()
//           .then(removed => {
//             response.json(responseBuilder(200, request, removed, {}));
//           })
//           .catch(error => {
//             throw new Error(error);
//           });
//       }
//     });
//   });
// }