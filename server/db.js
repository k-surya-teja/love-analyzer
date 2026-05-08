require('dotenv').config();

require('dns').setDefaultResultOrder('ipv4first');

const { neon } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL;
if (!url) {
    console.error('DATABASE_URL is not set. Create a .env file with DATABASE_URL=...');
}

const sql = neon(url);

async function initDb() {
    await sql`
        CREATE TABLE IF NOT EXISTS userdata (
            id SERIAL PRIMARY KEY,
            name1 VARCHAR(40) NOT NULL,
            name2 VARCHAR(40) NOT NULL,
            relation VARCHAR(20) NOT NULL CHECK (
                relation IN ('friends','lovers','attraction','marriage','enemies','siblings')
            ),
            score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_userdata_created_at ON userdata (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_userdata_relation_created ON userdata (relation, created_at DESC)`;
}

async function ping() {
    try {
        await sql`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}

function isTransient(err) {
    const msg = (err?.message || '').toLowerCase();
    return msg.includes('fetch failed') ||
        msg.includes('connect') ||
        msg.includes('timeout') ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNRESET';
}

async function withRetry(fn, attempts = 4) {
    const delays = [400, 1200, 2500];
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (e) {
            lastErr = e;
            if (i === attempts - 1 || !isTransient(e)) throw e;
            const delay = delays[i] ?? 2500;
            console.warn(`Transient DB error (attempt ${i + 1}/${attempts}): ${e.message}. Retrying in ${delay}ms…`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw lastErr;
}

module.exports = { sql, initDb, ping, withRetry };
