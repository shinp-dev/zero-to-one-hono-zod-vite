# 第4回: React から API を使う

## 今日のゴール

- Reactで投稿一覧を表示する
- フォームからPOSTする
- `useState` と `useEffect` が何をしているか説明する
- APIエラーを画面とDevToolsの両方で確認する

ここまでAPIだけで動いていた掲示板に、利用者が触る画面を付けます。

---

## 前回まで

```text
GET /api/messages   → 一覧取得
POST /api/messages  → 投稿
Zod                 → 不正入力を400
```

今回はこうなります。

```text
React
  ↓ fetch
Hono API
  ↓
JSON
  ↓
Reactが画面更新
```

同じVite/Worker構成の中で動いているため、`/api/messages` のような相対URLで呼び出せます。基本授業では別Originに分けないため、CORS設定は不要です。

---

## Step 1: React側の `App.tsx` を開く

テンプレート内のReactアプリを探します。構成によって多少異なりますが、`src/react-app/.../App.tsx` 付近です。

まず既存のサンプル表示を整理し、掲示板用の画面へ変更します。

---

## Step 2: 投稿の型を用意する

```tsx
type Message = {
  id: number
  content: string
  createdAt: string
}
```

今回はまだフロントとバックで型を別々に書きます。

**「二重管理になっている」ことを覚えておいてください。** 次回Hono RPCで改善します。

---

## Step 3: Stateを用意する

```tsx
import { useEffect, useState } from 'react'

const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [error, setError] = useState('')
```

役割は次の通りです。

```text
messages → 画面に表示する投稿一覧
input    → 入力欄の現在値
error    → 利用者へ見せるエラー
```

Stateを更新するとReactが再レンダーし、必要な部分が新しい値で描画されます。

---

## Step 4: 一覧取得関数を作る

```tsx
const loadMessages = async () => {
  const res = await fetch('/api/messages')

  if (!res.ok) {
    throw new Error(`一覧取得に失敗しました: ${res.status}`)
  }

  const data = (await res.json()) as { messages: Message[] }
  setMessages(data.messages)
}
```

### ここで見るポイント

- `fetch()` はHTTP通信
- `res.ok` はHTTP 200番台かどうか
- `res.json()` はレスポンス本文をJSONとして読む
- `setMessages()` でReactの状態を更新する

---

## Step 5: 初回表示時に読み込む

```tsx
useEffect(() => {
  void loadMessages().catch((e) => {
    setError(e instanceof Error ? e.message : '読み込みに失敗しました')
  })
}, [])
```

この `useEffect` は、画面の初回表示後に一覧を取得するために使っています。

`useEffect = API通信専用` ではありません。「レンダーとは別に外部へ影響する処理を行う仕組み」と考えてください。

---

## Step 6: 一覧を描画する

```tsx
<ul>
  {messages.map((message) => (
    <li key={message.id}>
      <p>{message.content}</p>
      <small>{message.createdAt}</small>
    </li>
  ))}
</ul>
```

配列の各要素をJSXへ変換しています。

---

## Step 7: 投稿フォームを作る

```tsx
<form onSubmit={handleSubmit}>
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    maxLength={140}
  />
  <button type="submit">投稿</button>
</form>
```

`value` と `onChange` を使い、入力欄の値をReactのStateで管理します。

---

## Step 8: POSTする

```tsx
const handleSubmit = async (e: React.FormEvent) => {
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
```

投稿成功後に一覧を再取得するため、画面にも新しい投稿が反映されます。

---

## Step 9: エラー表示を付ける

```tsx
{error && <p role="alert">{error}</p>}
```

エラーを `console.log` だけで終わらせず、利用者にも分かる形にします。

---

## Step 10: DevToolsで通信を見る

1件投稿し、NetworkタブでPOSTを選択します。

確認するもの:

- Request URL
- Method
- Status
- Payload
- Response

次に、空文字など不正な値を送るようコードを一時的に変更し、400になることも確認します。

---

## 完成チェック

- [ ] 初回表示で投稿一覧が出る
- [ ] フォームから投稿できる
- [ ] 投稿後に入力欄が空になる
- [ ] 投稿後に一覧が更新される
- [ ] API失敗時に画面へエラーが出る
- [ ] NetworkタブでPOSTのpayloadとstatusを確認できる
- [ ] `useState` と `useEffect` の役割を説明できる

## 今日の一言説明

> ボタンを押してから、新しい投稿が画面に出るまで何が起きている？

次の順番を追えればOKです。

```text
form → React → POST → Hono → JSON → GET → setMessages → 再レンダー
```

---

次: [第5回 Hono RPC で型安全につなぐ](session-05.md)

公式資料:
- https://react.dev/learn
- https://developers.cloudflare.com/workers/framework-guides/web-apps/react/
