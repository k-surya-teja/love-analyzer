import HandshakeIcon from '@mui/icons-material/Handshake';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DiamondIcon from '@mui/icons-material/Diamond';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import friends from '../../images/friends.gif';
import marriage from '../../images/marriage.gif';
import enemies from '../../images/enemies.gif';
import sisters from '../../images/sister.gif';
import attraction from '../../images/attraction.gif';
import lovers from '../../images/lovers.gif';
import friendsImg from '../../images/friends.jpg';
import loversImg from '../../images/lovers.jpg';
import attractionImg from '../../images/attraction.jpg';
import marriageImg from '../../images/marriage.jpg';
import enemiesImg from '../../images/enemies.jpg';
import siblingsImg from '../../images/siblings.jpg';
import loveMusic from '../../images/music.mp3';
import sisterMusic from '../../images/sisterMusi.mp3';

export const RELATIONS = {
    friends: {
        relation: 'friends',
        label: 'Friends',
        Icon: HandshakeIcon,
        gif: friends,
        image: friendsImg,
        accent: '#22c1c3',
        gradient: 'linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)',
        tagline: 'Two souls, one inside joke.',
    },
    lovers: {
        relation: 'lovers',
        label: 'Lovers',
        Icon: FavoriteIcon,
        gif: lovers,
        image: loversImg,
        music: loveMusic,
        accent: '#ff4d6d',
        gradient: 'linear-gradient(135deg, #ff4d6d 0%, #ffb3c1 100%)',
        tagline: 'Sparks, butterflies, and slow songs.',
    },
    attraction: {
        relation: 'attraction',
        label: 'Attraction',
        Icon: AutoAwesomeIcon,
        gif: attraction,
        image: attractionImg,
        accent: '#a86de9',
        gradient: 'linear-gradient(135deg, #a86de9 0%, #ffb6f3 100%)',
        tagline: 'Magnetic. Unspoken. Electric.',
    },
    marriage: {
        relation: 'marriage',
        label: 'Marriage',
        Icon: DiamondIcon,
        gif: marriage,
        image: marriageImg,
        accent: '#f5a524',
        gradient: 'linear-gradient(135deg, #f5a524 0%, #ffe27a 100%)',
        tagline: 'The forever kind of forever.',
    },
    enemies: {
        relation: 'enemies',
        label: 'Enemies',
        Icon: WhatshotIcon,
        gif: enemies,
        image: enemiesImg,
        accent: '#475569',
        gradient: 'linear-gradient(135deg, #1f2937 0%, #ef4444 100%)',
        tagline: 'Tom & Jerry energy.',
    },
    siblings: {
        relation: 'siblings',
        label: 'Siblings',
        Icon: Diversity1Icon,
        gif: sisters,
        image: siblingsImg,
        music: sisterMusic,
        accent: '#0ea5e9',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #a7f3d0 100%)',
        tagline: 'Squabbles by day, allies by night.',
    },
};

export const RELATION_KEYS = Object.keys(RELATIONS);

export function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalize(s) {
    return (s || '').toLowerCase().replace(/[^a-z]/g, '');
}

// Classic FLAMES — returns one of the 6 relation keys.
export function computeRelation(rawA, rawB) {
    const order = ['friends', 'lovers', 'attraction', 'marriage', 'enemies', 'siblings'];
    const a = normalize(rawA);
    const b = normalize(rawB);

    const counts = new Array(26).fill(0);
    for (const ch of a) counts[ch.charCodeAt(0) - 97]++;
    let len = b.length;
    for (const ch of b) {
        const i = ch.charCodeAt(0) - 97;
        if (counts[i] > 0) {
            counts[i]--;
            len--;
        }
    }
    for (const c of counts) len += c;

    const list = [...order];
    let i = 0;
    let n = list.length;
    while (n > 1) {
        i = (i + len - 1) % n;
        list.splice(i, 1);
        n--;
    }
    return list[0];
}

// Stable, deterministic score for the same (name1, name2) pair.
// Uses a small string hash with the relation type as seed so the score
// "fits" the relation: lovers/marriage skew high, enemies low, friends mid-high.
function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
}

export function compatibilityScore(rawA, rawB, relation) {
    const a = normalize(rawA);
    const b = normalize(rawB);
    const pair = [a, b].sort().join('+');
    const base = hash(pair) % 1000; // 0-999

    const ranges = {
        lovers: [82, 99],
        marriage: [80, 98],
        attraction: [70, 92],
        friends: [60, 88],
        siblings: [55, 85],
        enemies: [10, 45],
    };
    const [min, max] = ranges[relation] || [50, 80];
    const span = max - min;
    return Math.round(min + (base / 999) * span);
}

export function shareUrlFor(id) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/share/${id}`;
}
