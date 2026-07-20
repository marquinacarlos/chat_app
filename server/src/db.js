import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY,
      username TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at)
  `);
}

export async function saveMessage({ id, username, text, timestamp }) {
  await pool.query(
    "INSERT INTO messages (id, username, text, created_at) VALUES ($1, $2, $3, $4)",
    [id, username, text, timestamp]
  );
}

export async function getRecentMessages() {
  const result = await pool.query(
    `SELECT id, username, text, created_at as timestamp
     FROM messages
     WHERE created_at > NOW() - INTERVAL '2 days'
     ORDER BY created_at ASC
     LIMIT 200`
  );
  return result.rows.map((row) => ({
    type: "message",
    id: row.id,
    username: row.username,
    text: row.text,
    timestamp: row.timestamp.toISOString(),
  }));
}

export async function cleanOldMessages() {
  const result = await pool.query(
    "DELETE FROM messages WHERE created_at < NOW() - INTERVAL '2 days'"
  );
  return result.rowCount;
}
