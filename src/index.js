// Import node modules.
import BodyParser from 'body-parser';
import Cryptr from 'cryptr';
import Express from 'express';
import FileAsync from 'lowdb/adapters/FileAsync';
import LodashId from 'lodash-id';
import LowDB from 'lowdb';
import Morgan from 'morgan';
import RateLimit from 'express-rate-limit';
import _ from 'lodash';

// Import additional modules.
import DB_CONFIG from './config/db';
import SERVER_CONFIG from './config/server';
import Middleware from './middleware';
import { RouteDynamic, RouteErrors, RouteStatic } from './routes';
import { getTotalCollections } from './helpers';

// Create server object.
// Configure server with middleware to parse JSON objects and URL parameters.
const Server = new Express();

// Define a rate limit for the express server.
// This rate limit is global and will apply to all endpoints.
const ServerRateLimit = new RateLimit(SERVER_CONFIG.RATE_LIMIT);

// Declare server middleware.
Server.use(Morgan(SERVER_CONFIG.MORGAN));
Server.use(BodyParser.json());
Server.use(
  BodyParser.urlencoded({
    extended: true
  })
);
Server.use(ServerRateLimit);

// Create a key and encryption object.
const Encryption = {};

if (DB_CONFIG.SECRET.length > 0) {
  const Key = new Cryptr(DB_CONFIG.SECRET);

  _.assign(Encryption, {
    serialize: data => Key.encrypt(JSON.stringify(data)),
    deserialize: data => JSON.parse(Key.decrypt(data))
  });
}

// Track progress of collections being loaded successfully.
let inMemory = 0;
let inFileSystem = 0;

// Parse through the configuration for the database to generate each collection and it's API.
_.forEach(DB_CONFIG.COLLECTIONS, element => {
  _.forEach(element, (object, key) => {
    // Create new adapter for LowDB to read/write.
    // Encrypt/decrypt corresponding collection file.
    const Adapter = new FileAsync(`${DB_CONFIG.LOCATION}/${key}.json`, Encryption);

    // Use adapter for LowDB instance.
    // Set defaults and write new collection file if none exists.
    // Load collection into memory.
    LowDB(Adapter)
      .then(Collection => {
        Collection.defaults(element)
          .write()
          .then(() => {
            inFileSystem += 1;

            // Generate CRUD API routes for this collection.
            RouteDynamic(Server, Collection);
          })
          .catch(error => {
            throw new Error(error);
          });

        // Attach middleware functions to LowDB instance.
        Collection._.mixin(LodashId);
        Collection._.mixin(Middleware);
      })
      .then(() => {
        inMemory += 1;
      })
      .catch(error => {
        throw new Error(error);
      });
  });
});

// Static routes defined here instead of the router function. This is because the router function gets called multiple times to define routes for each collection.
RouteStatic(Server);

// Poll until collections have all been loaded in memory and saved to the file system.
// When ready, start Express server and listen to requests.
const CollectionsReady = setInterval(() => {
  if (inMemory + inFileSystem === getTotalCollections(DB_CONFIG.COLLECTIONS) * 2) {
    // Error routes defined here once all other routes have been called.
    RouteErrors(Server);

    // Start listening on configured port.
    Server.listen(SERVER_CONFIG.PORT, () => {
      process.stdout.write(
        `${SERVER_CONFIG.NAME} is now listening on port ${SERVER_CONFIG.PORT}\n`
      );
    });

    // Kill loop when all good.
    clearInterval(CollectionsReady);
  }
}, 1000 / 100);
