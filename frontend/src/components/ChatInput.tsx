import React, { useState, useRef, useEffect } from 'react'
import { Send, CornerDownLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'
import type { QueryStatus } from '@/types/chat'

interface ChatInputProps {
  on_send: (query: string) => void
  status: QueryStatus
}

// chat input bar supporting centered placement or docked bottom view
export const ChatInput: React.FC<ChatInputProps> = ({ on_send, status }) => {
  const [query_text, set_query_text] = useState('')
  const [is_focused, set_is_focused] = useState(false)
  const input_ref = useRef<HTMLInputElement>(null)

  const is_busy = status === 'sending' || status === 'generating' || status === 'streaming'

  // focus input when idle
  useEffect(() => {
    if (!is_busy) {
      input_ref.current?.focus()
    }
  }, [is_busy])

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query_text.trim()
    if (!trimmed || is_busy) return

    on_send(trimmed)
    set_query_text('')
  }

  return (
    <Card
      className={cn(
        'w-full bg-[#0d0d0d]/90 backdrop-blur-md border p-2 sm:p-3 transition-all duration-200',
        is_focused ? 'border-[#7a1f2b]/80' : 'border-border/90'
      )}
    >
      <form onSubmit={handle_submit} className="flex items-center gap-2">
        <div
          className={cn(
            'relative flex-1 rounded-lg transition-all duration-200',
            is_focused && 'ring-1 ring-[#7a1f2b]'
          )}
        >
          <Input
            ref={input_ref}
            value={query_text}
            onChange={(e) => set_query_text(e.target.value)}
            onFocus={() => set_is_focused(true)}
            onBlur={() => set_is_focused(false)}
            placeholder={
              is_focused
                ? 'Type your bodybuilding query...'
                : 'Ask about exercises, sets, reps, nutrition, or training protocols...'
            }
            disabled={is_busy}
            className={cn(
              'pr-4 h-12 text-sm transition-all duration-200',
              is_focused
                ? 'border-[#7a1f2b] bg-[#181818]'
                : 'border-border bg-[#141414]'
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!query_text.trim() || is_busy}
          className="h-12 px-5 font-display font-bold tracking-tight bg-primary hover:bg-primary-hover flex items-center gap-2 shrink-0 border border-[#912534]/40"
        >
          <span className="hidden sm:inline">CONSULT</span>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* bottom shortcut caption */}
      <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="h-3 w-3" /> Press Enter to send
        </span>
      </div>
    </Card>
  )
}
