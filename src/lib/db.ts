import { sql } from '@vercel/postgres';

interface Changelog {
  id: string;
  repourl: string;  // lowercase to match DB
  content: string;
  generatedat: string;  // lowercase to match DB
  periodstart: string;  // lowercase to match DB
  periodend: string;    // lowercase to match DB
  createdat: string;    // lowercase to match DB
}

// Initialize the database table
export async function initializeDb() {
  try {
    // Create table with lowercase column names
    await sql`
      CREATE TABLE IF NOT EXISTS changelogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repourl TEXT NOT NULL,
        content TEXT NOT NULL,
        generatedat TIMESTAMP WITH TIME ZONE NOT NULL,
        periodstart TIMESTAMP WITH TIME ZONE NOT NULL,
        periodend TIMESTAMP WITH TIME ZONE NOT NULL,
        createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create repo index with lowercase column name
    await sql`
      CREATE INDEX IF NOT EXISTS idx_changelogs_repo ON changelogs(repourl)
    `;

    // Create dates index with lowercase column name
    await sql`
      CREATE INDEX IF NOT EXISTS idx_changelogs_dates ON changelogs(generatedat)
    `;
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Initialize the database on module load
initializeDb().catch(console.error);

const dbHelpers = {
  async saveChangelog(changelog: Omit<Changelog, 'id' | 'createdat'>): Promise<string> {
    const result = await sql<{ id: string }>`
      INSERT INTO changelogs (repourl, content, generatedat, periodstart, periodend)
      VALUES (
        ${changelog.repourl},
        ${changelog.content},
        ${changelog.generatedat},
        ${changelog.periodstart},
        ${changelog.periodend}
      )
      RETURNING id;
    `;
    
    return result.rows[0].id;
  },

  async getAllChangelogs(): Promise<Changelog[]> {
    const result = await sql<Changelog>`
      SELECT 
        id,
        repourl,
        content,
        generatedat::text,
        periodstart::text,
        periodend::text,
        createdat::text
      FROM changelogs 
      ORDER BY generatedat DESC;
    `;
    
    return result.rows;
  },

  async deleteChangelog(id: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM changelogs 
      WHERE id = ${id}
      RETURNING id;
    `;
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
};

export default dbHelpers;