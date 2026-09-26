import React from 'react'
import { Flame, ArrowUpRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './ui/carousel'
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import type { PromptSuggestion } from '@/types/chat'

interface CarouselBannerProps {
  on_select_prompt: (query: string) => void
}

// starter prompts inspired by the vintage Joe Weider course book
const STARTER_PROMPTS: PromptSuggestion[] = [
  {
    id: 'p1',
    category: 'BREAKING IN',
    title: 'Beginner Break-In Routine',
    subtitle: 'Safe progression to avoid muscle soreness and joint injury during week 1.',
    query: 'How should a beginner break into a weight training program to avoid soreness or injury?',
  },
  {
    id: 'p2',
    category: 'CHEST & TRICEPS',
    title: 'Bench Press Primer',
    subtitle: 'Muscles targeted and precise starting mechanics according to Weider.',
    query: 'What muscles do bench presses primarily work?',
  },
  {
    id: 'p3',
    category: 'VOLUME PROTOCOL',
    title: 'Sets & Reps Guideline',
    subtitle: 'Recommended volume and sets for the first month of weight training.',
    query: 'What is the recommended number of sets to perform during the first week and first month of training?',
  },
  {
    id: 'p4',
    category: 'SPLIT ROUTINES',
    title: 'Upper Body Supersets',
    subtitle: 'Exercise pairings prescribed in Chart 4 Monday upper body workout.',
    query: 'What exercises are grouped as supersets in the Monday upper body workout?',
  },
]

// carousel banner presenting vintage bodybuilding topics
export const CarouselBanner: React.FC<CarouselBannerProps> = ({
  on_select_prompt,
}) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#7a1f2b]" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Course Topics // Click to Consult
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground hidden sm:block">
          Swipe or browse suggestions
        </div>
      </div>

      <Carousel item_count={STARTER_PROMPTS.length}>
        <div className="relative">
          <CarouselContent>
            {STARTER_PROMPTS.map((prompt) => (
              <CarouselItem key={prompt.id} className="md:min-w-[50%] lg:min-w-[33.33%]">
                <Card
                  onClick={() => on_select_prompt(prompt.query)}
                  className="cursor-pointer bg-[#121212] border-border/80 hover:border-[#7a1f2b] hover:bg-[#161314] transition-all duration-200 h-full flex flex-col justify-between group"
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] tracking-wider font-mono uppercase bg-[#1c1c1c] text-[#d4d4d4]"
                      >
                        {prompt.category}
                      </Badge>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#fca5a5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground font-display group-hover:text-[#fca5a5] transition-colors line-clamp-1">
                      {prompt.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {prompt.subtitle}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* navigation buttons */}
          <div className="absolute -top-10 right-0 flex items-center gap-1.5">
            <CarouselPrevious className="h-7 w-7" />
            <CarouselNext className="h-7 w-7" />
          </div>
        </div>
      </Carousel>
    </div>
  )
}
