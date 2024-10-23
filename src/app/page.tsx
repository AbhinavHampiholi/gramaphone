import { ChangelogList } from '@/components/ChangelogList'
import { Header } from '@/components/Header'
import dbHelpers from '@/lib/db'

async function getChangelogs() {
  return await dbHelpers.getAllChangelogs();
}

export default async function Home() {
  const changelogs = await getChangelogs();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <ChangelogList changelogs={changelogs} />
      </div>
    </main>
  );
}