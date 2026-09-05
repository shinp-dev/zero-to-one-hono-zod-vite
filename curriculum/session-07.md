# 第7回: 公開・デバッグ・振り返り

## 今日のゴール

- 本番D1へテーブルを作る
- React + Hono + D1 を1つのCloudflare Workerとして公開する
- DevToolsで本番通信を確認する
- 「動く」と「安全に運用できる」の違いを考える

最終回です。ここでは新しい大機能を増やすより、**公開・確認・説明できる状態にすること**を重視します。

---

## 最終構成

```text
Browser
  |
  | https://xxxx.workers.dev
  v
Cloudflare Worker
  ├─ React SPA (Static Assets)
  └─ Hono API (/api/*)
         |
         | DB Binding
         v
        D1
```

Cloudflare Vite pluginを使う構成では、フロントの静的ファイルとWorkerコードを同じデプロイ単位として扱えます。

---

## Step 1: ローカルで最終確認する

```bash
npm run dev
```

最低限、次を試します。

- 一覧表示
- 正常な投稿
- 空文字投稿
- 140文字
- 141文字
- ページ再読み込み
- 開発サーバー再起動後のデータ

### Networkタブも確認

POSTを1件選び、次を見ます。

```text
Request URL
Request Method
Status Code
Request Payload
Response
```

---

## Step 2: ビルドを通す

```bash
npm run build
```

開発サーバーで動いていても、TypeScriptや本番ビルドでエラーになることがあります。

ここで失敗したら、デプロイへ進まず直します。

---

## Step 3: 本番D1へテーブルを作る

第6回で作ったのはローカルDBです。本番側にもテーブルが必要です。

```bash
npx wrangler d1 execute message-board-db --remote --file=./schema.sql
```

### 確認

```bash
npx wrangler d1 execute message-board-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

`messages` テーブルが存在することを確認します。

---

## Step 4: デプロイする

テンプレートの `package.json` に用意されているデプロイスクリプトを使います。

```bash
npm run deploy
```

表示された `*.workers.dev` URLを開きます。

この構成では、React画面とHono APIを別々にPagesへデプロイする必要はありません。

---

## Step 5: 本番で投稿する

本番URLで次を確認します。

- 画面が表示される
- 投稿できる
- 再読み込みしても残る
- `/api/messages` がJSONを返す

ローカルにあった投稿が本番に無いのは正常です。

```text
local D1  !=  remote D1
```

---

## Step 6: 本番のNetworkを読む

本番環境で1件投稿し、Networkタブを見ます。

### 説明できるようにする

```text
POST /api/messages
  ↓
Zod validation
  ↓
D1 INSERT
  ↓
201
  ↓
ReactがGETし直す
  ↓
画面更新
```

コードを見ずにこの流れを説明してみてください。

---

## Step 7: わざと失敗させる

### 例1: URLを一時的に間違える

存在しないAPIへアクセスして404を確認します。

### 例2: 不正入力

141文字を送って400を確認します。

### 例3: サーバーエラーを読む

授業環境で安全に試せる場合のみ、一時的にhandler内で例外を発生させ、500時に何を見るか確認します。確認後は必ず元へ戻してください。

### 切り分け

| 状況 | 最初に見る場所 |
|---|---|
| ボタンを押しても反応しない | Console |
| APIが失敗している | Network |
| Worker処理が落ちる | ターミナル / Workers Logs |
| 404 | URLとHono route |
| 400 | request bodyとZod |
| 500 | Worker側の例外・DB処理 |

---

## Step 8: セキュリティ上の穴を考える

今の掲示板は学習用です。

例えば削除APIを次のように足したとします。

```text
DELETE /api/messages/:id
```

認証も認可も無ければ、URLを知っている人は他人の投稿まで消せるかもしれません。

ここで3つを分けます。

```text
バリデーション → 入力の形は正しいか
認証           → あなたは誰か
認可           → あなたがそれをしてよいか
```

Zodを入れたから安全、TypeScriptだから安全、という話ではありません。

---

## Step 9: 最終説明テスト

次の質問にコードを見ず答えてみます。

1. ReactはD1へ直接アクセスしていますか？
2. Zodはフロントとバックのどちらで必須ですか？
3. Hono RPCがあっても `res.ok` を確認するのはなぜですか？
4. `DB` Bindingは何をつないでいますか？
5. local D1とremote D1は同じデータですか？
6. 400と500は何が違いますか？
7. 誰でも削除できるAPIを防ぐには何が必要ですか？

---

## 完成チェック

- [ ] `npm run build` が成功する
- [ ] 本番D1にschemaを適用した
- [ ] `npm run deploy` が成功する
- [ ] 公開URLで一覧と投稿が動く
- [ ] NetworkタブでPOSTのrequest/responseを確認した
- [ ] 400 / 404 / 500 の違いを説明できる
- [ ] React → Hono → Zod → D1 → React の経路を説明できる
- [ ] バリデーション / 認証 / 認可の違いを説明できる

## 最終振り返り

この授業の目的は、HonoやReactのAPIを暗記することではありません。

完成時に次の地図が頭にあれば成功です。

```text
UI
 ↓
HTTP
 ↓
API route
 ↓
Validation
 ↓
Business logic
 ↓
Database
 ↓
Response
 ↓
UI
```

ライブラリが変わっても、この境界の考え方は多くのWebアプリで使えます。

---

次: [発展回 認証・認可・テスト・設計](session-extra.md)

公式資料:
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/vite-plugin/
- https://developers.cloudflare.com/d1/wrangler-commands/
