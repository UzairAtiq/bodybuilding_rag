import React from 'react'
import { PanelLeft, KeyRound } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  on_toggle_sidebar: () => void
  is_sidebar_open: boolean
  on_open_access_modal?: () => void
}

// distinctive bold header replacing conventional navbar
export const Header: React.FC<HeaderProps> = ({
  on_toggle_sidebar,
  is_sidebar_open,
  on_open_access_modal,
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
        </div>
      </div>

      {on_open_access_modal && (
        <Button
          variant="outline"
          size="sm"
          onClick={on_open_access_modal}
          className="h-8 gap-1.5 border-border bg-[#141414] hover:bg-[#1f1f1f] text-xs text-neutral-300"
          title="Manage Access Key"
        >
          <KeyRound className="h-3.5 w-3.5 text-[#ff4d6d]" />
          <span className="hidden sm:inline">Access Key</span>
        </Button>
      )}
    </header>
  )
}

