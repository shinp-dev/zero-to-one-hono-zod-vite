# Message Board checkpoint — Session 7 complete

第7回終了時の最終基準状態です。ソースコードは第6回終了時と同じで、第7回ではビルド・本番D1・デプロイ・Network/Logs確認を行います。

```bash
npm install
npm run dev
npm run build
```

このチェックポイントの `database_id` はローカル復旧用ダミーです。本番利用時は実際のD1 IDへ置き換え、`schema.sql` をremote D1へ適用してからデプロイしてください。

最終構成: React → Hono RPC → Zod → D1 → JSON → React
