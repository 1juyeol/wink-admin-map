
import { useState, useCallback, useEffect } from 'react';

export const useFavorites = () => {
    // Teams Favorites
    const [starredTeams, setStarredTeams] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('starredTeams') || '[]');
        } catch { return []; }
    });

    // Menus Favorites (Optional, though teams are more useful)
    const [starredMenus, setStarredMenus] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('starredMenus') || '[]');
        } catch { return []; }
    });

    // [Data Cleanup] Force clear old data to remove "Orange GNB" artifacts
    useEffect(() => {
        const isCleaned = localStorage.getItem('data_cleaned_v1');
        if (!isCleaned) {
            localStorage.removeItem('starredMenus'); // Remove bad menu data
            localStorage.setItem('starredMenus', '[]'); // Reset to empty
            setStarredMenus([]);
            localStorage.setItem('data_cleaned_v1', 'true');
            console.log("Old Favorites Data Cleared by System");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('starredTeams', JSON.stringify(starredTeams));
    }, [starredTeams]);

    useEffect(() => {
        localStorage.setItem('starredMenus', JSON.stringify(starredMenus));
    }, [starredMenus]);

    const toggleStarTeam = useCallback((teamObj, onLimitReached) => {
        setStarredTeams(prev => {
            const teamId = typeof teamObj === 'string' ? teamObj : teamObj.id;
            const teamName = typeof teamObj === 'string' ? teamObj : teamObj.name;

            const isExist = prev.some(t => {
                const prevId = typeof t === 'string' ? t : t.id;
                return prevId === teamId;
            });

            if (isExist) {
                return prev.filter(t => {
                    const prevId = typeof t === 'string' ? t : t.id;
                    return prevId !== teamId;
                });
            }

            // [한국어 설명] 외부 상태(starredMenus)와 합산 검사는 호출자(컴포넌트)에서 수행하거나
            // 콜백을 통해 토스트를 띄웁니다. 실제 블락은 아래 길이를 봅니다.
            if (prev.length + starredMenus.length >= 20) {
                if (onLimitReached) onLimitReached();
                return prev;
            }

            const newEntry = {
                id: teamId,
                name: teamName,
                type: 'team'
            };

            return [newEntry, ...prev];
        });
    }, [starredMenus.length]);

    const toggleStarMenu = useCallback((menuObj, onLimitReached) => {
        setStarredMenus(prev => {
            const isExist = prev.some(m => {
                const targetPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);
                const targetId = typeof menuObj === 'string' ? null : menuObj.id;

                const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                const mId = typeof m === 'string' ? null : m.id;

                if (targetId && mId) return targetId === mId;
                return mPath === targetPath;
            });

            if (isExist) {
                return prev.filter(m => {
                    const targetPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);
                    const targetId = typeof menuObj === 'string' ? null : menuObj.id;

                    const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                    const mId = typeof m === 'string' ? null : m.id;

                    if (targetId && mId) return targetId !== mId;
                    return mPath !== targetPath;
                });
            }

            if (prev.length + starredTeams.length >= 20) {
                if (onLimitReached) onLimitReached();
                return prev;
            }

            let type = typeof menuObj === 'string' ? null : menuObj.type;
            const fullPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);

            if (!type || type === 'page') {
                const depth = fullPath ? fullPath.split(' > ').length : 3;
                type = depth === 1 ? 'gnb' : depth === 2 ? 'lnb' : 'page';
            }

            const newEntry = {
                id: typeof menuObj !== 'string' ? menuObj.id : null,
                name: typeof menuObj === 'string' ? menuObj.split(' > ').pop() : menuObj.name,
                fullPath: fullPath,
                parentName: typeof menuObj !== 'string' ? menuObj.parentName : null,
                type: type
            };

            return [newEntry, ...prev];
        });
    }, [starredTeams.length]);

    return { starredTeams, toggleStarTeam, starredMenus, toggleStarMenu };
};
