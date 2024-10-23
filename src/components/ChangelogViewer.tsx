'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, CalendarRange } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Changelog {
  id: string;
  repoUrl: string;
  content: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
}

export default function ChangelogViewer() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  useEffect(() => {
    fetchChangelogs();
  }, []);

  async function fetchChangelogs() {
    try {
      const response = await fetch('/api/changelogs');
      if (!response.ok) throw new Error('Failed to fetch changelogs');
      const data = await response.json();
      setChangelogs(data);
    } catch (error) {
      console.error('Error fetching changelogs:', error);
    }
  }

  // Group changelogs by repository
  const repositories = changelogs.reduce((acc, changelog) => {
    const repos = acc;
    if (!repos[changelog.repoUrl]) {
      repos[changelog.repoUrl] = [];
    }
    repos[changelog.repoUrl].push(changelog);
    return repos;
  }, {} as Record<string, Changelog[]>);

  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-4rem)]">
      <div className="col-span-3 border-r">
        <ScrollArea className="h-full pr-4">
          <h2 className="font-semibold mb-4">Repositories</h2>
          {Object.keys(repositories).map(repo => (
            <button
              key={repo}
              onClick={() => setSelectedRepo(repo)}
              className={`w-full text-left p-3 rounded-lg mb-2 flex items-center ${
                selectedRepo === repo ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              {repo.replace('https://github.com/', '')}
            </button>
          ))}
        </ScrollArea>
      </div>

      <div className="col-span-9">
        <ScrollArea className="h-full">
          {selectedRepo ? (
            <div className="space-y-6 pr-4">
              {repositories[selectedRepo]
                .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                .map(changelog => (
                  <div key={changelog.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4" />
                        <span>
                          {new Date(changelog.periodStart).toLocaleDateString()}
                          {' to '}
                          {new Date(changelog.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Generated: {new Date(changelog.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{changelog.content}</ReactMarkdown>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a repository to view its changelogs
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}