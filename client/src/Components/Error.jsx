import React from 'react';
import { WifiOff } from '@mui/icons-material';

export default function Error() {
    return (
        <main className="page">
            <div className="empty glass" style={{ padding: '60px 20px' }}>
                <WifiOff style={{ fontSize: 48, color: 'var(--primary)' }} />
                <h3 style={{ marginTop: 16 }}>You're offline</h3>
                <p>Reconnect to analyze new pairs and browse the history.</p>
            </div>
        </main>
    );
}
