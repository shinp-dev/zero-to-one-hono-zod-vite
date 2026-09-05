# 発展回: 認証・認可・テスト・設計

この回は「新しいライブラリをたくさん覚える回」ではありません。

7回で作った掲示板を見ながら、**実際のサービスへ近づけると次に何が必要になるか**を整理します。

---

## 1. バリデーションだけでは守れない

第3回でZodを入れました。

```text
Zod
  ↓
入力形式が正しいか
```

しかし、次は別問題です。

```text
誰が操作している？
その人に操作権限がある？
```

### 認証 Authentication

「あなたは誰か」を確認する仕組みです。

例:

- メール + パスワード
- OAuth / OpenID Connect
- Passkey
- 外部認証サービス

### 認可 Authorization

「その人がその操作をしてよいか」を判定します。

例:

```text
投稿者本人 → 自分の投稿を削除できる
他人       → 削除できない
管理者     → 必要に応じて削除できる
```

認証済みでも、認可チェックが無ければ危険です。

---

## 2. 削除APIを設計してみる

仮に次を追加するとします。

```text
DELETE /api/messages/:id
```

実装前に考えます。

- 投稿者をDBにどう保存する？
- 誰がログイン中か、Workerはどう知る？
- 投稿者本人かどうか、どこで判定する？
- 存在しない投稿は404？
- 他人の投稿は403？

「先にコードを書く」のではなく、**ルールを決めてからAPIを設計する**練習です。

---

## 3. DB制約も考える

Zodでチェックしていても、DBは最後の保存境界です。

例えばユーザーを追加するなら:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE
);
```

`UNIQUE` は「同じメールアドレスを重複保存しない」というDB側のルールです。

```text
UI validation
  ↓
API validation
  ↓
Authorization
  ↓
DB constraints
```

複数の境界で役割が違います。

---

## 4. SQLファイル1枚からMigrationへ

授業では `schema.sql` 1枚で進めました。

実際に運用が始まると、既存DBを壊さず変更する必要があります。

例:

```text
0001_create_messages.sql
0002_add_users.sql
0003_add_message_user_id.sql
```

Cloudflare D1にはmigrationコマンドがあります。

```bash
npx wrangler d1 migrations create message-board-db add-users
npx wrangler d1 migrations apply message-board-db --local
npx wrangler d1 migrations apply message-board-db --remote
```

重要なのは「最新schemaだけ」ではなく、**どういう順番でDBを変更したか**を残すことです。

公式資料:
https://developers.cloudflare.com/d1/wrangler-commands/

---

## 5. テストは何を守る？

全部をE2Eテストにする必要はありません。

まず、壊れると困る境界から考えます。

### バリデーション

```text
空文字 → 400
140文字 → 成功
141文字 → 400
```

### 認可

```text
本人 → DELETE成功
他人 → 403
未ログイン → 401
```

### API

```text
POST成功後 → GETに反映される
```

「コード行をテストする」のではなく、**守りたい仕様をテストする**と考えます。

Cloudflare WorkersにはVitest integrationがあります。

公式資料:
https://developers.cloudflare.com/workers/testing/vitest-integration/

---

## 6. Secrets と環境変数

APIキーや秘密情報をソースコードへ直接書かないでください。

```ts
// NG
const API_KEY = 'secret-value'
```

公開してよい設定と秘密情報を分けます。

```text
公開設定     → wrangler.jsonc の vars など
秘密情報     → Secrets
DB/R2など    → Bindings
```

秘密情報をGitへcommitしないことは、ライブラリ選びより先に身につける運用です。

公式資料:
https://developers.cloudflare.com/workers/configuration/secrets/

---

## 7. CORSはいつ必要？

この教材ではReactとHonoが同じOriginです。

```text
https://example.workers.dev/
https://example.workers.dev/api/messages
```

そのため基本的なCORS設定を省けました。

将来、FrontendとAPIを分離すると:

```text
https://app.example.com
https://api.example.com
```

Originが異なります。

そこで初めて、

- 許可するOrigin
- 許可するmethod
- credentialsを使うか
- preflight

などを設計します。

「とりあえず `cors()` で全部許可」は本番設計では避けます。

---

## 8. モノレポは必要になってから分ける

この教材のテンプレートは、最初からReactとWorkerを1つのリポジトリで管理しています。

小規模なうちは、それで十分です。

アプリが大きくなり、共通処理を切り出したくなったら、例えば次のように分けられます。

```text
apps/
  web/
  api/
packages/
  schemas/
  shared/
```

npm workspacesなどを使うと、複数packageを1repoで管理できます。

ただし、**モノレポ化そのものを目的にしない**でください。

分割の理由が、

- 複数アプリから共有したい
- package境界を明確にしたい
- 独立したbuild/testが必要

などになった時に導入します。

Hono RPCをモノレポで使う場合、Client/Server双方でTypeScriptの `strict: true` が重要です。

公式資料:
https://hono.dev/docs/guides/rpc

---

## 9. AIに実装させるときのレビュー観点

AIへ「ログインを追加して」と頼むだけではなく、最低限次を確認します。

```text
入力値はどこで検証？
認証情報はどこから取得？
認可判定はどこ？
秘密情報はcommitされない？
失敗時のHTTP statusは？
DB制約は？
テスト対象は？
```

AIがコードを大量に書けるほど、**何を満たせば完成なのかを人間側が決めること**が重要になります。

---

## 発展課題

次のうち1つを選び、コードを書く前に仕様を箇条書きしてください。

### A. 投稿削除

- 誰が削除できる？
- 未ログイン時は？
- 他人の投稿なら？

### B. いいね

- 1人何回押せる？
- ログイン必須？
- DBテーブルは？

### C. 画像投稿

- どこへ保存する？
- サイズ上限は？
- MIME typeは検証する？

### D. 管理画面

- 誰が管理者？
- 一般ユーザーとの権限差は？

---

## 最後に

7回の教材で一番重要なのは、個々のAPI名ではありません。

```text
要件
 ↓
画面
 ↓
API契約
 ↓
入力検証
 ↓
権限判定
 ↓
データ保存
 ↓
エラー処理
 ↓
テスト
 ↓
デプロイ
```

この順番で「どこに責任を持たせるか」を考えられるようになると、別のフレームワークやAI生成コードでも判断しやすくなります。
