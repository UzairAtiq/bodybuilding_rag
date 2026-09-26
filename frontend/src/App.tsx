import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Chatbox } from './components/Chatbox'
import { send_ask_query } from './services/api'
import type { ChatSession, ChatMessageItem, QueryStatus } from './types/chat'

// initial default chat session
const create_new_session = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: 'New Consultation',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  preview: '',
  messages: [],
})

export const App: React.FC = () => {
  // persistent chat sessions
  const [sessions, set_sessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('fitness_bot_sessions')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback on parse failure
    }
    return [create_new_session()]
  })

  const [active_session_id, set_active_session_id] = useState<string>(
    () => sessions[0]?.id || `session_${Date.now()}`
  )

  const [is_sidebar_open, set_is_sidebar_open] = useState(true)
  const [query_status, set_query_status] = useState<QueryStatus>('idle')

  // sync sessions to localstorage
  useEffect(() => {
    try {
      localStorage.setItem('fitness_bot_sessions', JSON.stringify(sessions))
    } catch {
      // ignore storage quota errors
    }
  }, [sessions])

  // active session lookup
  const active_session =
    sessions.find((s) => s.id === active_session_id) || sessions[0] || create_new_session()

  // create a fresh new consultation
  const handle_new_chat = () => {
    const new_session = create_new_session()
    set_sessions((prev) => [new_session, ...prev])
    set_active_session_id(new_session.id)
    set_query_status('idle')
  }

  // select chat session
  const handle_select_session = (id: string) => {
    set_active_session_id(id)
    set_query_status('idle')
  }

  // delete chat session
  const handle_delete_session = (id: string) => {
    set_sessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      if (filtered.length === 0) {
        const fallback = create_new_session()
        set_active_session_id(fallback.id)
        return [fallback]
      }
      if (active_session_id === id) {
        set_active_session_id(filtered[0].id)
      }
      return filtered
    })
  }

  // execute send sequence with staged placeholder statuses then typewriter reveal
  const handle_send_message = async (query: string) => {
    if (query_status !== 'idle' && query_status !== 'complete' && query_status !== 'error') {
      return
    }

    const timestamp_str = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const user_message: ChatMessageItem = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: query,
      timestamp: timestamp_str,
    }

    // append user message immediately to session
    set_sessions((prev) =>
      prev.map((s) => {
        if (s.id === active_session.id) {
          const is_first_message = s.messages.length === 0
          return {
            ...s,
            title: is_first_message
              ? query.slice(0, 32) + (query.length > 32 ? '...' : '')
              : s.title,
            preview: query,
            messages: [...s.messages, user_message],
          }
        }
        return s
      })
    )

    try {
      // step 1: show 'Sending prompt...' status
      set_query_status('sending')
      await new Promise((resolve) => setTimeout(resolve, 600))

      // step 2: switch to 'Generating output...' status
      set_query_status('generating')

      // invoke backend api
      let response_text = ''
      try {
        response_text = await send_ask_query(query)
      } catch (err: unknown) {
        const error_message = err instanceof Error ? err.message : 'Unknown connection error'
        console.error('Backend request failed:', error_message)
        response_text =
          `⚠️ Unable to reach the Fitness Bot API (${error_message}).\n\n` +
          `Please make sure the FastAPI server is running with:\n` +
          `uvicorn app.api.routes:app --host 0.0.0.0 --port 8000`
      }

      // step 3: response arrival -> append assistant message and trigger fast typewriter reveal
      const assistant_message: ChatMessageItem = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: response_text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      set_sessions((prev) =>
        prev.map((s) => {
          if (s.id === active_session.id) {
            return {
              ...s,
              preview: response_text.slice(0, 60) + '...',
              messages: [...s.messages, assistant_message],
            }
          }
          return s
        })
      )

      set_query_status('complete')
    } catch {
      set_query_status('error')
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-body select-text">
      {/* collapsible left sidebar with staggered reveal */}
      <Sidebar
        sessions={sessions}
        active_session_id={active_session.id}
        is_open={is_sidebar_open}
        on_select_session={handle_select_session}
        on_new_chat={handle_new_chat}
        on_delete_session={handle_delete_session}
        on_close_sidebar={() => set_is_sidebar_open(false)}
      />

      {/* main content container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          on_toggle_sidebar={() => set_is_sidebar_open((prev) => !prev)}
          is_sidebar_open={is_sidebar_open}
        />

        <Chatbox
          messages={active_session.messages}
          status={query_status}
          on_send_message={handle_send_message}
        />
      </div>
    </div>
  )
}

export default App
