import React, { useState } from 'react'
import { Lock, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'
import { verify_access_key, set_saved_access_key } from '../services/api'

interface AccessModalProps {
  is_open: boolean
  on_success: () => void
  on_close?: () => void
  initial_error?: string
}

export const AccessModal: React.FC<AccessModalProps> = ({
  is_open,
  on_success,
  on_close,
  initial_error,
}) => {
  const [key_input, set_key_input] = useState('')
  const [is_submitting, set_is_submitting] = useState(false)
  const [error_text, set_error_text] = useState(initial_error || '')
  const [show_password, set_show_password] = useState(false)

  if (!is_open) return null

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = key_input.trim()
    if (!trimmed) {
      set_error_text('Please enter your access key.')
      return
    }

    set_is_submitting(true)
    set_error_text('')

    try {
      const result = await verify_access_key(trimmed)
      if (result.ok) {
        set_saved_access_key(trimmed)
        on_success()
      } else {
        set_error_text(result.error || 'Invalid access key. Please check your password and try again.')
      }
    } catch {
      set_error_text('Could not connect to the backend server to verify the key.')
    } finally {
      set_is_submitting(false)
    }

  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121212] border border-[#2a2a2a] rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 text-foreground">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#7a1f2b]/20 border border-[#7a1f2b]/40 flex items-center justify-center text-[#ff4d6d]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display font-[800] text-xl tracking-tight uppercase">
              Access Code Required
            </h2>
            <p className="text-xs text-muted-foreground">
              Joe Weider RAG Consultation System
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed">
          Please enter the shared access key to unlock the chatbot and run training consultations.
        </p>

        {/* error message */}
        {error_text && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error_text}</span>
          </div>
        )}

        {/* input form */}
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type={show_password ? 'text' : 'password'}
              value={key_input}
              onChange={(e) => set_key_input(e.target.value)}
              placeholder="Enter shared access key..."
              disabled={is_submitting}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#7a1f2b] focus:ring-1 focus:ring-[#7a1f2b] transition-all"
            />
            <button
              type="button"
              onClick={() => set_show_password((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
              title={show_password ? 'Hide password' : 'Show password'}
            >
              {show_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            {on_close && (
              <Button
                type="button"
                variant="outline"
                onClick={on_close}
                disabled={is_submitting}
                className="border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={is_submitting}
              className="bg-[#7a1f2b] hover:bg-[#8f2533] text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-[#7a1f2b]/20"
            >
              {is_submitting ? (
                <>Verifying...</>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Unlock Consultation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
