
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

    const toggleStarTeam = useCallback((teamObj) => {
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

            // [한국어 설명] 즐겨찾기 최대 개수 제한 (50개)
            if (prev.length >= 50) {
                alert('즐겨찾기는 최대 50개까지만 저장 가능합니다.');
                return prev;
            }

            // [한국어 설명] 팀 정보를 객체 형태로 저장하여 검색 결과와 동일한 데이터 구조를 유지합니다.
            const newEntry = {
                id: teamId,
                name: teamName,
                type: 'team'
            };

            return [newEntry, ...prev];
        });
    }, []);

    const toggleStarMenu = useCallback((menuObj) => {
        setStarredMenus(prev => {
            // [v6.11.11] 즐겨찾기 고유 식별 로직 개선: ID와 경로를 모두 체크하여 정확도 향상
            // [v8.5] 고유 식별 로직 강화: 타입과 ID/경로를 모두 고려하여 버튼/페이지 간 간섭 방지
            const isExist = prev.some(m => {
                const targetPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);
                const targetId = typeof menuObj === 'string' ? null : menuObj.id;
                const targetType = typeof menuObj === 'string' ? 'page' : menuObj.type;

                const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                const mId = typeof m === 'string' ? null : m.id;
                const mType = typeof m === 'string' ? 'page' : m.type;

                // 1. ID가 둘 다 있으면 ID로만 비교
                if (targetId && mId) return targetId === mId;
                // 2. ID가 하나라도 있는 경우 다른 쪽과 다르면 무조건 다른 항목으로 간주
                if (targetId !== mId) return false;
                // 3. ID가 없는 경우 타입과 경로가 모두 같아야 동일 항목
                return mType === targetType && mPath === targetPath;
            });

            if (isExist) {
                return prev.filter(m => {
                    const targetPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);
                    const targetId = typeof menuObj === 'string' ? null : menuObj.id;
                    const targetType = typeof menuObj === 'string' ? 'page' : menuObj.type;

                    const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                    const mId = typeof m === 'string' ? null : m.id;
                    const mType = typeof m === 'string' ? 'page' : m.type;

                    if (targetId && mId) return targetId !== mId;
                    if (targetId !== mId) return true;
                    return !(mType === targetType && mPath === targetPath);
                });
            }

            // [한국어 설명] 즐겨찾기 최대 개수를 50개로 제한합니다. (사용자 요청 반영)
            if (prev.length >= 50) {
                alert('즐겨찾기는 최대 50개까지만 저장 가능합니다.');
                return prev;
            }

            // [Data Consistency] Enforce Sidebar Structure (Depth 1=GNB, 2=LNB, 3=Page)
            // This prevents items from being saved as generic 'page' type.
            let type = typeof menuObj === 'string' ? null : menuObj.type;
            const fullPath = typeof menuObj === 'string' ? menuObj : (menuObj.fullPath || menuObj.path);

            if (!type || type === 'page') {
                const depth = fullPath ? fullPath.split(' > ').length : 3;
                type = depth === 1 ? 'gnb' : depth === 2 ? 'lnb' : 'page';
            }

            // [한국어 설명] 새로운 즐겨찾기 추가 시, 나중에 표시하기 좋게 객체 형태로 상세 정보를 담습니다.
            const newEntry = {
                id: typeof menuObj !== 'string' ? menuObj.id : null,
                name: typeof menuObj === 'string' ? menuObj.split(' > ').pop() : menuObj.name,
                fullPath: fullPath,
                parentName: typeof menuObj !== 'string' ? menuObj.parentName : null,
                type: type
            };

            return [newEntry, ...prev];
        });
    }, []);

    return { starredTeams, toggleStarTeam, starredMenus, toggleStarMenu };
};
