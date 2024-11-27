const { Client } = require("pg");

require("dotenv").config({ path: ".env" });

// PostgreSQL 接続情報
const client = new Client({
  host: process.env.DB_HOST, // RDS のエンドポイントまたは IP アドレス
  port: process.env.DB_PORT, // PostgreSQL のポート
  user: process.env.DB_USER, // 作成したユーザー名
  password: process.env.DB_PASSWORD, // 作成したパスワード
  database: process.env.DB_NAME, // 作成したデータベース名
});

// 接続処理
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("PostgreSQL に接続しました！");

    // サンプルクエリ
    const res = await client.query("SELECT * FROM moniterd_channels");
    console.log("クエリ結果:", res.rows);

    await client.end();
    console.log("接続を終了しました。");
  } catch (err) {
    console.error("データベース接続エラー:", err.stack);
  }
}

connectToDatabase();
