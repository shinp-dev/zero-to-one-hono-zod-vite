import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

type MessageRow = {
  id: number
  content: string
  created_at: string
}

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(140),
})

const app = new Hono<{ Bindings: Env }>()

const route = app
  .get('/api/messages', async (c) => {
    const result = await c.env.DB
      .prepare('SELECT id, content, created_at FROM messages ORDER BY id DESC')
      .all<MessageRow>()

    const messages = result.results.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
    }))

    return c.json({ messages })
  })
  .post(
    '/api/messages',
    zValidator('json', createMessageSchema),
    async (c) => {
      const input = c.req.valid('json')

      await c.env.DB
        .prepare('INSERT INTO messages (content) VALUES (?)')
        .bind(input.content)
        .run()

      return c.json({ ok: true }, 201)
    },
  )

export type AppType = typeof route
export default app
