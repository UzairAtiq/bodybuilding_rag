import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// text input component styled with dark gray background, burgundy focus ring, and prominent caret
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-border bg-[#141414] px-4 py-2 text-sm text-foreground shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:border-[#7a1f2b] focus:ring-2 focus:ring-[#7a1f2b]/50 focus:bg-[#181818] focus:shadow-[0_0_18px_rgba(122,31,43,0.35)] caret-[#fca5a5] disabled:cursor-not-allowed disabled:opacity-50 font-body',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
