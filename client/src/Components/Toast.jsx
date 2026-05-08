import { useEffect } from 'react';

export default function Toast({ message, onClose, duration = 2200 }) {
    useEffect(() => {
        if (!message) return undefined;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [message, onClose, duration]);

    if (!message) return null;
    return (
        <div className="toast" role="status" aria-live="polite">
            {message}
        </div>
    );
}
