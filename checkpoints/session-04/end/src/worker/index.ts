import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

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

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(140),
})

const app = new Hono()

app.get('/api/messages', (c) => {
  return c.json({ messages })
})

app.post(
  '/api/messages',
  zValidator('json', createMessageSchema),
  (c) => {
    const input = c.req.valid('json')
    const message: Message = {
      id: messages.length + 1,
      content: input.content,
      createdAt: new Date().toISOString(),
    }

    messages.unshift(message)
    return c.json({ message }, 201)
  },
)

export default app
