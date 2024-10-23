'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, CalendarRange } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'github-markdown-css';
import 'highlight.js/styles/github-dark.css';

interface Changelog {
  id: string;
  repoUrl: string;
  content: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
}

// Custom components for ReactMarkdown
const MarkdownComponents = {
  h1: (props: any) => (
    <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-xl font-semibold mb-3 mt-5 text-primary" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-lg font-medium mb-2 mt-4 text-primary/80" {...props} />
  ),
  p: (props: any) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: any) => (
    <ul className="mb-4 ml-4 space-y-2" {...props} />
  ),
  li: (props: any) => (
    <li className="relative pl-6 before:content-['•'] before:absolute before:left-1 before:text-primary" {...props} />
  ),
  a: (props: any) => (
    <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={`${className} block p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto`} {...props}>
        {children}
      </code>
    );
  },
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-primary/20 pl-4 italic my-4" {...props} />
  ),
  hr: (props: any) => (
    <hr className="my-6 border-muted" {...props} />
  ),
};

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
                  <div key={changelog.id} className="border rounded-lg p-6 bg-card">
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
                    <div className="prose prose-sm dark:prose-invert max-w-none markdown-body">
                      <ReactMarkdown
                        components={MarkdownComponents}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {changelog.content}
                      </ReactMarkdown>
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