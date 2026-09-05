# 第1回: プロジェクトを動かす + TypeScript

## 今日のゴール

- Hono + React + Vite + Cloudflare Workers の雛形をローカルで動かす
- 「フロントエンド」と「Worker」の場所を確認する
- TypeScript の型エラーを1つ自分で読んで直す

この回ではまだ掲示板を完成させません。**開発環境が動き、コードを変更して結果を確認できる状態**を作ることが目的です。

---

## Step 1: プロジェクトを作る

Cloudflare公式の Hono + React + Vite テンプレートを使います。

```bash
npm create cloudflare@latest -- message-board --template=cloudflare/templates/vite-react-template
```

CLIの質問文はバージョンで変わることがあります。途中でデプロイするか聞かれた場合、この回ではローカル開発だけなので **No** で構いません。

作成できたら移動します。

```bash
cd message-board
```

---

## Step 2: 起動する

```bash
npm run dev
```

ターミナルに表示されたローカルURLをブラウザで開きます。現行テンプレートでは通常 `http://localhost:5173` です。

### 確認

- ブラウザにReact画面が表示される
- ターミナルに致命的なエラーが出ていない
- ファイルを変更すると画面へ反映される

ここまで動かなければ、先へ進まずにエラーを読みます。

---

## Step 3: プロジェクトの地図を見る

2026年9月時点の公式テンプレートは概ね次の構成です。

```text
message-board/
├─ src/
│  ├─ worker/
│  │  └─ index.ts        ← Hono / API
│  └─ react-app/
│     └─ App.tsx         ← React / 画面
├─ index.html
├─ vite.config.ts
├─ wrangler.json         ← Cloudflare設定
├─ worker-configuration.d.ts
└─ package.json
```

Cloudflareの別テンプレートや将来の版では `wrangler.jsonc` の場合もあります。**拡張子を暗記するのではなく、Wranglerの設定ファイルを見つける**ことが大事です。

### ここで覚えること

- **React**: ブラウザに見える画面を作る
- **Hono**: `/api/...` のリクエストを処理する
- **Vite**: 開発サーバーとビルドを担当する
- **Wrangler**: Cloudflare Workers の設定・デプロイを担当する

全部を今覚える必要はありません。まず「どのファイルが何側なのか」を区別できれば十分です。

---

## Step 4: TypeScript の型を作る

掲示板で扱う1件の投稿を型で表します。

練習用に次を書いてみます。

```ts
type Message = {
  id: number
  content: string
  createdAt: string
}

const sample: Message = {
  id: 1,
  content: '最初の投稿',
  createdAt: new Date().toISOString(),
}

console.log(sample)
```

`Message` は「投稿データはこの形である」という約束です。

---

## Step 5: わざと壊す

`id` を一時的に文字列へ変えてみます。

```ts
const sample: Message = {
  id: '1',
  content: '型エラーになる',
  createdAt: new Date().toISOString(),
}
```

エディタに型エラーが出ることを確認してください。

確認できたら、`id: 1` に戻します。**わざと壊したコードを残さない**ところまでが練習です。

### 考える

なぜブラウザで実行する前に間違いが見つかったのでしょうか。

TypeScript は実行前の型チェックによって、**コードを書いている段階で矛盾を見つける**ためです。

---

## Step 6: 型推論を見る

次の2つを比べます。

```ts
const name: string = 'Taro'
const age = 20
```

`age` には `: number` と書いていませんが、TypeScript は値から `number` と推論できます。

### ポイント

型は何でも手書きすればよいわけではありません。

- 型が明らか → 推論に任せる
- データ構造や関数の境界 → 型を明示すると読みやすい

練習コードは確認後に消して構いません。第2回では実際のAPIデータとして `Message` 型を使います。

---

## Step 7: エラーの場所を読む

今後エラーが出たら、最初に次を確認します。

```text
1. 何というエラーか
2. どのファイルか
3. 何行目か
4. 自分が直前に何を変えたか
```

エラーメッセージを全部理解する必要はありません。まず**場所と原因候補を狭める**ことが重要です。

---

## 完成チェック

- [ ] `npm run dev` でアプリを起動できる
- [ ] `src/react-app/App.tsx` と `src/worker/index.ts` を指せる
- [ ] Wrangler設定ファイルの役割を説明できる
- [ ] `Message` 型を作れる
- [ ] わざと型エラーを出し、エディタ上で場所を確認した
- [ ] わざと入れた型エラーを元に戻した

## 今日の一言説明

次を30秒で説明してみてください。

> JavaScript と TypeScript は何が違う？

模範解答を暗記する必要はありません。「実行前に型の矛盾を検出できる」が入っていれば十分です。

---

次: [第2回 Hono で最初の API](session-02.md)

公式資料:
- https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- https://github.com/cloudflare/templates/tree/main/vite-react-template
