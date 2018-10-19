// Import node modules.
import _ from 'lodash';

// Import additional.
import { CRUDResponse } from '../helpers';

// Define and export a function that automatically generates a CRUD API.
export default function API(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Find all endpoint.
    Server.get(`/${key}`, (request, response) => {
      const foundAll = Collection.get(key).value();
      response.json(CRUDResponse(true, request, foundAll));
    });

    // Find one by id endpoint.
    Server.get(`/${key}/:id`, (request, response) => {
      const foundOne = Collection.get(key)
        .getById(request.params.id)
        .value();

      response.json(CRUDResponse(true, request, foundOne));
    });

    // Create one endpoint.
    Server.post(`/${key}/create`, (request, response) => {
      Collection.get(key)
        .insert(request.body)
        .write()
        .then(created => response.json(CRUDResponse(true, request, created)))
        .catch(error => response.json(error));
    });

    // Update one by id endpoint.
    Server.post(`/${key}/update/:id`, (request, response) => {
      Collection.get(key)
        .updateById(request.params.id, request.body)
        .write()
        .then(updated => response.json(CRUDResponse(true, request, updated)))
        .catch(error => response.json(error));
    });

    // Remove one by id endpoint.
    Server.post(`/${key}/remove/:id`, (request, response) => {
      Collection.get(key)
        .removeById(request.params.id)
        .write()
        .then(removed => response.json(CRUDResponse(true, request, removed)))
        .catch(error => response.json(error));
    });
  });
}
