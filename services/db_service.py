import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "db" / "rag_app.db"


def get_connection():
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT 'Untitled',
            pdf_name TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    conn.close()


# ─── Conversations ───

def create_conversation(title="Untitled", pdf_name=None):
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO conversations (title, pdf_name) VALUES (?, ?)",
        (title, pdf_name),
    )
    conn.commit()
    conv_id = cur.lastrowid
    conn.close()
    return conv_id


def get_conversations():
    conn = get_connection()
    rows = conn.execute("""
        SELECT c.*, COUNT(m.id) AS message_count
        FROM conversations c
        LEFT JOIN messages m ON m.conversation_id = c.id
        GROUP BY c.id
        ORDER BY c.updated_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_conversation(conv_id):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM conversations WHERE id = ?", (conv_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_conversation(conv_id, title=None, pdf_name=None):
    conn = get_connection()
    fields = []
    values = []
    if title is not None:
        fields.append("title = ?")
        values.append(title)
    if pdf_name is not None:
        fields.append("pdf_name = ?")
        values.append(pdf_name)
    if fields:
        fields.append("updated_at = datetime('now')")
        values.append(conv_id)
        conn.execute(
            f"UPDATE conversations SET {', '.join(fields)} WHERE id = ?",
            values,
        )
        conn.commit()
    conn.close()


def delete_conversation(conv_id):
    conn = get_connection()
    conn.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
    conn.commit()
    conn.close()


# ─── Messages ───

def add_message(conversation_id, role, content):
    conn = get_connection()
    conn.execute(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
        (conversation_id, role, content),
    )
    conn.execute(
        "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
        (conversation_id,),
    )
    conn.commit()
    conn.close()


def get_messages(conversation_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


init_db()
