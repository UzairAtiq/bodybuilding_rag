import React, { useState, useRef, useEffect } from 'react'
import { Send, CornerDownLeft, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import type { QueryStatus } from '@/types/chat'

interface ChatInputProps {
  on_send: (query: string) => void
  status: QueryStatus
}

// chat input bar docked at the bottom of the screen
export const ChatInput: React.FC<ChatInputProps> = ({ on_send, status }) => {
  const [query_text, set_query_text] = useState('')
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
    <Card className="w-full bg-[#0d0d0d]/90 backdrop-blur-md border-border/90 p-2 sm:p-3 shadow-xl">
      <form onSubmit={handle_submit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={input_ref}
            value={query_text}
            onChange={(e) => set_query_text(e.target.value)}
            placeholder="Ask about exercises, sets, reps, or Weider principles..."
            disabled={is_busy}
            className="pr-10 bg-[#141414] border-border text-foreground placeholder:text-muted-foreground/60 h-12 text-sm"
          />
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
        <span className="text-[#a8a8a8]">
          Grounded on Joe Weider's Bodybuilding System
        </span>
      </div>
    </Card>
  )
}
