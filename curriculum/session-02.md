# 第2回: Hono で最初の API

## 今日のゴール

- Hono のルートを1つ追加する
- `/api/messages` にアクセスしてJSONを返す
- ブラウザからWorkerまでの流れを追う

前回は雛形を動かしました。今回は、掲示板の「データを返す側」を作ります。

---

## 前回まで

```text
React画面  ← 表示できる
Hono API   ← 雛形のまま
D1         ← まだ使わない
```

今回はここまで進めます。

```text
Browser
  ↓ GET /api/messages
Hono
  ↓
JSON
```

---

## Step 1: Worker側のファイルを開く

テンプレートではHonoアプリは `src/worker/index.ts` 付近にあります。

まず既存コードを読み、次を探します。

- `new Hono()`
- `app.get(...)`
- `export default app`

「どこから処理が始まり、どこでレスポンスを返しているか」を確認してください。

---

## Step 2: 仮の投稿データを用意する

まだDBは使いません。メモリ上に仮データを置きます。

```ts
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
```

これは学習用です。Workerのメモリは永続ストレージではないため、後でD1へ置き換えます。

---

## Step 3: GET APIを追加する

```ts
app.get('/api/messages', (c) => {
  return c.json({ messages })
})
```

保存したら開発サーバーを確認します。

ブラウザで次へアクセスします。

```text
http://localhost:5173/api/messages
```

ポート番号は環境によって異なるため、実際にはターミナルに表示されたURLを使ってください。

### 期待する結果

```json
{
  "messages": [
    {
      "id": 1,
      "content": "こんにちは",
      "createdAt": "..."
    }
  ]
}
```

---

## Step 4: ルーティングを理解する

```ts
app.get('/api/messages', ...)
```

は、次の意味です。

```text
GET      → HTTP method
/api/messages → URL path
(c)      → Hono Context
c.json() → JSON response
```

### 追加練習

```ts
app.get('/api/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.json({ message: `こんにちは、${name}さん` })
})
```

`/api/hello/Taro` にアクセスして結果を確認します。

---

## Step 5: 404をわざと出す

存在しないURLへアクセスします。

```text
/api/not-found
```

### 観察する

- HTTP status は何番か
- ブラウザには何が表示されるか
- Networkタブではどう見えるか

`404` は「Workerが壊れた」ではなく、**そのURLに対応するルートが見つからない**という意味です。

---

## Step 6: DevTools の Network を開く

ブラウザのDevToolsを開き、Networkタブを確認します。

最低限、次を見つけてください。

- Request URL
- Request Method
- Status Code
- Response

この4つを見られるようになると、APIトラブルの切り分けがかなり楽になります。

---

## Step 7: 流れを言葉にする

今起きていることは次の通りです。

```text
1. ブラウザが GET /api/messages を送る
2. Hono がURLとmethodに合うルートを探す
3. handler が messages を読む
4. c.json() がHTTPレスポンスを返す
5. ブラウザがJSONを受け取る
```

---

## 完成チェック

- [ ] `/api/messages` にアクセスするとJSONが返る
- [ ] `GET` とURL pathの違いを説明できる
- [ ] 存在しないURLで404を確認した
- [ ] NetworkタブでURL / method / status / responseを確認できる
- [ ] 今の `messages` が永続保存ではないと説明できる

## 今日の一言説明

> Hono の `app.get('/api/messages', ...)` は何を登録している？

「GETで `/api/messages` が来たときに実行する処理」が説明できればOKです。

---

次: [第3回 Zod で入力を検証する](session-03.md)

公式資料: https://hono.dev/docs/api/routing
