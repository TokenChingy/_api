// Import node modules.
import _ from 'lodash';

// Import additional.
import { buildResponse } from '../helpers';

// Define and export a function that automatically generates a CRUD API for a particular collection.
export default function API(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Find all endpoint.
    Server.get(`/${key}`, (request, response) => {
      const foundAll = Collection.get(key).value();
      response.json(buildResponse(200, request, foundAll));
    });

    // Find one by id endpoint.
    Server.get(`/${key}/:id`, (request, response) => {
      const foundOne = Collection.get(key)
        .getById(request.params.id)
        .value();
      response.json(buildResponse(200, request, foundOne));
    });

    // Create one endpoint.
    Server.post(`/${key}/create`, (request, response) => {
      Collection.get(key)
        .insert(request.body)
        .write()
        .then(created => {
          response.json(buildResponse(200, request, created));
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
          response.json(buildResponse(200, request, updated));
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
          response.json(buildResponse(200, request, removed));
        })
        .catch(error => {
          throw new Error(error);
        });
    });
  });
}
