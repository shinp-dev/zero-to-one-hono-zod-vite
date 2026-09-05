import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Message = {
  id: number
  content: string
  createdAt: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const loadMessages = async () => {
    const res = await fetch('/api/messages')
    if (!res.ok) {
      throw new Error(`一覧取得に失敗しました: ${res.status}`)
    }

    const data = (await res.json()) as { messages: Message[] }
    setMessages(data.messages)
  }

  useEffect(() => {
    void loadMessages().catch((e) => {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました')
    })
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    })

    if (!res.ok) {
      setError(`投稿に失敗しました: ${res.status}`)
      return
    }

    setInput('')
    await loadMessages()
  }

  return (
    <main>
      <h1>一言掲示板</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={140}
          aria-label="投稿内容"
        />
        <button type="submit">投稿</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.content}</p>
            <small>{message.createdAt}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}
