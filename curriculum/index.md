# カリキュラム入口

このカリキュラムは、**90分×7回**を想定しています。毎回別のアプリを作るのではなく、1つの「一言掲示板」を少しずつ完成させます。

最終形は次の構成です。

```text
Browser
  |
  | same origin
  v
Cloudflare Worker
  ├─ React SPA (Static Assets)
  └─ Hono API (/api/*)
         |
         v
        D1
```

フロントエンドとAPIを同じWorkerにまとめるため、基本の授業ではCORS設定を不要にしています。CORSは「別Originへ分割したときに必要になる知識」として発展回で扱います。

## ゴール

7回を終えた時点で、次を自分の言葉で説明できれば合格です。

- React の画面から送った値が、どのAPIへ届くか
- Zod がどの地点で何を守っているか
- TypeScript の型と、実行時バリデーションの違い
- Hono RPC が何を型安全にしているか
- D1 Binding が何をつないでいるか
- 400 / 404 / 500 が出たとき、どこを確認するか
- ローカルで動くことと、本番公開できることの違い

## 授業一覧

| 回 | テーマ | その回の完成状態 |
|---|---|---|
| [第1回](session-01.md) | プロジェクトを動かす + TypeScript | Hono + React + Vite の雛形が動き、型エラーを読める |
| [第2回](session-02.md) | Hono API | `/api/messages` からJSONを返せる |
| [第3回](session-03.md) | Zod | POSTされた不正データを400で拒否できる |
| [第4回](session-04.md) | React | 一覧取得と投稿をブラウザ画面から行える |
| [第5回](session-05.md) | Hono RPC | URLや入出力に型補完が効く |
| [第6回](session-06.md) | D1 | 再起動しても投稿が残る |
| [第7回](session-07.md) | 公開・デバッグ | Cloudflareに公開し、Networkタブで通信を説明できる |
| [発展回](session-extra.md) | 認証・認可・テスト・設計 | 「次に何を守るべきか」を判断できる |

## 開始・終了チェックポイント

途中から再開したいとき、コードを壊して戻せなくなったとき、完成例との差分を確認したいときは、各回の実プロジェクトを使えます。

| 回 | 開始時 | 終了時 |
|---|---|---|
| 第1回 | [start](../checkpoints/session-01/start) | [end](../checkpoints/session-01/end) |
| 第2回 | [start](../checkpoints/session-02/start) | [end](../checkpoints/session-02/end) |
| 第3回 | [start](../checkpoints/session-03/start) | [end](../checkpoints/session-03/end) |
| 第4回 | [start](../checkpoints/session-04/start) | [end](../checkpoints/session-04/end) |
| 第5回 | [start](../checkpoints/session-05/start) | [end](../checkpoints/session-05/end) |
| 第6回 | [start](../checkpoints/session-06/start) | [end](../checkpoints/session-06/end) |
| 第7回 | [start](../checkpoints/session-07/start) | [end](../checkpoints/session-07/end) |

各フォルダは単体のプロジェクトです。

```bash
npm install
npm run dev
```

原則として **前回の `end` = 次回の `start`** です。詳しい運用は [チェックポイントREADME](../checkpoints/README.md) を参照してください。

## 90分の基本配分

目安です。クラスの進み具合に応じて調整してください。

- 10分: 前回の確認
- 15分: 今日の概念説明
- 45分: ステップ実装
- 15分: わざと壊す / DevToolsで調査
- 5分: 完成チェックと振り返り

## 共通ルール

### 1. 1ステップごとに動かす

大量にコードを書いて最後に実行しないでください。

```text
変更
 ↓
実行
 ↓
確認
 ↓
次の変更
```

この繰り返しを基本にします。

### 2. エラーを消す前に読む

最低限、次を確認します。

- **ブラウザ Console**: React / JavaScript のエラー
- **Network**: APIのURL、method、status、request、response
- **ターミナル**: Worker / TypeScript / build エラー

### 3. 「動いた」で終わらない

各回の最後にある **完成チェック** を使い、何ができるようになったか確認してください。

### 4. AIに任せても、経路は自分で追う

AIで実装した場合も、最低限次を説明できるようにします。

```text
入力フォーム
  ↓
React
  ↓
HTTP request
  ↓
Hono route
  ↓
Zod
  ↓
D1
  ↓
JSON response
  ↓
React
```

## 最初に必要なもの

```bash
node -v
git --version
```

新規環境では **Node.js 24 LTSを推奨**します。22 LTSでも構いません。Node.js 20系はEOLのため、この教材では新規導入を推奨しません。

Cloudflareへのログインは第6〜7回で行うため、第1回の時点ではアカウント未設定でも構いません。

## 公式資料

教材のコマンドは2026年9月時点の公式資料に合わせています。

- Cloudflare Hono guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- Cloudflare Vite plugin: https://developers.cloudflare.com/workers/vite-plugin/
- Hono RPC: https://hono.dev/docs/guides/rpc
- D1 Wrangler commands: https://developers.cloudflare.com/d1/wrangler-commands/
- Node.js releases: https://nodejs.org/en/about/previous-releases

次は [第1回](session-01.md) へ進んでください。
