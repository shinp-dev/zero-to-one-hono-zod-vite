# Zero to One: Hono + React + Zod + D1 on Cloudflare

JavaScript の基礎を学んだ学生が、**1つの小さなWebアプリを毎回育てながら**、現代的なフルスタックWeb開発を一周するための授業資料です。

2026年9月版では、Cloudflare Pages と API Worker を分離する旧構成から、**Cloudflare Workers + Static Assets + Vite** の一体構成へ更新しました。フロントエンドとAPIを同一Originで動かし、学習の本筋ではないCORS設定を最初から背負わせない構成です。

## 対象

- JavaScript の変数、配列、関数、条件分岐を一度は学んだことがある
- HTML/CSS の基本を触ったことがある
- Webアプリを「動かしたことはあるが、全体がどうつながるかはまだ曖昧」な学生

## 7回で作るもの

題材は **一言掲示板** です。毎回別のサンプルを作るのではなく、同じアプリに機能を追加します。

1. TypeScript と開発環境を理解する
2. Hono で API を作る
3. Zod で入力を守る
4. React から API を使う
5. Hono RPC で型安全につなぐ
6. D1 にデータを保存する
7. Cloudflare Workers に公開し、DevTools で検証する

発展回では、認証・認可、テスト、マイグレーション、モノレポなど「次に必要になる設計」を整理します。

## 技術スタック

- **Runtime / Hosting**: Cloudflare Workers + Static Assets
- **Backend**: Hono
- **Frontend**: React + Vite
- **Validation**: Zod + `@hono/zod-validator`
- **Type-safe API client**: Hono RPC (`hono/client`)
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript
- **Tooling**: Cloudflare Vite plugin / Wrangler

## 授業資料

- [カリキュラム入口](curriculum/index.md)
- [第1回: プロジェクトを動かす + TypeScript](curriculum/session-01.md)
- [第2回: Hono で最初の API](curriculum/session-02.md)
- [第3回: Zod で入力を検証する](curriculum/session-03.md)
- [第4回: React から API を使う](curriculum/session-04.md)
- [第5回: Hono RPC で型安全につなぐ](curriculum/session-05.md)
- [第6回: D1 に永続化する](curriculum/session-06.md)
- [第7回: 公開・デバッグ・振り返り](curriculum/session-07.md)
- [発展回: 認証・認可・テスト・設計](curriculum/session-extra.md)

## 学び方

各回は次の順番で進みます。

1. **前回までの状態を確認**する
2. 今日追加する機能を小さく分解する
3. **1ステップずつ実装**し、その都度ブラウザやDevToolsで確認する
4. わざと失敗させて、エラーの場所を特定する
5. 完成条件を自分でチェックする
6. 「なぜこの仕組みが必要か」を自分の言葉で説明する

コードを写すことより、**入力 → API → バリデーション → DB → レスポンス → UI** の流れを追えることを重視します。

## AIを使う場合

AIによるコード生成を禁止する教材ではありません。ただし、生成したコードについて次の3点は説明できる状態にしてください。

- どのファイルを、なぜ変更したか
- ブラウザから送ったデータがどこを通っているか
- エラーが出たとき、Console / Network / ターミナルのどこを見るか

## 推奨環境

- Node.js 20 以上
- VS Code
- Git
- Cloudflare アカウント（第6〜7回で使用）

CLI の質問文や生成ファイルはバージョンによって多少変わることがあります。画面の文言を丸暗記せず、**何を設定しているか**を確認しながら進めてください。

## 2026年9月時点の公式資料

- Cloudflare: Hono + React + Vite
  - https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- Cloudflare: React + Vite
  - https://developers.cloudflare.com/workers/framework-guides/web-apps/react/
- Cloudflare: Static Assets
  - https://developers.cloudflare.com/workers/static-assets/
- Cloudflare: D1 / Wrangler
  - https://developers.cloudflare.com/d1/wrangler-commands/
- Hono: RPC
  - https://hono.dev/docs/guides/rpc

## 資料の管理方針

教材の正本は **Markdown版のみ** とします。以前のHTML複製版は内容の二重管理と更新漏れを避けるため廃止しました。GitHub上でそのまま閲覧してください。

## License

MIT License
