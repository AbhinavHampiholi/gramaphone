"use client"

import { useState } from "react"
import { GitBranch, ChevronDown, ChevronRight, CalendarRange, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "@/components/ui/alert-dialog"
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'

interface Changelog {
  id: string
  repoUrl: string
  content: string
  generatedAt: string
  periodStart: string
  periodEnd: string
}

interface ChangelogListProps {
  changelogs: Changelog[]
}

export function ChangelogList({ changelogs: initialChangelogs }: ChangelogListProps) {
  const [changelogs, setChangelogs] = useState(initialChangelogs)
  const [selectedChangelog, setSelectedChangelog] = useState<Changelog | null>(null)
  const router = useRouter()

  const deleteChangelog = async (id: string) => {
    try {
      const response = await fetch(`/api/changelogs?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete changelog')
      }

      // Remove the changelog from state
      setChangelogs(prev => prev.filter(changelog => changelog.id !== id))
      
      // If the deleted changelog was selected, clear the selection
      if (selectedChangelog?.id === id) {
        setSelectedChangelog(null)
      }

      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error('Error deleting changelog:', error)
      // You might want to show an error message to the user here
    }
  }

  // Group changelogs by repository
  const repositories = changelogs.reduce((acc, changelog) => {
    const repos = { ...acc }
    if (!repos[changelog.repoUrl]) {
      repos[changelog.repoUrl] = []
    }
    repos[changelog.repoUrl].push(changelog)
    return repos
  }, {} as Record<string, Changelog[]>)

  const DeleteButton = ({ id }: { id: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Changelog</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this changelog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => deleteChangelog(id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Repository List */}
      <div className="col-span-12 lg:col-span-3 border-r">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-4">
            {Object.entries(repositories).map(([repoUrl, repoChangelogs]) => (
              <Collapsible key={repoUrl}>
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
                        <div
                          key={changelog.id}
                          className="flex items-center justify-between group"
                        >
                          <button
                            onClick={() => setSelectedChangelog(changelog)}
                            className={`flex-1 text-left p-2 rounded-lg flex items-center gap-2 hover:bg-accent ${
                              selectedChangelog?.id === changelog.id ? 'bg-accent' : ''
                            }`}
                          >
                            <CalendarRange className="h-4 w-4" />
                            <span className="text-sm">
                              {new Date(changelog.periodStart).toLocaleDateString()} to{' '}
                              {new Date(changelog.periodEnd).toLocaleDateString()}
                            </span>
                          </button>
                          <DeleteButton id={changelog.id} />
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Changelog Content */}
      <div className="col-span-12 lg:col-span-9">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {selectedChangelog ? (
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium">
                    {selectedChangelog.repoUrl.replace('https://github.com/', '')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generated: {new Date(selectedChangelog.generatedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedChangelog(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{selectedChangelog.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a changelog to view its contents
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}