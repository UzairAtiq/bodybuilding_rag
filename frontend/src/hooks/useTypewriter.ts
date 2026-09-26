import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  chunk_size?: number
  speed_ms?: number
  on_finish?: () => void
}

// fast typewriter hook revealing small character chunks at high frequency
export function use_typewriter(
  full_text: string,
  options: UseTypewriterOptions = {}
) {
  const { chunk_size = 3, speed_ms = 8, on_finish } = options

  const [displayed_text, set_displayed_text] = useState('')
  const [is_typing, set_is_typing] = useState(false)
  const index_ref = useRef(0)
  const on_finish_ref = useRef(on_finish)

  on_finish_ref.current = on_finish

  useEffect(() => {
    // reset state when full_text is empty or new
    if (!full_text) {
      set_displayed_text('')
      set_is_typing(false)
      index_ref.current = 0
      return
    }

    set_displayed_text('')
    set_is_typing(true)
    index_ref.current = 0

    const timer = setInterval(() => {
      index_ref.current += chunk_size
      if (index_ref.current >= full_text.length) {
        set_displayed_text(full_text)
        set_is_typing(false)
        clearInterval(timer)
        if (on_finish_ref.current) {
          on_finish_ref.current()
        }
      } else {
        set_displayed_text(full_text.slice(0, index_ref.current))
      }
    }, speed_ms)

    return () => {
      clearInterval(timer)
    }
  }, [full_text, chunk_size, speed_ms])

  // allow user to skip directly to full text immediately
  const skip_to_end = () => {
    set_displayed_text(full_text)
    set_is_typing(false)
  }

  return {
    displayed_text,
    is_typing,
    skip_to_end,
  }
}
