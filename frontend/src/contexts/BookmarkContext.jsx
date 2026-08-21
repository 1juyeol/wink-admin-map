import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from './ToastContext';

const BookmarkContext = createContext(null);

export const BookmarkProvider = ({ children }) => {
    const { starredTeams, toggleStarTeam, starredMenus, toggleStarMenu } = useFavorites();
    const { showToast } = useToast();

    // Recent Items State
    const [recentItems, setRecentItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentItems') || '[]');
        } catch { return []; }
    });

    const addRecentItem = useCallback((result, isAdmin) => {
        if (!isAdmin || !result) return;
        setRecentItems(prev => {
            const newItemId = result.id || result.path || result.fullPath || result.name;
            const newItemType = result.type;
            const newItem = {
                name: result.name,
                fullPath: result.path || result.fullPath || result.name,
                type: newItemType,
                id: result.id,
                parentName: result.parentName
            };
            const filtered = prev.filter(item => {
                const itemId = item.id || item.fullPath || item.name;
                return !(item.type === newItemType && itemId === newItemId);
            });
            const next = [newItem, ...filtered].slice(0, 10);
            localStorage.setItem('recentItems', JSON.stringify(next));
            return next;
        });
    }, []);

    const clearRecentItems = useCallback(() => {
        setRecentItems([]);
        localStorage.removeItem('recentItems');
        showToast('최근 검색 기록이 삭제되었습니다.', 'info');
    }, [showToast]);

    // Wrapped Favorites Logic with Toasts
    const handleToggleStarTeam = useCallback((team) => {
        const teamId = typeof team === 'string' ? team : team.id;
        const isStarred = starredTeams.some(t => (typeof t === 'string' ? t : t.id) === teamId);

        let limitReached = false;
        toggleStarTeam(team, () => {
            limitReached = true;
            showToast('즐겨찾기는 최대 20개까지만 추가할 수 있습니다. 기존 항목을 해제해주세요.', 'warning');
        });

        if (!limitReached) {
            showToast(isStarred ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.', 'info');
        }
    }, [toggleStarTeam, starredTeams, showToast]);

    const handleToggleStarMenu = useCallback((menu) => {
        const isStarred = starredMenus.some(m => {
            const targetPath = typeof menu === 'string' ? menu : (menu.fullPath || menu.path);
            const targetId = typeof menu === 'string' ? null : menu.id;

            const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
            const mId = typeof m === 'string' ? null : m.id;

            if (targetId && mId) return targetId === mId;
            return mPath === targetPath;
        });

        let limitReached = false;
        toggleStarMenu(menu, () => {
            limitReached = true;
            showToast('즐겨찾기는 최대 20개까지만 추가할 수 있습니다. 기존 항목을 해제해주세요.', 'warning');
        });

        if (!limitReached) {
            showToast(isStarred ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.', 'info');
        }
    }, [toggleStarMenu, starredMenus, showToast]);

    const value = useMemo(() => ({
        recentItems,
        addRecentItem,
        clearRecentItems,
        starredTeams,
        handleToggleStarTeam,
        starredMenus,
        handleToggleStarMenu
    }), [recentItems, addRecentItem, clearRecentItems, starredTeams, handleToggleStarTeam, starredMenus, handleToggleStarMenu]);

    return (
        <BookmarkContext.Provider value={value}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmark = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmark must be used within a BookmarkProvider');
    }
    return context;
};
