import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from './Confetti';
import Toast from './Toast';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ShareModal from './ShareModal';
import Spinner from './Spinner';
import { api } from '../api';
import { capitalize } from './utils/relationship';

export default function Result({ name1, name2, relation, score, meta, onClose }) {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isPreparingShare, setIsPreparingShare] = useState(false);
    const [savedId, setSavedId] = useState(null);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [animatedScore, setAnimatedScore] = useState(0);
    const [confettiKey, setConfettiKey] = useState(0);
    const [showShare, setShowShare] = useState(false);

    const isCelebratory = ['lovers', 'marriage', 'attraction'].includes(relation);

    useEffect(() => {
        const escape = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', escape);
        return () => window.removeEventListener('keydown', escape);
    }, [onClose]);

    useEffect(() => {
        const t = setTimeout(() => setAnimatedScore(score), 150);
        if (isCelebratory) setConfettiKey((k) => k + 1);
        return () => clearTimeout(t);
    }, [score, isCelebratory]);

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            const data = await api.createEntry({
                name1: capitalize(name1),
                name2: capitalize(name2),
                relation,
                score,
            });
            setSavedId(data?.item?.id || null);
            setToast('Saved to history');
            setTimeout(() => navigate('/history'), 1100);
        } catch (e) {
            setError(e.message || 'Could not save right now.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (savedId) {
            setShowShare(true);
            return;
        }
        try {
            setIsPreparingShare(true);
            const data = await api.createEntry({
                name1: capitalize(name1),
                name2: capitalize(name2),
                relation,
                score,
            });
            setSavedId(data?.item?.id || null);
            setShowShare(true);
        } catch (e) {
            setError(e.message || 'Could not prepare share link.');
        } finally {
            setIsPreparingShare(false);
        }
    };

    return (
        <div className="result-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
            {isCelebratory && <Confetti trigger={confettiKey} />}
            <div className="result">
                <div className="result__header" style={{ background: meta.gradient }}>
                    <button type="button" className="result__close" onClick={onClose} aria-label="Close">
                        <CloseIcon />
                    </button>
                    <p id="result-title" className="result__names">
                        <span>{capitalize(name1)}</span>
                        <FavoriteIcon className="result__heart" aria-hidden="true" />
                        <span>{capitalize(name2)}</span>
                    </p>
                    <p className="result__tagline">{meta.tagline}</p>
                </div>

                <div className="result__body">
                    <img className="result__gif" src={meta.gif} alt={meta.label} />
                    <p className="result__verdict">
                        <meta.Icon className="result__emoji" aria-hidden="true" />
                        {meta.label}
                    </p>

                    <div className="score" aria-label={`Compatibility score: ${score} percent`}>
                        <div className="score__bar">
                            <div
                                className="score__fill"
                                style={{ width: `${animatedScore}%`, background: meta.gradient }}
                            />
                        </div>
                        <div className="score__row">
                            <span>Compatibility</span>
                            <span className="score__value">{animatedScore}%</span>
                        </div>
                    </div>

                    {meta.music && (
                        <audio autoPlay loop>
                            <source src={meta.music} type="audio/mpeg" />
                        </audio>
                    )}

                    {error && <p className="analyzer__error" style={{ marginTop: 14 }}>{error}</p>}
                </div>

                <div className="result__actions">
                    {savedId ? (
                        <p className="result__success">Saved! Redirecting…</p>
                    ) : (
                        <>
                            <button type="button" className="btn btn--ghost" onClick={onClose}>
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={handleSave}
                                disabled={isSaving || isPreparingShare}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner size={14} /> Saving
                                    </>
                                ) : (
                                    <>
                                        <FavoriteIcon fontSize="small" /> Save
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={handleShare}
                                disabled={isSaving || isPreparingShare}
                            >
                                {isPreparingShare ? (
                                    <>
                                        <Spinner size={14} /> Preparing
                                    </>
                                ) : (
                                    <>
                                        <SendIcon fontSize="small" /> Share
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <Toast message={toast} onClose={() => setToast('')} />
            {showShare && (
                <ShareModal
                    entry={{ id: savedId, name1, name2, relation, score }}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    );
}
