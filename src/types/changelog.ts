// Database model (matches DB column names)
export interface ChangelogDB {
    id: string;
    repourl: string;
    content: string;
    generatedat: string;
    periodstart: string;
    periodend: string;
    createdat: string;
  }
  
  // Frontend model (camelCase)
  export interface Changelog {
    id: string;
    repoUrl: string;
    content: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
  }
  
  // Utility function to transform DB model to frontend model
  export function transformDbToChangelog(dbChangelog: ChangelogDB): Changelog {
    return {
      id: dbChangelog.id,
      repoUrl: dbChangelog.repourl,
      content: dbChangelog.content,
      generatedAt: dbChangelog.generatedat,
      periodStart: dbChangelog.periodstart,
      periodEnd: dbChangelog.periodend,
      createdAt: dbChangelog.createdat
    };
  }