import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// badge variants with dark and burgundy emphasis
const badge_variants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/20 text-white border-[#7a1f2b]',
        secondary:
          'border-border bg-secondary text-secondary-foreground',
        outline:
          'border-border text-foreground',
        accent:
          'border-[#7a1f2b]/40 bg-[#7a1f2b]/15 text-[#f58291]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badge_variants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badge_variants({ variant }), className)} {...props} />
  )
}

export { Badge, badge_variants }
