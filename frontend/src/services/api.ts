// default backend api host url
const backend_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export const ACCESS_KEY_STORAGE_KEY = 'fitness_bot_access_key'

export function get_saved_access_key(): string {
  try {
    return localStorage.getItem(ACCESS_KEY_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function set_saved_access_key(key: string): void {
  try {
    let clean = key.trim()
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1).trim()
    }
    localStorage.setItem(ACCESS_KEY_STORAGE_KEY, clean)
  } catch {
    // ignore local storage errors
  }
}

export function clear_saved_access_key(): void {
  try {
    localStorage.removeItem(ACCESS_KEY_STORAGE_KEY)
  } catch {
    // ignore local storage errors
  }
}

export interface VerifyKeyResult {
  ok: boolean
  error?: string
}

// verify access key with backend before saving
export async function verify_access_key(key: string): Promise<VerifyKeyResult> {
  let clean_key = key.trim()
  if (
    (clean_key.startsWith('"') && clean_key.endsWith('"')) ||
    (clean_key.startsWith("'") && clean_key.endsWith("'"))
  ) {
    clean_key = clean_key.slice(1, -1).trim()
  }

  const direct_endpoint = `${backend_url}/verify-key`
  try {
    const response = await fetch(direct_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': clean_key,
      },
    })
    if (response.ok) {
      return { ok: true }
    }
    if (response.status === 401) {
      return { ok: false, error: 'Incorrect password. Please verify the access code and try again.' }
    }
    return { ok: false, error: `Backend responded with HTTP ${response.status}.` }
  } catch (network_err) {
    const msg = network_err instanceof Error ? network_err.message : 'Network failure'
    return { ok: false, error: `Could not connect to backend server (${msg}).` }
  }
}


interface AskResponse {
  answer: string
}

// send user query to the rag backend
export async function send_ask_query(query: string): Promise<string> {
  const direct_endpoint = `${backend_url}/ask`
  const access_key = get_saved_access_key()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (access_key) {
    headers['x-access-key'] = access_key
  }

  let response: Response
  try {
    response = await fetch(direct_endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    })
  } catch (network_err) {
    // fallback to vite dev proxy in case direct connection fails
    try {
      response = await fetch('/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      })
    } catch {
      throw network_err
    }
  }

  if (response.status === 401) {
    clear_saved_access_key()
    throw new Error('UNAUTHORIZED: Invalid access key. Please enter the correct password.')
  }

  if (!response.ok) {
    const error_text = await response.text().catch(() => 'unknown server error')
    throw new Error(`API error ${response.status}: ${error_text}`)
  }

  const data: AskResponse = await response.json()
  return data.answer
}

