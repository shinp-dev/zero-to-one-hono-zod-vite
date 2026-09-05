# 第6回: D1 に永続化する

## 今日のゴール

- Cloudflare D1を作成してWorkerへBindingする
- SQLでテーブルを作る
- メモリ配列をD1へ置き換える
- ローカル開発用DBと本番DBを区別する

ここまで投稿はメモリ上の配列に入れていました。今回は、再起動しても残るデータベースへ移します。

---

## 前回までの弱点

```text
Worker process
  └─ messages[]
```

この配列は永続ストレージではありません。

- 再起動で消える可能性がある
- 複数のWorker実行環境で同じ配列を共有する仕組みではない
- 本番データ保存には使えない

そこでD1を使います。

```text
React
  ↓
Hono
  ↓ Binding
D1
```

---

## Step 1: Cloudflareへログインする

```bash
npx wrangler login
```

ブラウザが開いたら、授業で使うCloudflareアカウントを認証します。

---

## Step 2: D1データベースを作ってBindingする

2026年9月時点のWranglerでは、DB作成とWorker設定へのBinding追加をまとめて行えます。

```bash
npx wrangler d1 create message-board-db --binding DB --update-config
```

実行後、Wrangler設定ファイルを開きます。現行の公式Vite Reactテンプレートでは `wrangler.json` です。

次のような `d1_databases` 設定が追加されていることを確認します。

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "message-board-db",
      "database_id": "実際に作成されたID"
    }
  ]
}
```

別テンプレートなどで `wrangler.jsonc` を使っていても考え方は同じです。

`binding: "DB"` は、Workerコードから `c.env.DB` として参照するための名前です。

---

## Step 3: Bindingの型を更新する

Cloudflare設定からWorker用のTypeScript型を再生成します。

```bash
npm run cf-typegen
```

現行テンプレートでは `wrangler types` が実行され、`worker-configuration.d.ts` が更新されます。

Workerはすでに次のように `Env` 型を使っています。

```ts
const app = new Hono<{ Bindings: Env }>()
```

型生成後、`Env` に `DB: D1Database` 相当のBindingが追加されていることを確認します。

```text
Wrangler設定にDBを書く
  ↓
npm run cf-typegen
  ↓
TypeScriptから c.env.DB が見える
```

Bindingを変更したら型も再生成する、という流れを覚えてください。

---

## Step 4: テーブル定義を作る

プロジェクトルートに `schema.sql` を作ります。

```sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 読み方

```text
id         → 主キー、自動採番
content    → 投稿本文、NULL不可
created_at → 作成日時
```

Zodだけでなく、DBにも最低限の制約を持たせます。

---

## Step 5: ローカルDBへ適用する

```bash
npx wrangler d1 execute message-board-db --local --file=./schema.sql
```

`--local` が重要です。この時点では自分の開発環境用D1へSQLを実行しています。

---

## Step 6: GETをD1へ置き換える

メモリ配列を読む処理を削除し、D1から取得します。

```ts
type MessageRow = {
  id: number
  content: string
  created_at: string
}

app.get('/api/messages', async (c) => {
  const result = await c.env.DB
    .prepare(
      'SELECT id, content, created_at FROM messages ORDER BY id DESC',
    )
    .all<MessageRow>()

  const messages = result.results.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
  }))

  return c.json({ messages })
})
```

DB上の `created_at` と、API上の `createdAt` を変換しています。

「DBの都合をそのまま画面へ漏らさない」という境界の例です。

---

## Step 7: POSTをD1へ置き換える

Zodで検証した後にINSERTします。

```ts
app.post(
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
```

### なぜ `.bind()` を使う？

SQL文字列へ利用者入力を直接連結しないためです。

避ける例:

```ts
// やらない
`INSERT INTO messages (content) VALUES ('${input.content}')`
```

値はプレースホルダー `?` と `.bind()` で渡します。

---

## Step 8: RPCの型変化を確認する

POSTレスポンスを `{ message }` から `{ ok: true }` へ変更した場合、React側で古いレスポンスプロパティを使っていれば型エラーになります。

これが前回導入したHono RPCの効果です。

API仕様を変えたら、**壊れた場所をTypeScriptに探してもらう**ことができます。

---

## Step 9: 再起動テスト

1. ブラウザから投稿する
2. 開発サーバーを終了する
3. 再び `npm run dev`
4. 一覧を開く

ローカルD1に投稿が残っていることを確認します。

---

## Step 10: ローカルと本番を区別する

```text
--local  → ローカル開発用D1
--remote → Cloudflare上のD1
```

この2つは同じデータではありません。

「ローカルでテーブルを作ったから本番にもある」と思わないようにしてください。

---

## 完成チェック

- [ ] D1を作成した
- [ ] Wrangler設定に `DB` Bindingが追加された
- [ ] `npm run cf-typegen` を実行した
- [ ] `c.env.DB` に型補完が効く
- [ ] ローカルDBへ `schema.sql` を適用した
- [ ] GETがD1からデータを読む
- [ ] POSTがD1へ保存する
- [ ] SQLに入力値を直接文字列連結していない
- [ ] 開発サーバー再起動後も投稿が残る
- [ ] local DBとremote DBの違いを説明できる

## 今日の一言説明

> Bindingは何のためにある？

「WorkerのコードとCloudflare上のD1などのリソースを、設定した名前でつなぐ」が説明できればOKです。

---

次: [第7回 公開・デバッグ・振り返り](session-07.md)

公式資料:
- https://developers.cloudflare.com/d1/wrangler-commands/
- https://developers.cloudflare.com/workers/languages/typescript/
