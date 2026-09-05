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

Worker側で、これまで別々に定義していたGET / POSTルートを1つのチェーンへまとめ、**既存ルートを置き換えます**。

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

新しいルートを追加して重複させるのではなく、第4回まで使っていた `app.get()` / `app.post()` をこの形へ整理してください。

重要なのは実装コードをフロントへコピーすることではなく、**APIの型情報をTypeScriptに渡すこと**です。

---

## Step 2: 型生成とTypeScript設定を確認する

2026年9月時点のCloudflare公式テンプレートでは、Workerは次のように `Env` 型を使っています。

```ts
const app = new Hono<{ Bindings: Env }>()
```

まずCloudflare設定からWorker用の型を生成します。

```bash
npm run cf-typegen
```

現行テンプレートでは、このscriptが `wrangler types` を実行し、`worker-configuration.d.ts` を更新します。

Hono RPCではClient/Server双方でTypeScriptの `strict: true` が重要です。公式テンプレートでは既に有効ですが、`tsconfig.app.json` とWorker側の設定を確認してください。

さらに、React側からWorkerの `AppType` を直接importすると、React側の型チェックでもWorkerが使う `Env` の宣言を参照できる必要があります。現行テンプレートの `tsconfig.app.json` は `src/react-app` だけをincludeしているため、ルートに生成された型定義もincludeします。

```json
{
  "include": ["src/react-app", "worker-configuration.d.ts"]
}
```

既存の `compilerOptions` はそのまま残し、既存の `include` 配列へ `worker-configuration.d.ts` を追加してください。

---

## Step 3: Hono Clientを作る

現行テンプレートでは `App.tsx` が `src/react-app/App.tsx`、Workerが `src/worker/index.ts` にあります。

```tsx
import { hc } from 'hono/client'
import type { AppType } from '../worker'

const client = hc<AppType>(window.location.origin)
```

`import type` なので、ここで欲しいのはWorkerの実行コードではなく型情報です。

ファイルを別フォルダへ移した場合は、実際のディレクトリ構成に合わせて相対パスも変わります。

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

前回フロント側に手書きしていたレスポンス型が不要になったことも確認してください。

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

確認後は `content` に戻します。

---

## Step 6: URLのタイポと比べる

普通のfetchなら、次は実行するまで気付きにくいです。

```tsx
fetch('/api/mesages')
```

Hono Clientでは、定義されているルートをもとにプロパティが推論されるため、存在しないルートは型として扱えません。

ただし「型安全 = 絶対に失敗しない」ではありません。

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

そのため、次のチェックは残します。

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

将来、

```text
Frontend: https://app.example.com
API:      https://api.example.com
```

のように別Originへ分けた場合は、そこでCORS設計が必要になります。

---

## 完成チェック

- [ ] 既存のGET / POSTを `const route` へまとめた
- [ ] `AppType` をWorker側からexportした
- [ ] `npm run cf-typegen` でWorker型を更新した
- [ ] React側のTypeScript設定から `worker-configuration.d.ts` を参照できる
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

公式資料:
- https://hono.dev/docs/guides/rpc
- https://github.com/cloudflare/templates/tree/main/vite-react-template
