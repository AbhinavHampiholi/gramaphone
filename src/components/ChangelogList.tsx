'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ChevronDown, CalendarRange, X, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Changelog } from '@/types/changelog';

interface ChangelogListProps {
  initialChangelogs: Changelog[];
}

export function ChangelogList({ initialChangelogs }: ChangelogListProps) {
  const [changelogs, setChangelogs] = useState<Changelog[]>(initialChangelogs);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const refreshChangelogs = async () => {
    setIsRefreshing(true);
    try {
      console.log('Fetching fresh changelogs...');
      const response = await fetch('/api/changelogs');
      if (!response.ok) {
        throw new Error('Failed to fetch changelogs');
      }
      const data = await response.json();
      console.log('Fetched changelogs:', data);
      setChangelogs(data);
    } catch (error) {
      console.error('Error refreshing changelogs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const deleteChangelog = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/changelogs?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete changelog');
      }

      // Remove from local state
      setChangelogs(prev => prev.filter(changelog => changelog.id !== id));
      if (selectedRepo === id) {
        setSelectedRepo(null);
      }
    } catch (error) {
      console.error('Error deleting changelog:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    refreshChangelogs();
  }, []);

  // Group changelogs by repository
  const repositories = changelogs.reduce((acc, changelog) => {
    const repos = { ...acc };
    if (!repos[changelog.repoUrl]) {
      repos[changelog.repoUrl] = [];
    }
    repos[changelog.repoUrl].push(changelog);
    return repos;
  }, {} as Record<string, Changelog[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshChangelogs}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 border-r">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="pr-4 space-y-4">
              {Object.entries(repositories).map(([repoUrl, repoChangelogs]) => (
                <Collapsible key={repoUrl} defaultOpen>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span className="font-medium">
                          {repoUrl.replace('https://github.com/', '')}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-6 mt-2 space-y-2">
                      {repoChangelogs
                        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                        .map((changelog) => (
                          <div key={changelog.id} className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRepo(changelog.id)}
                              className={`flex-1 text-left p-2 rounded-lg flex items-center gap-2 hover:bg-accent ${
                                selectedRepo === changelog.id ? 'bg-accent' : ''
                              }`}
                            >
                              <CalendarRange className="h-4 w-4" />
                              <span className="text-sm">
                                {new Date(changelog.periodStart).toLocaleDateString()} to{' '}
                                {new Date(changelog.periodEnd).toLocaleDateString()}
                              </span>
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  disabled={isDeleting === changelog.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Changelog</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this changelog? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteChangelog(changelog.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Rest of the component remains the same */}
        <div className="col-span-9">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {selectedRepo ? (
              <div className="px-4">
                {changelogs.find(c => c.id === selectedRepo) ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-lg font-medium">
                          {changelogs.find(c => c.id === selectedRepo)?.repoUrl.replace('https://github.com/', '')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Generated: {new Date(changelogs.find(c => c.id === selectedRepo)?.generatedAt || '').toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRepo(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {changelogs.find(c => c.id === selectedRepo)?.content || ''}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Selected changelog not found
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a changelog to view its contents
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}