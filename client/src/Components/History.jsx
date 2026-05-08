import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Toast from './Toast';
import ShareModal from './ShareModal';
import Spinner from './Spinner';
import { api } from '../api';
import { RELATIONS, RELATION_KEYS, capitalize } from './utils/relationship';

const PAGE_SIZE = 24;

function buildPageList(current, total) {
    if (total <= 1) return [1];
    const set = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
        out.push(sorted[i]);
    }
    return out;
}

function useDebounced(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function History() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [relation, setRelation] = useState('');
    const [skip, setSkip] = useState(0);
    const [stats, setStats] = useState(null);
    const [toast, setToast] = useState('');
    const [shareEntry, setShareEntry] = useState(null);
    const debouncedSearch = useDebounced(search, 350);
    const requestId = useRef(0);

    const fetchData = useCallback(async () => {
        const id = ++requestId.current;
        setLoading(true);
        setError('');
        try {
            const data = await api.listEntries({
                q: debouncedSearch,
                relation,
                limit: PAGE_SIZE,
                skip,
            });
            if (id !== requestId.current) return;
            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            if (id !== requestId.current) return;
            setError(e.message || 'Could not load history.');
            setItems([]);
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }, [debouncedSearch, relation, skip]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        api.getStats().then(setStats).catch(() => {});
    }, []);

    useEffect(() => {
        setSkip(0);
    }, [debouncedSearch, relation]);

    const breakdown = useMemo(() => {
        const map = new Map((stats?.breakdown || []).map((b) => [b.relation, b.count]));
        return RELATION_KEYS.map((k) => ({
            key: k,
            label: RELATIONS[k].label,
            Icon: RELATIONS[k].Icon,
            count: map.get(k) || 0,
        }));
    }, [stats]);

    const handleShare = (entry) => {
        setShareEntry(entry);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

    return (
        <main className="page">
            <div className="history__top">
                <div className="history__search-wrap">
                    <SearchIcon className="history__search-icon" fontSize="small" aria-hidden="true" />
                    <input
                        className="history__search"
                        type="search"
                        placeholder="Search by name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search history"
                    />
                    {loading && (
                        <span className="history__search-spinner">
                            <Spinner size={16} />
                        </span>
                    )}
                </div>
                <div className="filter-pills" role="tablist" aria-label="Filter by relation">
                    <button
                        type="button"
                        className={`filter-pill ${relation === '' ? 'is-active' : ''}`}
                        onClick={() => setRelation('')}
                    >
                        All
                    </button>
                    {RELATION_KEYS.map((key) => {
                        const { Icon, label } = RELATIONS[key];
                        return (
                            <button
                                type="button"
                                key={key}
                                className={`filter-pill ${relation === key ? 'is-active' : ''}`}
                                onClick={() => setRelation(key)}
                            >
                                <Icon fontSize="inherit" /> {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {stats && (
                <div className="history__stats" aria-label="Statistics">
                    <div className="stat-chip"><strong>{stats.total}</strong>Total analyses</div>
                    {breakdown.map((b) => {
                        const Icon = b.Icon;
                        return (
                            <div className="stat-chip" key={b.key}>
                                <strong>{b.count}</strong><Icon fontSize="inherit" /> {b.label}
                            </div>
                        );
                    })}
                </div>
            )}

            {error && <p className="analyzer__error">{error}</p>}

            {loading ? (
                <div className="cards">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div className="skeleton skeleton-card" key={i} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="empty glass">
                    <h3>No matches yet</h3>
                    <p>Be the first to analyze a pair — your result will show up here.</p>
                    <button className="btn btn--primary" style={{ marginTop: 12 }} onClick={() => navigate('/')}>
                        Try one
                    </button>
                </div>
            ) : (
                <div className="cards">
                    {items.map((item) => {
                        const meta = RELATIONS[item.relation] || RELATIONS.friends;
                        return (
                            <article className="card" key={item.id}>
                                <img className="card__media" src={meta.image} alt={meta.label} loading="lazy" />
                                <div className="card__body">
                                    <p className="card__names">
                                        {capitalize(item.name1)} <FavoriteIcon className="card__heart" aria-hidden="true" fontSize="inherit" /> {capitalize(item.name2)}
                                    </p>
                                    <p className="card__verdict">
                                        <meta.Icon fontSize="inherit" /> {meta.label}
                                    </p>
                                    {item.score != null && (
                                        <p className="card__score">Compatibility: {item.score}%</p>
                                    )}
                                    <button className="card__share" onClick={() => handleShare(item)}>
                                        <SendIcon fontSize="inherit" /> Share
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {total > PAGE_SIZE && !loading && (
                <nav className="pager" aria-label="History pagination">
                    <button
                        type="button"
                        className="pager__btn"
                        onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        ←
                    </button>
                    {buildPageList(currentPage, totalPages).map((p, i) =>
                        p === '…' ? (
                            <span key={`gap-${i}`} className="pager__gap" aria-hidden="true">…</span>
                        ) : (
                            <button
                                type="button"
                                key={p}
                                className={`pager__btn ${p === currentPage ? 'is-active' : ''}`}
                                onClick={() => setSkip((p - 1) * PAGE_SIZE)}
                                aria-current={p === currentPage ? 'page' : undefined}
                                aria-label={`Page ${p}`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        className="pager__btn"
                        onClick={() => setSkip(skip + PAGE_SIZE)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        →
                    </button>
                </nav>
            )}

            <Toast message={toast} onClose={() => setToast('')} />
            {shareEntry && (
                <ShareModal entry={shareEntry} onClose={() => setShareEntry(null)} />
            )}
        </main>
    );
}
