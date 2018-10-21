// API configuration.
const SERVER_CONFIG = {
  NAME: '_api',
  PORT: 1337,
  MORGAN: 'dev',
  RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 Minute.
    max: 100 // Requests per windowMs.
  },
  LOADER: ''
};

export default SERVER_CONFIG;
