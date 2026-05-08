import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { FaWhatsapp, FaInstagram, FaSnapchat, FaTelegram, FaFacebookF, FaXTwitter } from 'react-icons/fa6';
import ShareSnapshot from './ShareSnapshot';
import Spinner from './Spinner';
import { capitalize, RELATIONS, shareUrlFor } from './utils/relationship';

function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return res.blob();
}

function dataUrlToFile(blob, filename) {
    return new File([blob], filename, { type: 'image/png' });
}

async function copyImageToClipboard(blob) {
    if (!navigator.clipboard || !window.ClipboardItem) return false;
    try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return true;
    } catch {
        return false;
    }
}

function isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    if (navigator.userAgentData?.mobile) return true;
    return /android|iphone|ipad|ipod|iemobile|opera mini|mobi/i.test(navigator.userAgent || '');
}

export default function ShareModal({ entry, onClose }) {
    const snapshotRef = useRef(null);
    const [busy, setBusy] = useState('');
    const [toast, setToast] = useState('');

    const meta = RELATIONS[entry.relation] || RELATIONS.friends;
    const url = entry.id ? shareUrlFor(entry.id) : window.location.href;
    const text = `${capitalize(entry.name1)} & ${capitalize(entry.name2)} — ${meta.label}${
        entry.score != null ? ` (${entry.score}%)` : ''
    } · Love Analyzer`;
    const filename = `love-analyzer-${entry.name1}-${entry.name2}.png`
        .toLowerCase()
        .replace(/\s+/g, '-');

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const flash = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2200);
    };

    const captureImage = async () => {
        const node = snapshotRef.current;
        if (!node) throw new Error('No snapshot node');
        return toPng(node, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
        });
    };

    // On mobile we use the Web Share API so the image is attached and the
    // user picks the destination from the OS share sheet (Snap/IG/WA show up
    // there). On desktop the OS sheet has no useful targets, so we copy the
    // image to clipboard and open the platform's web URL — user pastes.
    const sharePlatform = (platform) => async () => {
        try {
            setBusy(platform.key);
            const dataUrl = await captureImage();
            const blob = await dataUrlToBlob(dataUrl);
            const file = dataUrlToFile(blob, filename);

            if (isMobileDevice() && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Love Analyzer',
                        text,
                        url,
                    });
                    return;
                } catch (e) {
                    if (e?.name === 'AbortError') return;
                }
            }

            const copied = await copyImageToClipboard(blob);
            if (copied) {
                flash(`Image copied! Paste it in ${platform.label}.`);
            } else {
                downloadDataUrl(dataUrl, filename);
                flash(`Image saved! Attach it in ${platform.label}.`);
            }
            if (platform.fallbackUrl) {
                setTimeout(() => window.open(platform.fallbackUrl, '_blank', 'noopener'), 700);
            }
        } catch (e) {
            flash('Could not generate image.');
        } finally {
            setBusy('');
        }
    };

    const handleDownload = async () => {
        try {
            setBusy('download');
            const dataUrl = await captureImage();
            downloadDataUrl(dataUrl, filename);
            flash('Image saved!');
        } catch {
            flash('Could not generate image.');
        } finally {
            setBusy('');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            flash('Link copied!');
        } catch {
            flash('Could not copy.');
        }
    };

    const encoded = (s) => encodeURIComponent(s);
    const messageText = `${text} ${url}`;

    const platforms = [
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            color: '#25D366',
            Icon: FaWhatsapp,
            fallbackUrl: `https://wa.me/?text=${encoded(messageText)}`,
        },
        {
            key: 'instagram',
            label: 'Instagram',
            color: '#E4405F',
            Icon: FaInstagram,
            fallbackUrl: 'https://www.instagram.com/',
        },
        {
            key: 'snapchat',
            label: 'Snapchat',
            color: '#FFFC00',
            iconColor: '#000',
            Icon: FaSnapchat,
            fallbackUrl: 'https://www.snapchat.com/',
        },
        {
            key: 'twitter',
            label: 'X / Twitter',
            color: '#000000',
            Icon: FaXTwitter,
            fallbackUrl: `https://twitter.com/intent/tweet?text=${encoded(text)}&url=${encoded(url)}`,
        },
        {
            key: 'telegram',
            label: 'Telegram',
            color: '#229ED9',
            Icon: FaTelegram,
            fallbackUrl: `https://t.me/share/url?url=${encoded(url)}&text=${encoded(text)}`,
        },
        {
            key: 'facebook',
            label: 'Facebook',
            color: '#1877F2',
            Icon: FaFacebookF,
            fallbackUrl: `https://www.facebook.com/sharer/sharer.php?u=${encoded(url)}`,
        },
    ];

    const tiles = [
        ...platforms.map((p) => ({
            ...p,
            onClick: sharePlatform(p),
        })),
        {
            key: 'copy',
            label: 'Copy link',
            color: 'var(--text-muted)',
            Icon: ContentCopyIcon,
            onClick: handleCopyLink,
        },
        {
            key: 'download',
            label: 'Download',
            color: 'var(--text-muted)',
            Icon: DownloadIcon,
            onClick: handleDownload,
        },
    ];

    return (
        <div className="share-modal" role="dialog" aria-modal="true" aria-label="Share this result">
            <div className="share-modal__backdrop" onClick={onClose} />
            <div className="share-modal__panel">
                <button
                    type="button"
                    className="share-modal__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
                <h3 className="share-modal__title">Share your match</h3>

                <div className="share-modal__preview">
                    <ShareSnapshot
                        ref={snapshotRef}
                        name1={entry.name1}
                        name2={entry.name2}
                        relation={entry.relation}
                        score={entry.score}
                    />
                    {busy && busy !== 'copy' && (
                        <div className="spinner-overlay">
                            <Spinner size={36} />
                        </div>
                    )}
                </div>

                <div className="share-modal__grid">
                    {tiles.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            className="share-tile"
                            onClick={t.onClick}
                            disabled={busy === t.key}
                        >
                            <span
                                className="share-tile__icon"
                                style={{ background: t.color, color: t.iconColor || '#fff' }}
                            >
                                {busy === t.key ? <Spinner size={20} /> : <t.Icon />}
                            </span>
                            <span className="share-tile__label">{t.label}</span>
                        </button>
                    ))}
                </div>

                {toast && <div className="share-modal__toast">{toast}</div>}
            </div>
        </div>
    );
}
