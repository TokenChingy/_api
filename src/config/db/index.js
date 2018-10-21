// Import schemas.
import { CollectionsSchema, DocumentsSchema } from './schema';

// DB configuration.
const DB_CONFIG = {
  LOCATION: 'src/collections',
  SECRET: 'MY_SUPER_SECRET_KEY',
  COLLECTIONS: CollectionsSchema,
  SCHEMA: DocumentsSchema
};

export default DB_CONFIG;
