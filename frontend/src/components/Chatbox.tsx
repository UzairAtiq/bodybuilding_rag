import React, { useRef, useEffect } from 'react'
import { Dumbbell } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { ChatStatusIndicator } from './ChatStatusIndicator'
import { ChatInput } from './ChatInput'
import type { ChatMessageItem, QueryStatus } from '@/types/chat'

interface ChatboxProps {
  messages: ChatMessageItem[]
  status: QueryStatus
  on_send_message: (query: string) => void
}

// central chat container supporting centered greeting state and docked conversation flow
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
    <main className="animate-reveal-chatbox flex-1 flex flex-col h-full overflow-hidden bg-background relative px-3 py-3 sm:px-6 sm:py-4 max-w-4xl mx-auto w-full">
      {!has_messages ? (
        // centered initial greeting and prompt send box
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full px-4 -mt-12 transition-all duration-300">
          <div className="h-16 w-16 rounded-2xl bg-[#7a1f2b]/20 border border-[#7a1f2b]/50 flex items-center justify-center mb-6">
            <Dumbbell className="h-8 w-8 text-[#fca5a5]" />
          </div>

          <h2 className="font-display font-[900] text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground mb-8">
            Welcome Bodybuilder !
          </h2>

          <div className="w-full">
            <ChatInput on_send={on_send_message} status={status} />
          </div>
        </div>
      ) : (
        // populated state with scrollable message history and docked bottom input
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full pr-2">
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
            </ScrollArea>
          </div>

          {/* docked bottom input bar */}
          <div className="pt-2 z-10 w-full">
            <ChatInput on_send={on_send_message} status={status} />
          </div>
        </div>
      )}
    </main>
  )
}
