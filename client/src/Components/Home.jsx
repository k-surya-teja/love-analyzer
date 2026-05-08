import React, { useEffect, useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Result from './Result';
import Error from './Error';
import DailyVibe from './DailyVibe';
import { computeRelation, compatibilityScore, RELATIONS, RELATION_KEYS } from './utils/relationship';

const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s'-]{0,39}$/;

export default function Home() {
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const update = () => setIsOffline(!navigator.onLine);
        update();
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);

    const validate = () => {
        const a = name1.trim();
        const b = name2.trim();
        if (!a || !b) return 'Please enter both names.';
        if (!NAME_PATTERN.test(a) || !NAME_PATTERN.test(b)) {
            return 'Use letters only (1-40 chars).';
        }
        if (a.toLowerCase() === b.toLowerCase()) {
            return 'Names should be different.';
        }
        return '';
    };

    const handleAnalyze = (e) => {
        e.preventDefault();
        const message = validate();
        if (message) {
            setError(message);
            return;
        }
        setError('');
        const relation = computeRelation(name1, name2);
        const score = compatibilityScore(name1, name2, relation);
        setResult({ name1: name1.trim(), name2: name2.trim(), relation, score, meta: RELATIONS[relation] });
    };

    const handleReset = () => {
        setName1('');
        setName2('');
        setError('');
    };

    if (isOffline) return <Error />;

    return (
        <main className="page">
            <section className="hero hero--compact">
                <span className="hero__eyebrow">FLAMES • Reimagined</span>
                <h1 className="hero__title hero__title--sm">
                    What do your <span className="accent">names</span> say?
                </h1>
                <p className="hero__subtitle hero__subtitle--sm">
                    Enter two names — get a relationship verdict and a compatibility score in seconds.
                </p>
            </section>

            <form className="analyzer glass analyzer--lifted" onSubmit={handleAnalyze} noValidate>
                <div className="analyzer__row">
                    <div className="field">
                        <label className="field__label" htmlFor="name1">Your name</label>
                        <input
                            id="name1"
                            className="field__input"
                            type="text"
                            placeholder="e.g. Aria"
                            value={name1}
                            onChange={(e) => setName1(e.target.value)}
                            maxLength={40}
                            autoComplete="off"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="name2">Their name</label>
                        <input
                            id="name2"
                            className="field__input"
                            type="text"
                            placeholder="e.g. Kai"
                            value={name2}
                            onChange={(e) => setName2(e.target.value)}
                            maxLength={40}
                            autoComplete="off"
                            required
                        />
                    </div>
                </div>

                {error && <p className="analyzer__error" role="alert">{error}</p>}

                <div className="analyzer__actions">
                    <button type="submit" className="btn btn--primary btn--lg" disabled={!name1 || !name2}>
                        <FavoriteBorderIcon fontSize="small" /> Analyze
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </form>

            <section className="below-fold">
                <div className="hero__pills">
                    {RELATION_KEYS.map((key) => {
                        const { Icon, label } = RELATIONS[key];
                        return (
                            <span className="hero__pill" key={key}>
                                <Icon fontSize="inherit" /> {label}
                            </span>
                        );
                    })}
                </div>

                <DailyVibe />

                <p className="hero__footnote">
                    A playful relationship oracle — for laughs, not life advice. Save your results and share them
                    with a unique link.
                </p>
            </section>

            {result && (
                <Result
                    name1={result.name1}
                    name2={result.name2}
                    relation={result.relation}
                    score={result.score}
                    meta={result.meta}
                    onClose={() => setResult(null)}
                />
            )}
        </main>
    );
}
