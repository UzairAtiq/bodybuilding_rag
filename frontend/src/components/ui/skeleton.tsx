import * as React from 'react'
import { cn } from '@/lib/utils'

// skeleton loading placeholder with subtle pulse
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#1c1c1c] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
