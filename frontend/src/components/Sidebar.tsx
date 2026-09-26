import React from 'react'
import { Plus, Trash2, Dumbbell, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import type { ChatSession } from '@/types/chat'

interface SidebarProps {
  sessions: ChatSession[]
  active_session_id: string
  is_open: boolean
  on_select_session: (id: string) => void
  on_new_chat: () => void
  on_delete_session: (id: string) => void
  on_close_sidebar: () => void
}

// collapsible sidebar containing chat history and system links
export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  active_session_id,
  is_open,
  on_select_session,
  on_new_chat,
  on_delete_session,
  on_close_sidebar,
}) => {
  return (
    <>
      {/* mobile backdrop overlay */}
      {is_open && (
        <div
          onClick={on_close_sidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* sidebar panel */}
      <aside
        className={cn(
          'fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col h-full bg-[#0d0d0d] transition-all duration-300 ease-in-out overflow-hidden',
          is_open
            ? 'w-72 sm:w-80 border-r border-border opacity-100 translate-x-0'
            : 'w-0 border-r-0 opacity-0 pointer-events-none -translate-x-full lg:translate-x-0'
        )}
      >
        <div className="w-72 sm:w-80 flex flex-col h-full shrink-0">
          {/* sidebar top action */}
          <div className="p-4 border-b border-border/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[#7a1f2b]" />
                <span className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
                  Conversation History
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-border text-muted-foreground">
                {sessions.length} chats
              </Badge>
            </div>

            <Button
              onClick={on_new_chat}
              variant="default"
              className="w-full justify-center gap-2 text-sm font-bold tracking-tight bg-primary hover:bg-primary-hover shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>NEW CONSULTATION</span>
            </Button>
          </div>

          {/* chat history list */}
          <div className="flex-1 overflow-hidden p-3 flex flex-col">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-2 font-display">
              Past Sessions
            </div>

            <ScrollArea className="flex-1 pr-1">
              <div className="flex flex-col gap-2">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg mt-2">
                    No previous sessions yet. Ask your first bodybuilding question!
                  </div>
                ) : (
                  sessions.map((session) => {
                    const is_active = session.id === active_session_id
                    return (
                      <Card
                        key={session.id}
                        onClick={() => on_select_session(session.id)}
                        className={cn(
                          'cursor-pointer transition-all duration-150 relative group bg-[#121212] hover:bg-[#181818]',
                          is_active
                            ? 'border-[#7a1f2b] bg-[#171415]'
                            : 'border-border/60 hover:border-border'
                        )}
                      >
                        <CardHeader className="p-3.5 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xs font-semibold text-foreground truncate max-w-[190px]">
                              {session.title}
                            </CardTitle>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                on_delete_session(session.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 p-0.5"
                              title="Delete chat"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <CardDescription className="line-clamp-1 text-[11px] text-[#737373] mt-0.5">
                            {session.preview || 'No messages yet'}
                          </CardDescription>
                        </CardHeader>
                        <div className="px-3.5 pb-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>{session.timestamp}</span>
                          {is_active && (
                            <span className="flex items-center text-[#fca5a5] text-[10px] font-sans font-bold">
                              Active <ChevronRight className="h-3 w-3 ml-0.5" />
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </aside>
    </>
  )
}
