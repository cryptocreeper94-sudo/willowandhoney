import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!require('fs').existsSync(dataDir)) {
  require('fs').mkdirSync(dataDir, { recursive: true });
}

// Create a local SQLite database file inside the data directory
export const sqlite: Database.Database = new Database(path.join(dataDir, 'willowandhoney.db'));

// Initialize Drizzle with the schema
export const db = drizzle(sqlite, { schema });
