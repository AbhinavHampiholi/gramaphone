import { sql } from '@vercel/postgres';

interface Changelog {
  id: string;
  repoUrl: string;
  content: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

// Initialize the database table
export async function initializeDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS changelogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repoUrl TEXT NOT NULL,
        content TEXT NOT NULL,
        generatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
        periodStart TIMESTAMP WITH TIME ZONE NOT NULL,
        periodEnd TIMESTAMP WITH TIME ZONE NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_changelogs_repo ON changelogs(repoUrl);
      CREATE INDEX IF NOT EXISTS idx_changelogs_dates ON changelogs(generatedAt);
    `;
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Initialize the database on module load
initializeDb();

const dbHelpers = {
  async saveChangelog(changelog: Omit<Changelog, 'id' | 'createdAt'>): Promise<string> {
    const result = await sql<{ id: string }>`
      INSERT INTO changelogs (repoUrl, content, generatedAt, periodStart, periodEnd)
      VALUES (
        ${changelog.repoUrl},
        ${changelog.content},
        ${changelog.generatedAt},
        ${changelog.periodStart},
        ${changelog.periodEnd}
      )
      RETURNING id;
    `;
    
    return result.rows[0].id;
  },

  async getAllChangelogs(): Promise<Changelog[]> {
    const result = await sql<Changelog>`
      SELECT 
        id,
        repoUrl,
        content,
        generatedAt::text,
        periodStart::text,
        periodEnd::text,
        createdAt::text
      FROM changelogs 
      ORDER BY generatedAt DESC;
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