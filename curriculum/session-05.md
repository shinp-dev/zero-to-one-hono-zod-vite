# 第5回: Hono RPC で型安全につなぐ

## 今日のゴール

- Honoの `AppType` をフロントエンドから利用する
- `fetch('/api/...')` の文字列ベタ書きをHono Clientへ置き換える
- 入力とレスポンスに型補完が効くことを確認する
- 「型安全でも実行時エラーは残る」ことを理解する

前回はReactから普通の `fetch()` でAPIを呼びました。今回は、Hono RPCでフロントとバックの型をつなぎます。

---

## 前回までの問題

```tsx
const res = await fetch('/api/messages')
const data = (await res.json()) as { messages: Message[] }
```

この書き方には、人間が合わせている部分があります。

- URL文字列
- HTTP method
- request bodyの形
- response bodyの型

バックエンドを変更しても、フロント側の手書き型は自動では変わりません。

---

## Step 1: Hono側で型を公開する

Worker側で、ルート定義を変数として受けます。

例:

```ts
const route = app
  .get('/api/messages', (c) => {
    return c.json({ messages })
  })
  .post(
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

export type AppType = typeof route
export default app
```

重要なのは実装コードをフロントへコピーすることではなく、**型情報をTypeScriptに渡すこと**です。

---

## Step 2: `strict` を確認する

Hono RPCの型推論を正しく使うため、TypeScript設定で `strict: true` を確認します。

テンプレートによって `tsconfig` が複数に分かれている場合があります。React側とWorker側の両方がstrict設定の対象になっているか確認してください。

---

## Step 3: Hono Clientを作る

React側でHono Clientを使います。

```tsx
import { hc } from 'hono/client'
import type { AppType } from '../../worker'

const client = hc<AppType>(window.location.origin)
```

相対パスはテンプレートのファイル配置に応じて調整してください。

`import type` なので、ここで欲しいのはWorkerの実行コードではなく型情報です。

---

## Step 4: GETをRPCへ置き換える

これまで:

```tsx
const res = await fetch('/api/messages')
```

変更後:

```tsx
const res = await client.api.messages.$get()
```

続けて:

```tsx
if (!res.ok) {
  throw new Error(`一覧取得に失敗しました: ${res.status}`)
}

const data = await res.json()
setMessages(data.messages)
```

`data.messages` の型補完が効くことを確認します。

---

## Step 5: POSTもRPCへ置き換える

```tsx
const res = await client.api.messages.$post({
  json: { content: input },
})
```

エディタで `json:` の中にカーソルを置き、補完を確認してください。

### わざと壊す

```tsx
const res = await client.api.messages.$post({
  json: { contents: input },
})
```

`contents` はサーバーのZodスキーマと一致しないため、型エラーになるはずです。

---

## Step 6: URLのタイポも試す

普通のfetchなら、次は実行するまで気付きにくいです。

```tsx
fetch('/api/mesages')
```

Hono Clientでは、定義されているルートをもとにプロパティが生成されるため、存在しないルートを補完から選ぶことはできません。

ただし「絶対に失敗しない」という意味ではありません。

---

## Step 7: 型安全が守らないもの

Hono RPCが助けてくれるのは主に**開発時のAPI契約**です。

次のような問題は実行時に起こり得ます。

- ネットワーク障害
- D1障害
- サーバー側の例外
- 401 / 403
- 500
- デプロイしたフロントとバックのバージョン不一致

そのため、次は残します。

```tsx
if (!res.ok) {
  // 利用者へエラー表示
}
```

「型安全だからエラー処理不要」ではありません。

---

## Step 8: CORSはどこへ行った？

この教材ではReactとHonoを同じWorker / Originにまとめています。

```text
https://example.workers.dev/
https://example.workers.dev/api/messages
```

そのため、基本構成ではCORS許可を追加する必要がありません。

もし将来、

```text
Frontend: https://app.example.com
API:      https://api.example.com
```

のように別Originへ分けた場合は、そこでCORS設計が必要になります。

---

## 完成チェック

- [ ] `AppType` をWorker側からexportした
- [ ] Hono Clientを作った
- [ ] GETを `$get()` に置き換えた
- [ ] POSTを `$post()` に置き換えた
- [ ] request bodyのタイポを型エラーとして確認した
- [ ] responseの型補完を確認した
- [ ] `res.ok` の実行時チェックを残した
- [ ] 同一Originなので基本CORS不要だと説明できる

## 今日の一言説明

> Hono RPCを使うと何が嬉しい？

「バックエンドのAPI定義から、フロント側のURL・入力・出力へ型をつなげられる」が説明できればOKです。

---

次: [第6回 D1 に永続化する](session-06.md)

公式資料: https://hono.dev/docs/guides/rpc
