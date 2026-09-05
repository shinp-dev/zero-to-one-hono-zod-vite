# Message Board checkpoint — Session 6 complete

第6回終了時の基準状態です。メモリ配列をCloudflare D1へ置き換え、Hono RPCはそのまま維持しています。

```bash
npm install
npm run dev
```

このチェックポイントでは復旧を簡単にするため、`npm run dev` の直前に `schema.sql` をローカルD1へ自動適用します。`CREATE TABLE IF NOT EXISTS` なので繰り返し実行できます。

`wrangler.json` の `database_id` はローカル復旧用のダミーUUIDです。本番へデプロイする場合は、自分で作成したD1のIDに置き換えてください。
