import { Hono } from 'hono'

type Message = {
  id: number
  content: string
  createdAt: string
}

const messages: Message[] = [
  {
    id: 1,
    content: 'こんにちは',
    createdAt: new Date().toISOString(),
  },
]

const app = new Hono()

app.get('/api/messages', (c) => {
  return c.json({ messages })
})

export default app
