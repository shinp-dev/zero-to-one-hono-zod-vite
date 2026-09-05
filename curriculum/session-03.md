# 第3回: Zod で入力を検証する

## 今日のゴール

- POSTで投稿データを受け取る
- Zodで不正な入力を400にする
- TypeScriptの型チェックと実行時バリデーションの違いを理解する

前回は「データを返すAPI」を作りました。今回は「データを受け取るAPI」を追加します。

---

## 前回まで

```text
GET /api/messages
  ↓
Hono
  ↓
仮のmessages配列
  ↓
JSON
```

今回は次を追加します。

```text
POST /api/messages
  ↓
Zod validation
  ↓ OK
messagesへ追加

  ↓ NG
400 Bad Request
```

---

## Step 1: 必要なパッケージを追加する

```bash
npm install zod @hono/zod-validator
```

---

## Step 2: 入力ルールを定義する

投稿時に受け取るのは `content` だけにします。

```ts
import { z } from 'zod'

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(140),
})
```

この1行には次のルールがあります。

- 文字列である
- 前後の空白を除く
- 空文字は不可
- 140文字を超えない

---

## Step 3: TypeScriptの型も取り出す

```ts
type CreateMessage = z.infer<typeof createMessageSchema>
```

ZodスキーマからTypeScriptの型を作れます。

```text
Zod schema
  ├─ 実行時: 入力チェック
  └─ 開発時: TypeScriptの型
```

ただし、ここで重要なのは **TypeScriptだけでは外部から届くJSONを信用できない** ことです。

ブラウザ、curl、別アプリなどから、型チェックを通っていない値はいくらでも送れます。

---

## Step 4: POSTルートを追加する

```ts
import { zValidator } from '@hono/zod-validator'

app.post(
  '/api/messages',
  zValidator('json', createMessageSchema),
  (c) => {
    const input = c.req.valid('json')

    const message = {
      id: messages.length + 1,
      content: input.content,
      createdAt: new Date().toISOString(),
    }

    messages.unshift(message)

    return c.json({ message }, 201)
  },
)
```

`c.req.valid('json')` まで到達した時点で、Zodのチェックを通過しています。

---

## Step 5: 正しいデータを送る

ブラウザのConsoleから試せます。

```js
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: '2件目の投稿' }),
})
```

Networkタブで確認します。

- Method: POST
- Status: 201
- Request Payload
- Response

その後 `/api/messages` を再取得し、投稿が増えていることを確認します。

---

## Step 6: わざと不正データを送る

### 空文字

```js
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: '' }),
})
```

### 型が違う

```js
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 123 }),
})
```

### 長すぎる

```js
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'a'.repeat(141) }),
})
```

いずれも `400` になることを確認します。

---

## Step 7: 「型」と「バリデーション」を分ける

ここはこの回で一番大事です。

### TypeScript

```text
自分たちが書くコードの矛盾を、主に開発時に見つける
```

### Zod

```text
実際に届いたデータを、実行時に検証する
```

APIでは外から来る値を信用しないため、**サーバー側の実行時チェックが必要**です。

---

## Step 8: 失敗してもデータが増えていないか確認する

不正なPOSTのあとに再び一覧を取得します。

```text
不正入力
  ↓
Zodで拒否
  ↓
handler本体へ進まない
  ↓
messagesは増えない
```

「400が返った」だけでなく、**副作用が起きていないこと**まで確認してください。

---

## 完成チェック

- [ ] 正しいPOSTで201になる
- [ ] 空文字を400にできる
- [ ] 141文字を400にできる
- [ ] 数値の `content` を400にできる
- [ ] 不正入力後に投稿数が増えていない
- [ ] TypeScriptとZodの役割の違いを説明できる

## 今日の一言説明

> TypeScriptで型を付けているのに、なぜZodも必要？

「ネットワークから届く実データはTypeScriptの型チェックを通ってくるわけではない」が説明できればOKです。

---

次: [第4回 React から API を使う](session-04.md)

公式資料:
- https://zod.dev/
- https://hono.dev/docs/guides/validation
