import React from 'react';
import { NavLink } from 'react-router-dom';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from './utils/ThemeContext';
import logo from '../images/groom.png';

export default function NavbarHome() {
    const { theme, toggle } = useTheme();
    return (
        <nav className="la-nav" aria-label="Main">
            <div className="la-nav__inner">
                <NavLink to="/" className="la-brand">
                    <img src={logo} alt="" className="la-brand__logo" />
                    Love Analyzer
                </NavLink>
                <div className="la-nav__links">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `la-nav__link ${isActive ? 'is-active' : ''}`}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/history"
                        className={({ isActive }) => `la-nav__link ${isActive ? 'is-active' : ''}`}
                    >
                        History
                    </NavLink>
                    <button
                        type="button"
                        className="la-icon-btn"
                        onClick={toggle}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                    >
                        {theme === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
