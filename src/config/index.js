// API configuration.
export const API_CONFIG = {
  NAME: '_api',
  PORT: 1337,
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
