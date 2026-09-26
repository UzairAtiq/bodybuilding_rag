import React from 'react'
import { Dumbbell, Loader2, Sparkles } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'
import type { QueryStatus } from '@/types/chat'

interface ChatStatusIndicatorProps {
  status: QueryStatus
}

// status sequence component displaying staged progress before typewriter text
export const ChatStatusIndicator: React.FC<ChatStatusIndicatorProps> = ({
  status,
}) => {
  if (status === 'idle' || status === 'complete' || status === 'streaming') {
    return null
  }

  // derive label based on current status phase
  const status_label =
    status === 'sending'
      ? 'Sending prompt...'
      : status === 'generating'
      ? 'Generating output...'
      : 'Processing request...'

  return (
    <div className="w-full flex gap-3 animate-fade-in justify-start">
      <div className="h-8 w-8 rounded-lg bg-[#7a1f2b]/20 border border-[#7a1f2b]/50 flex items-center justify-center shrink-0 mt-1">
        <Dumbbell className="h-4 w-4 text-[#fca5a5] animate-pulse" />
      </div>

      <Card className="max-w-[85%] sm:max-w-[78%] bg-[#111111] border-border/80 shadow-md">
        <CardContent className="p-4 space-y-3">
          {/* status notification badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="bg-[#7a1f2b]/20 text-[#fca5a5] border-[#7a1f2b]/40 py-1 px-3 flex items-center gap-2 font-mono text-xs"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#fca5a5]" />
              <span className="font-semibold">{status_label}</span>
            </Badge>

            <span className="text-[11px] text-muted-foreground font-mono">
              {status === 'sending' ? 'Connecting to pipeline' : 'Retrieving Weider corpus'}
            </span>
          </div>

          {/* skeleton placeholders representing incoming answer */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
