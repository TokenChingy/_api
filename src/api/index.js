// Import node modules.
import _ from 'lodash';

// Import additional.
import { responseBuilder } from '../helpers';

// Define and export a function that automatically generates a CRUD API for a particular collection.
export default function API(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Find all endpoint.
    Server.get(`/${key}`, (request, response) => {
      const foundAll = Collection.get(key).value();
      response.json(responseBuilder(200, request, foundAll, { success: `found ${key}` }));
    });

    // Find one by id endpoint.
    Server.get(`/${key}/:id`, (request, response) => {
      const foundOne = Collection.get(key)
        .getById(request.params.id)
        .value();
      response.json(
        responseBuilder(200, request, foundOne, {
          success: `found ${key} with id: ${request.params.id}`
        })
      );
    });

    // Create one endpoint.
    Server.post(`/${key}/create`, (request, response) => {
      Collection.get(key)
        .insert(request.body)
        .write()
        .then(created => {
          response.json(
            responseBuilder(200, request, created, {
              success: `created ${key} with id: ${created.id}`
            })
          );
        })
        .catch(error => {
          throw new Error(error);
        });
    });

    // Update one by id endpoint.
    Server.post(`/${key}/update/:id`, (request, response) => {
      Collection.get(key)
        .updateById(request.params.id, request.body)
        .write()
        .then(updated => {
          response.json(
            responseBuilder(200, request, updated, {
              success: `updated ${key} with id: ${updated.id}`
            })
          );
        })
        .catch(error => {
          throw new Error(error);
        });
    });

    // Remove one by id endpoint.
    Server.post(`/${key}/remove/:id`, (request, response) => {
      Collection.get(key)
        .removeById(request.params.id)
        .write()
        .then(removed => {
          response.json(
            responseBuilder(200, request, { success: `removed ${key} with id: ${removed.id}` })
          );
        })
        .catch(error => {
          throw new Error(error);
        });
    });
  });
}
