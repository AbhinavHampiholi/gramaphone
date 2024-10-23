import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'gramophone.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS changelogs (
    id TEXT PRIMARY KEY,
    repoUrl TEXT NOT NULL,
    content TEXT NOT NULL,
    generatedAt TEXT NOT NULL,
    periodStart TEXT NOT NULL,
    periodEnd TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;