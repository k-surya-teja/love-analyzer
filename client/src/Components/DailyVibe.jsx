import { useMemo } from 'react';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SpaIcon from '@mui/icons-material/Spa';
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const VIBES = [
    { Icon: LocalFloristIcon, text: 'Today rewards bold confessions. Slide into the chat.' },
    { Icon: LocalCafeIcon, text: 'A coffee invitation today could change everything.' },
    { Icon: DarkModeIcon, text: 'Late-night texts hit different tonight. Reply faster.' },
    { Icon: AutoAwesomeIcon, text: 'Trust the spark. The universe is showing off.' },
    { Icon: MusicNoteIcon, text: 'Send them a song. Words are overrated today.' },
    { Icon: SpaIcon, text: 'Lucky pairs collide today. Take the leap.' },
    { Icon: FilterVintageIcon, text: 'A small, kind gesture earns a giant smile today.' },
    { Icon: LocalFireDepartmentIcon, text: 'Chemistry is loud today. Don’t whisper.' },
    { Icon: MarkEmailReadIcon, text: 'A message you’ve been overthinking — just send it.' },
    { Icon: ColorLensIcon, text: 'Old crushes resurface. Memories aren’t mistakes.' },
    { Icon: EmojiNatureIcon, text: 'Butterflies are data. Pay attention to who gives them.' },
    { Icon: StarIcon, text: 'Stars align for unexpected chemistry. Stay open.' },
    { Icon: CardGiftcardIcon, text: 'Giving energy returns 3x today. Be generous.' },
    { Icon: WbSunnyIcon, text: 'Sunshine connections today — gravitate to warmth.' },
];

export default function DailyVibe() {
    const vibe = useMemo(() => {
        const today = new Date();
        const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
        return VIBES[seed % VIBES.length];
    }, []);

    const Icon = vibe.Icon;

    return (
        <div className="daily glass" role="region" aria-label="Daily love vibe">
            <Icon className="daily__emoji" style={{ fontSize: 32 }} aria-hidden="true" />
            <div>
                <p className="daily__title">Today's Love Vibe</p>
                <p className="daily__text">{vibe.text}</p>
            </div>
        </div>
    );
}
