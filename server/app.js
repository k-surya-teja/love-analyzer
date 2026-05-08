require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { sql, initDb, ping, withRetry } = require('./db');

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map((o) => o.trim());

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

const corsOptions =
    allowedOrigins.includes('*')
        ? { origin: true }
        : {
              origin: (origin, cb) => {
                  if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
                  return cb(new Error('Not allowed by CORS'));
              },
          };
app.use(cors(corsOptions));

const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many submissions. Please slow down.' },
});

const readLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

const VALID_RELATIONS = ['friends', 'lovers', 'attraction', 'marriage', 'enemies', 'siblings'];

const ROW_COLUMNS = `id, name1, name2, relation, score, created_at AS "createdAt", updated_at AS "updatedAt"`;

function sanitizeName(value) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ').slice(0, 40);
}

function escapeLike(s) {
    return s.replace(/[\\%_]/g, (c) => '\\' + c);
}

app.get('/', (req, res) => {
    res.json({ message: 'Love Analyzer API is alive', status: 'ok' });
});

app.get('/health', async (req, res) => {
    const ok = await ping();
    res.json({
        status: 'ok',
        db: ok ? 'connected' : 'disconnected',
        uptime: process.uptime(),
    });
});

app.get('/userdata', readLimiter, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
        const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
        const search = sanitizeName(req.query.q || '');
        const relation = (req.query.relation || '').toString().toLowerCase();

        const conds = [];
        const params = [];
        if (search) {
            const idx = params.length + 1;
            conds.push(`(name1 ILIKE $${idx} OR name2 ILIKE $${idx})`);
            params.push(`%${escapeLike(search)}%`);
        }
        if (VALID_RELATIONS.includes(relation)) {
            params.push(relation);
            conds.push(`relation = $${params.length}`);
        }
        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

        const listSql = `
            SELECT ${ROW_COLUMNS}
            FROM userdata
            ${where}
            ORDER BY created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        const countSql = `SELECT COUNT(*)::int AS count FROM userdata ${where}`;

        const [items, countRows] = await Promise.all([
            withRetry(() => sql(listSql, [...params, limit, skip])),
            withRetry(() => sql(countSql, params)),
        ]);

        res.json({ items, total: countRows[0]?.count || 0, limit, skip });
    } catch (e) {
        console.error('GET /userdata failed:', e.message, e.code || '', e.detail || '');
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get('/userdata/stats', readLimiter, async (req, res) => {
    try {
        const rows = await withRetry(() => sql`
            SELECT relation, COUNT(*)::int AS count
            FROM userdata
            GROUP BY relation
        `);
        const total = rows.reduce((s, r) => s + r.count, 0);
        res.json({ total, breakdown: rows });
    } catch (e) {
        console.error('GET /userdata/stats failed:', e.message, e.code || '', e.detail || '');
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

app.get('/userdata/:id', readLimiter, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const rows = await withRetry(() => sql(
            `SELECT ${ROW_COLUMNS} FROM userdata WHERE id = $1`,
            [id]
        ));
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (e) {
        console.error('GET /userdata/:id failed:', e.message, e.code || '', e.detail || '');
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
});

app.post('/userdata', writeLimiter, async (req, res) => {
    try {
        const name1 = sanitizeName(req.body?.name1);
        const name2 = sanitizeName(req.body?.name2);
        const relation = (req.body?.relation || '').toString().toLowerCase();
        const score = Number.isFinite(req.body?.score)
            ? Math.max(0, Math.min(100, Math.round(req.body.score)))
            : null;

        if (!name1 || !name2) {
            return res.status(400).json({ error: 'Both names are required' });
        }
        if (!VALID_RELATIONS.includes(relation)) {
            return res.status(400).json({ error: 'Invalid relation' });
        }
        if (name1.toLowerCase() === name2.toLowerCase()) {
            return res.status(400).json({ error: 'Names must be different' });
        }

        const rows = await withRetry(() => sql(
            `INSERT INTO userdata (name1, name2, relation, score)
             VALUES ($1, $2, $3, $4)
             RETURNING ${ROW_COLUMNS}`,
            [name1, name2, relation, score]
        ));
        res.status(201).json({ message: 'Posted Successfully', item: rows[0] });
    } catch (e) {
        console.error('POST /userdata failed:', e.message, e.code || '', e.detail || '');
        res.status(500).json({ error: 'Failed to save entry' });
    }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Server error' });
});

initDb()
    .then(() => console.log('Database ready'))
    .catch((e) => console.error('Database init failed:', e.message));

const server = app.listen(port, () => {
    console.log('Server is running on ' + port);
});

const shutdown = (signal) => () => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));
