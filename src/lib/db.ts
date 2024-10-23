import { sql } from '@vercel/postgres';
import { ChangelogDB } from '@/types/changelog';

// Initialize the database table
export async function initializeDb() {
  try {
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

    await sql`
      CREATE INDEX IF NOT EXISTS idx_changelogs_repo ON changelogs(repourl)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_changelogs_dates ON changelogs(generatedat)
    `;
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDb().catch(console.error);

const dbHelpers = {
  async saveChangelog(changelog: Omit<ChangelogDB, 'id' | 'createdat'>): Promise<string> {
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

  async getAllChangelogs(): Promise<ChangelogDB[]> {
    const result = await sql<ChangelogDB>`
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