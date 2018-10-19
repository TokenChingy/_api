// API configuration.
export const API_CONFIG = {
  NAME: 'Bob',
  PORT: 3000,
  MORGAN: 'dev'
};

// DB configuration.
export const DB_CONFIG = {
  LOCATION: 'src/collections',
  SECRET: 'MY_SUPER_SECRET_KEY',
  COLLECTIONS: [
    {
      users: []
    }
  ]
};
