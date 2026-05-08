import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Toast from './Toast';
import Confetti from './Confetti';
import ShareModal from './ShareModal';
import { api } from '../api';
import { RELATIONS, capitalize } from './utils/relationship';

export default function SharePage() {
    const { id } = useParams();
    const [entry, setEntry] = useState(null);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confettiKey, setConfettiKey] = useState(0);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        let active = true;
        api.getEntry(id)
            .then((data) => {
                if (!active) return;
                setEntry(data);
                if (['lovers', 'marriage', 'attraction'].includes(data.relation)) {
                    setConfettiKey((k) => k + 1);
                }
            })
            .catch((e) => active && setError(e.message || 'Could not load this result.'));
        return () => {
            active = false;
        };
    }, [id]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setToast('Link copied!');
        } catch {
            setToast('Could not copy.');
        }
    };

    const handleShare = () => {
        if (!entry) return;
        setShowShare(true);
    };

    if (error) {
        return (
            <main className="page">
                <div className="empty glass" style={{ padding: 40 }}>
                    <h3>Result not found</h3>
                    <p>{error}</p>
                    <Link to="/" className="btn btn--primary" style={{ marginTop: 16 }}>
                        Try your own
                    </Link>
                </div>
            </main>
        );
    }

    if (!entry) {
        return (
            <main className="page">
                <div className="share-card glass">
                    <div className="skeleton" style={{ height: 180 }} />
                    <div className="share-card__body">
                        <div className="skeleton" style={{ height: 28, marginBottom: 12, borderRadius: 8 }} />
                        <div className="skeleton" style={{ height: 14, width: '60%', margin: '0 auto', borderRadius: 8 }} />
                    </div>
                </div>
            </main>
        );
    }

    const meta = RELATIONS[entry.relation] || RELATIONS.friends;

    return (
        <main className="page">
            <Confetti trigger={confettiKey} />
            <div className="share-card">
                <div className="share-card__hero" style={{ background: meta.gradient }}>
                    <meta.Icon style={{ fontSize: 44 }} aria-hidden="true" />
                    <h2>
                        {capitalize(entry.name1)} <FavoriteIcon className="share-card__heart" aria-hidden="true" fontSize="inherit" /> {capitalize(entry.name2)}
                    </h2>
                    <p style={{ margin: '6px 0 0', opacity: 0.95 }}>{meta.label} — {meta.tagline}</p>
                </div>
                <div className="share-card__body">
                    <img src={meta.image} alt={meta.label} style={{ width: '60%', borderRadius: 16 }} />
                    {entry.score != null && (
                        <div className="score" style={{ marginTop: 18 }}>
                            <div className="score__bar">
                                <div
                                    className="score__fill"
                                    style={{ width: `${entry.score}%`, background: meta.gradient }}
                                />
                            </div>
                            <div className="score__row">
                                <span>Compatibility</span>
                                <span className="score__value">{entry.score}%</span>
                            </div>
                        </div>
                    )}
                    <div className="share-card__cta">
                        <button className="btn btn--primary" onClick={handleShare}>
                            <SendIcon fontSize="small" /> Share
                        </button>
                        <button className="btn btn--ghost" onClick={handleCopy}>
                            <ContentCopyIcon fontSize="small" /> Copy link
                        </button>
                        <Link to="/" className="btn btn--ghost">Try your own</Link>
                    </div>
                </div>
            </div>
            <Toast message={toast} onClose={() => setToast('')} />
            {showShare && entry && (
                <ShareModal entry={entry} onClose={() => setShowShare(false)} />
            )}
        </main>
    );
}
