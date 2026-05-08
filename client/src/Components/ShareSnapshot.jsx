import React, { forwardRef } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { capitalize, RELATIONS } from './utils/relationship';

const ShareSnapshot = forwardRef(function ShareSnapshot({ name1, name2, relation, score }, ref) {
    const meta = RELATIONS[relation] || RELATIONS.friends;
    const Icon = meta.Icon;
    return (
        <div ref={ref} className="snap-card" style={{ background: meta.gradient }}>
            <div className="snap-card__brand">
                <FavoriteIcon style={{ fontSize: 18 }} /> Love Analyzer
            </div>
            <div className="snap-card__media">
                <img src={meta.image} alt={meta.label} crossOrigin="anonymous" />
            </div>
            <div className="snap-card__body">
                <p className="snap-card__names">
                    <span>{capitalize(name1)}</span>
                    <FavoriteIcon className="snap-card__heart" style={{ fontSize: 28 }} />
                    <span>{capitalize(name2)}</span>
                </p>
                <p className="snap-card__verdict">
                    <Icon style={{ fontSize: 22 }} /> {meta.label}
                </p>
                {score != null && (
                    <div className="snap-card__score">
                        <div className="snap-card__bar">
                            <div
                                className="snap-card__fill"
                                style={{ width: `${score}%` }}
                            />
                        </div>
                        <div className="snap-card__score-row">
                            <span>Compatibility</span>
                            <strong>{score}%</strong>
                        </div>
                    </div>
                )}
                <p className="snap-card__tagline">{meta.tagline}</p>
            </div>
        </div>
    );
});

export default ShareSnapshot;
