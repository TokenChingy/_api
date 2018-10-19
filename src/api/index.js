// Import node modules.
import _ from 'lodash';

// Import additional.
import { APIResponse } from '../helpers';

// Define and export a function that automatically generates a CRUD API.
export default function API(Server, Collection) {
  _.forEach(Collection.value(), (object, key) => {
    // Find all endpoint.
    Server.get(`/${key}`, (request, response) => {
      const foundAll = Collection.get(key).value();
      if (foundAll) response.json(APIResponse(true, request, foundAll));
      else response.json(APIResponse(false, request));
    });

    // Find one by id endpoint.
    Server.get(`/${key}/:id`, (request, response) => {
      const foundOne = Collection.get(key)
        .getById(request.params.id)
        .value();

      if (foundOne) response.json(APIResponse(true, request, foundOne));
      else response.json(APIResponse(false, request));
    });

    // Create one endpoint.
    Server.post(`/${key}/create`, (request, response) => {
      Collection.get(key)
        .insert(request.body)
        .write()
        .then(created => {
          if (created) response.json(APIResponse(true, request, created));
          else response.json(APIResponse(false, request));
        })
        .catch(error => response.json(error));
    });

    // Update one by id endpoint.
    Server.post(`/${key}/update/:id`, (request, response) => {
      Collection.get(key)
        .updateById(request.params.id, request.body)
        .write()
        .then(updated => {
          if (updated) response.json(APIResponse(true, request, updated));
          else response.json(APIResponse(false, request));
        })
        .catch(error => response.json(error));
    });

    // Remove one by id endpoint.
    Server.post(`/${key}/remove/:id`, (request, response) => {
      Collection.get(key)
        .removeById(request.params.id)
        .write()
        .then(removed => {
          if (removed) response.json(APIResponse(true, request, removed));
          else response.json(APIResponse(false, request));
        })
        .catch(error => response.json(error));
    });
  });
}
