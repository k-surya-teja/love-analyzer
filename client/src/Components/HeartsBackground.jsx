import { useMemo } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ICONS = [FavoriteIcon, FavoriteBorderIcon, AutoAwesomeIcon];

export default function HeartsBackground({ count = 12 }) {
    const items = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                size: 14 + Math.random() * 22,
                delay: Math.random() * 18,
                duration: 12 + Math.random() * 14,
                Icon: ICONS[Math.floor(Math.random() * ICONS.length)],
            })),
        [count]
    );

    return (
        <div className="bg-hearts" aria-hidden="true">
            {items.map((h) => (
                <span
                    key={h.id}
                    style={{
                        left: h.left,
                        animationDelay: `${h.delay}s`,
                        animationDuration: `${h.duration}s`,
                    }}
                >
                    <h.Icon style={{ fontSize: h.size }} />
                </span>
            ))}
        </div>
    );
}
