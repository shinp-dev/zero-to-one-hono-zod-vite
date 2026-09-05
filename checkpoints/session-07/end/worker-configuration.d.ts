// Checkpoint用の最小型定義です。
// 実プロジェクトでは `npm run cf-typegen` でWrangler設定から再生成してください。
interface D1Result<T = unknown> {
  results: T[]
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface Env {
  DB: D1Database
}
