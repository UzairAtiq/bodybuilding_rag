import React, { useState } from 'react'
import { User, Dumbbell, Copy, Check } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { use_typewriter } from '@/hooks/useTypewriter'
import type { ChatMessageItem } from '@/types/chat'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageItem
  is_latest_assistant: boolean
}

// individual message component rendering formatted markdown or typewriter text
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  is_latest_assistant,
}) => {
  const is_user = message.role === 'user'
  const [copied, set_copied] = useState(false)

  // apply fast typewriter animation (2-3 chars every ~8ms) only to the latest assistant message
  const { displayed_text, is_typing, skip_to_end } = use_typewriter(
    is_latest_assistant ? message.content : '',
    { chunk_size: 3, speed_ms: 8 }
  )

  const content_to_render = is_latest_assistant
    ? is_typing
      ? displayed_text
      : message.content
    : message.content

  // copy message content to clipboard
  const handle_copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      set_copied(true)
      setTimeout(() => set_copied(false), 1800)
    } catch {
      // fallback if clipboard api fails
    }
  }

  return (
    <div
      className={cn(
        'w-full flex gap-3 animate-fade-in',
        is_user ? 'justify-end' : 'justify-start'
      )}
    >
      {/* assistant avatar on the left */}
      {!is_user && (
        <div className="h-8 w-8 rounded-lg bg-[#7a1f2b]/20 border border-[#7a1f2b]/50 flex items-center justify-center shrink-0 mt-1">
          <Dumbbell className="h-4 w-4 text-[#fca5a5]" />
        </div>
      )}

      {/* message card container */}
      <Card
        className={cn(
          'max-w-[85%] sm:max-w-[78%] transition-all duration-150',
          is_user
            ? 'bg-[#1a1a1a] border-border text-foreground shadow-sm'
            : 'bg-[#111111] border-border/80 text-foreground shadow-md'
        )}
      >
        <CardContent className="p-4">
          {/* header row of message card */}
          <div className="flex items-center justify-between gap-4 mb-2 border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={is_user ? 'secondary' : 'default'}
                className={cn(
                  'text-[10px] uppercase font-mono tracking-wider px-2 py-0.5',
                  is_user
                    ? 'bg-[#222222] text-[#d4d4d4] border-transparent'
                    : 'bg-[#7a1f2b]/20 text-[#fca5a5] border-[#7a1f2b]/40'
                )}
              >
                {is_user ? 'ATHLETE QUERY' : 'FITNESS AI'}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                {message.timestamp}
              </span>
            </div>

            {!is_user && (
              <div className="flex items-center gap-1">
                {is_typing && (
                  <button
                    onClick={skip_to_end}
                    className="text-[10px] font-mono text-[#fca5a5] hover:underline px-1 py-0.5"
                  >
                    [Skip reveal]
                  </button>
                )}
                <button
                  onClick={handle_copy}
                  className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* message body text */}
          <div className="font-body text-sm leading-relaxed text-[#f0f0f0] whitespace-pre-wrap break-words">
            {content_to_render}
            {is_typing && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#7a1f2b] animate-pulse align-middle" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* user avatar on the right */}
      {is_user && (
        <div className="h-8 w-8 rounded-lg bg-[#1f1f1f] border border-border flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-[#a3a3a3]" />
        </div>
      )}
    </div>
  )
}
