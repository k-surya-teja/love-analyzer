import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Footer() {
    return (
        <footer className="la-footer">
            <p>
                Made with <FavoriteIcon className="footer__heart" aria-hidden="true" fontSize="inherit" /> by{' '}
                <a href="https://www.github.com/k-surya-teja" rel="noreferrer" target="_blank">
                    Surya
                </a>{' '}
                · Just for fun, not for fortune-telling.
            </p>
        </footer>
    );
}
