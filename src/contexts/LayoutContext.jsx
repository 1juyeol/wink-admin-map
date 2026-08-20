import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showDiff, setShowDiff] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }
        if (window.document.body) {
            if (darkMode) {
                window.document.body.classList.add('dark');
            } else {
                window.document.body.classList.remove('dark');
            }
        }
    }, [darkMode]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const hasSavedTheme = localStorage.getItem('theme');
            if (!hasSavedTheme) {
                setDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    }, []);

    const value = useMemo(() => ({
        isSidebarOpen,
        setIsSidebarOpen,
        showDiff,
        setShowDiff,
        darkMode,
        toggleDarkMode
    }), [isSidebarOpen, showDiff, darkMode, toggleDarkMode]);

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
