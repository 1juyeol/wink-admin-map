import { useState, useCallback, useEffect } from 'react';

export function useLayoutState() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showDiff, setShowDiff] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        return false;
    });

    // Handle initial state and manual changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }
        // Also ensure the body has the dark class if darkMode is true
        if (window.document.body) {
            if (darkMode) {
                window.document.body.classList.add('dark');
            } else {
                window.document.body.classList.remove('dark');
            }
        }
    }, [darkMode]);

    // System Dark Mode Sync
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

    return {
        isSidebarOpen,
        setIsSidebarOpen,
        showDiff,
        setShowDiff,
        darkMode,
        toggleDarkMode
    };
}
