import { kv } from '@vercel/kv'

interface Changelog {
  id: string;
  repoUrl: string;
  content: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

// Helper functions for the database
const dbHelpers = {
  async saveChangelog(changelog: Omit<Changelog, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const fullChangelog = {
      ...changelog,
      id,
      createdAt
    };

    // Store the full changelog
    await kv.hset(`changelog:${id}`, fullChangelog);
    
    // Add to the repo's changelog list
    await kv.zadd(`repo:${changelog.repoUrl}`, {
      score: Date.now(),
      member: id
    });

    return id;
  },

  async getAllChangelogs(): Promise<Changelog[]> {
    const pattern = 'changelog:*';
    const keys = await kv.keys(pattern);
    
    if (keys.length === 0) return [];

    const changelogs = await Promise.all(
      keys.map(key => kv.hgetall(key))
    );

    return changelogs.filter(Boolean) as Changelog[];
  },

  async deleteChangelog(id: string): Promise<boolean> {
    const changelog = await kv.hgetall(`changelog:${id}`) as Changelog | null;
    
    if (!changelog) return false;

    // Remove from both the main storage and the repo index
    await Promise.all([
      kv.del(`changelog:${id}`),
      kv.zrem(`repo:${changelog.repoUrl}`, id)
    ]);

    return true;
  }
};

export default dbHelpers;