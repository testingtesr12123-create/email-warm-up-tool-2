import { defineConfig } from 'drizzle-kit';

const dbConfig = defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});

export default dbConfig;
