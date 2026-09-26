import React from 'react'
import { PanelLeft, Dumbbell, ShieldCheck } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface HeaderProps {
  on_toggle_sidebar: () => void
  is_sidebar_open: boolean
}

// distinctive bold header replacing conventional navbar
export const Header: React.FC<HeaderProps> = ({
  on_toggle_sidebar,
  is_sidebar_open,
}) => {
  return (
    <header className="animate-reveal-header w-full border-b border-border bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* sidebar toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={on_toggle_sidebar}
          className="h-9 w-9 border-border bg-[#141414] hover:bg-[#1f1f1f] text-foreground"
          title={is_sidebar_open ? 'Collapse sidebar' : 'Open sidebar'}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        {/* bold high-impact title replacing traditional navbar */}
        <div className="flex items-baseline gap-2">
          <h1 className="font-display font-[900] tracking-tighter text-2xl sm:text-3xl md:text-4xl uppercase text-foreground leading-none">
            FITNESS BOT
          </h1>
          <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase text-[#9e2736] font-display">
            // VINTAGE RAG
          </span>
        </div>
      </div>

      {/* system metadata badges */}
      <div className="flex items-center gap-2">
        <Badge
          variant="accent"
          className="hidden md:inline-flex items-center gap-1.5 py-1 px-3 bg-[#7a1f2b]/20 border border-[#7a1f2b]/40 text-[#fca5a5]"
        >
          <Dumbbell className="h-3 w-3 text-[#fca5a5]" />
          <span>JOE WEIDER SYSTEM</span>
        </Badge>

        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-[#141414] border border-[#2b2b2b] text-xs text-[#a3a3a3]"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">ONLINE</span>
        </Badge>
      </div>
    </header>
  )
}
