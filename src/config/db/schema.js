// Define your collections schema.
export const CollectionsSchema = [
  {
    users: []
  }
];

// Define you document schemas.
// NOTE: Your individual schema must be name the same as your collection name.
// EXAMPLE: If you collection is called 'users', your document schema must be called 'users'.
export const DocumentsSchema = {
  users: {
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      firstName: {
        type: 'string'
      },
      lastName: {
        type: 'string'
      }
    },
    additionalProperties: false
  }
};
