import React, { useRef, useEffect } from 'react'
import { Dumbbell, Sparkles } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card'
import { ChatMessage } from './ChatMessage'
import { ChatStatusIndicator } from './ChatStatusIndicator'
import { ChatInput } from './ChatInput'
import { CarouselBanner } from './CarouselBanner'
import type { ChatMessageItem, QueryStatus } from '@/types/chat'

interface ChatboxProps {
  messages: ChatMessageItem[]
  status: QueryStatus
  on_send_message: (query: string) => void
}

// central chatbox area combining stream, carousel, and docked input
export const Chatbox: React.FC<ChatboxProps> = ({
  messages,
  status,
  on_send_message,
}) => {
  const scroll_bottom_ref = useRef<HTMLDivElement>(null)

  // auto scroll to bottom on new messages or status changes
  useEffect(() => {
    scroll_bottom_ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const has_messages = messages.length > 0

  return (
    <main className="animate-reveal-chatbox flex-1 flex flex-col h-full overflow-hidden bg-background relative px-3 py-3 sm:px-6 sm:py-4 max-w-5xl mx-auto w-full">
      {/* message viewport area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full pr-2">
          {!has_messages ? (
            /* empty state with bold presentation and topic carousel */
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 text-center max-w-2xl mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-[#7a1f2b]/20 border border-[#7a1f2b]/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(122,31,43,0.3)]">
                <Dumbbell className="h-8 w-8 text-[#fca5a5]" />
              </div>

              <h2 className="font-display font-[900] text-3xl sm:text-4xl uppercase tracking-tight text-foreground mb-3">
                BUILD YOUR PHYSIQUE WITH SCIENCE & VINTAGE WISDOM
              </h2>

              <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Directly grounded in Joe Weider's 1988 System of Bodybuilding.
                Ask about exercise execution, beginner break-in protocols, split routines, or supersets.
              </p>

              {/* topic suggestion carousel */}
              <CarouselBanner on_select_prompt={on_send_message} />
            </div>
          ) : (
            /* populated message stream */
            <div className="flex flex-col gap-4 py-4">
              {messages.map((message, index) => {
                const is_latest_assistant =
                  message.role === 'assistant' && index === messages.length - 1
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    is_latest_assistant={is_latest_assistant}
                  />
                )
              })}

              {/* active progress indicators during submission */}
              <ChatStatusIndicator status={status} />

              <div ref={scroll_bottom_ref} className="h-2" />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* docked input bar */}
      <div className="pt-2 z-10 w-full">
        <ChatInput on_send={on_send_message} status={status} />
      </div>
    </main>
  )
}
