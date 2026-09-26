import React, { useState, useRef, useEffect } from 'react'
import { Send, CornerDownLeft, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'
import type { QueryStatus } from '@/types/chat'

interface ChatInputProps {
  on_send: (query: string) => void
  status: QueryStatus
}

// chat input bar docked at the bottom of the screen
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
        'w-full bg-[#0d0d0d]/90 backdrop-blur-md border p-2 sm:p-3 shadow-xl transition-all duration-200',
        is_focused
          ? 'border-[#7a1f2b]/80 shadow-[0_0_25px_rgba(122,31,43,0.25)]'
          : 'border-border/90'
      )}
    >
      <form onSubmit={handle_submit} className="flex items-center gap-2">
        <div
          className={cn(
            'relative flex-1 rounded-lg transition-all duration-200',
            is_focused && 'ring-2 ring-[#7a1f2b] shadow-[0_0_18px_rgba(122,31,43,0.35)]'
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
                : 'Ask about exercises, sets, reps, or Weider principles...'
            }
            disabled={is_busy}
            className={cn(
              'pr-20 h-12 text-sm transition-all duration-200',
              is_focused
                ? 'border-[#7a1f2b] bg-[#181818]'
                : 'border-border bg-[#141414]'
            )}
          />

          {/* animated active cursor pulse badge when input is focused */}
          {is_focused && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fca5a5] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7a1f2b]" />
              </span>
              <span className="text-[10px] font-mono font-bold text-[#fca5a5] tracking-widest uppercase">
                ACTIVE
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!query_text.trim() || is_busy}
          className="h-12 px-5 font-display font-bold tracking-tight bg-primary hover:bg-primary-hover shadow-md flex items-center gap-2 shrink-0"
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
        <span className={cn('transition-colors', is_focused ? 'text-[#fca5a5]' : 'text-[#a8a8a8]')}>
          {is_focused ? '● Consultation Input Active' : "Grounded on Joe Weider's Bodybuilding System"}
        </span>
      </div>
    </Card>
  )
}
