import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface CarouselContextProps {
  current_index: number
  total_slides: number
  next_slide: () => void
  prev_slide: () => void
  set_slide: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

export function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error('useCarousel must be used within a Carousel')
  }
  return context
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  item_count: number
}

// carousel container provider
export function Carousel({
  item_count,
  className,
  children,
  ...props
}: CarouselProps) {
  const [current_index, set_current_index] = React.useState(0)

  // advance to next slide with boundary wrap
  const next_slide = React.useCallback(() => {
    set_current_index((prev) => (prev + 1) % item_count)
  }, [item_count])

  // regress to previous slide with boundary wrap
  const prev_slide = React.useCallback(() => {
    set_current_index((prev) => (prev - 1 + item_count) % item_count)
  }, [item_count])

  // jump directly to specific slide index
  const set_slide = React.useCallback((index: number) => {
    set_current_index(index)
  }, [])

  return (
    <CarouselContext.Provider
      value={{
        current_index,
        total_slides: item_count,
        next_slide,
        prev_slide,
        set_slide,
      }}
    >
      <div className={cn('relative w-full', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

// carousel content viewport
export function CarouselContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { current_index } = useCarousel()

  return (
    <div className="overflow-hidden rounded-xl">
      <div
        className={cn(
          'flex transition-transform duration-300 ease-out',
          className
        )}
        style={{ transform: `translateX(-${current_index * 100}%)` }}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

// single slide item
export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('min-w-full flex-shrink-0 px-1', className)}
      {...props}
    />
  )
}

// previous control button
export function CarouselPrevious({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { prev_slide } = useCarousel()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'h-8 w-8 rounded-full border-border bg-[#141414]/80 backdrop-blur hover:bg-[#202020]',
        className
      )}
      onClick={prev_slide}
      aria-label="Previous slide"
      {...props}
    >
      <ChevronLeft className="h-4 w-4 text-foreground" />
    </Button>
  )
}

// next control button
export function CarouselNext({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { next_slide } = useCarousel()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'h-8 w-8 rounded-full border-border bg-[#141414]/80 backdrop-blur hover:bg-[#202020]',
        className
      )}
      onClick={next_slide}
      aria-label="Next slide"
      {...props}
    >
      <ChevronRight className="h-4 w-4 text-foreground" />
    </Button>
  )
}
