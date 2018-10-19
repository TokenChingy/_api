# \_api

\_api is an auto-generated CRUD API that utilises [LowDB](https://github.com/typicode/lowdb) and [ExpressJS](https://expressjs.com/). All you need to do is edit a configuration file and you will have a basic CRUP API ready to use!

## Getting started

Download or clone this repository and then:

1. Enter the root directory of \_api.

```bash
cd _api/
```

1. Install the required node moduels:

```bash
npm install
```

1. Open up `src/config/index.js` in your favourite text editor and start editing:

```js
SECRET: 'MY_SUPER_SECRET_KEY',
COLLECTIONS: [
  {
    users: []
  }
]
```

The `SECRET` property is your super secret key for encrypting and decrypting your collection files. Make this super private and hard to guess! By default, this API encrypts and decrypts the collection files, you can disable this by removing the logic.

`COLLECTIONS` is where the magic happens — this property is what generates the different collections that make up your database which in turn make up the CRUD API. If you want to add more collections, just add an object into the `COLLECTIONS` array like so:

```js
COLLECTIONS: [
  {
    users: [],
  },
  {
    your_collection: [],
  },
];
```

_You can delete the users collection, it's there as an example._

## Accessing the API

You can use Postman to access and test the API. Otherwise, implement the correct queries in your application to query the RESTful endpoints.

The endpoints are pretty simple:

- Find all (GET).

```url
hostname:port/your_collection
```

- Find one by Id (GET).

```url
hostname:port/your_collection/id
```

- Create one (POST).

```url
hostname:port/your_collection/create
```

- Update one by Id (POST).

```url
hostname:port/your_collection/update/id
```

- Remove one by Id (POST).

```url
hostname:port/your_collection/remove/id
```

### Using the API

When you post to one of the POST enabled endpoints, you will need to set your headers `Content-Type` to be `application/json`. You can then post in an JSON object.

For example, if I want to create a user with a first and last name I would do the following:

```json
{
  "firstName": "Jo",
  "lastName": "Smith"
}
```

With this JSON object, I would POST it to `hostname:port/users/create`. Upon successful creation of the user, the API will return an object like so:

```json
{
  "data": {
    "firstName": "Jo",
    "lastName": "Smith"
  },
  "event": {
    "status": "success",
    "method": "POST",
    "url": "users/create"
  }
}
```

## Middleware

If you need to define middleware functions, you can do that easily through the middleware file: `src/middleware/index.js`. All you need to do is define your functions in here and they will be loaded to each collection automatically as lodash mixins (So you can chain them with other middleware or lodash functions). An example:

```js
// Create and export an object to hold middleware function declarations.
const Middleware = {
  helloWorld: () => {
    return 'Hello World!';
  },
};

export default Middleware;
```

To use this, you would then need to modify the API routes in the `src/api/index.js` file like so (Not that this would actually do anything):

```js
// Extracted express route for 'findAll'.
Server.get(`/${key}`, (request, response) => {
  const foundAll = Collection.get(key)
    .helloWorld()
    .value();
  response.json(APIResponse(true, request, foundAll));
});
```

On-top of these chained middleware functions, you can also utilise any ExpressJS middleware in the same way. Just make sure you define it before the collection/database generation logic.

## Helpers

The helpers file: `src/helpers/index.js` contain all your reusable functions. Just import this file anywhere you need it and you will have access to the functions defined and exported in there.
