// default backend api host url
const backend_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

interface AskResponse {
  answer: string
}

// send user query to the rag backend
export async function send_ask_query(query: string): Promise<string> {
  const direct_endpoint = `${backend_url}/ask`

  let response: Response
  try {
    response = await fetch(direct_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
  } catch (network_err) {
    // fallback to vite dev proxy in case direct localhost connection fails
    try {
      response = await fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
    } catch {
      throw network_err
    }
  }

  if (!response.ok) {
    const error_text = await response.text().catch(() => 'unknown server error')
    throw new Error(`API error ${response.status}: ${error_text}`)
  }

  const data: AskResponse = await response.json()
  return data.answer
}
