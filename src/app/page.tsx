import { ChangelogList } from '@/components/ChangelogList'
import { Header } from '@/components/Header'
import dbHelpers from '@/lib/db'
import { transformDbToChangelog } from '@/types/changelog'

async function getChangelogs() {
  try {
    console.log('Fetching initial changelogs...');
    const dbChangelogs = await dbHelpers.getAllChangelogs();
    const changelogs = dbChangelogs.map(transformDbToChangelog);
    console.log('Initial changelogs:', changelogs);
    return changelogs;
  } catch (error) {
    console.error('Error fetching initial changelogs:', error);
    return [];
  }
}

export default async function Home() {
  const initialChangelogs = await getChangelogs();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <ChangelogList initialChangelogs={initialChangelogs} />
      </div>
    </main>
  );
}