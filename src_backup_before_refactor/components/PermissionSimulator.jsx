
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { MultiSelect } from './MultiSelect';
import { useUrlState } from '../hooks/useUrlState';
import { usePermissionData } from '../hooks/usePermissionData';
import { useLayoutState } from '../hooks/useLayoutState';
import { useFavorites } from '../hooks/useFavorites';
import { HeaderControls } from './HeaderControls';
import { Loader2, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { generateMarkdown } from '../utils/markdownGenerator';

// Modals
import { ExcelDiffModal } from './ExcelDiffModal';
import { HiddenMenuModal } from './HiddenMenuModal';

export const PermissionSimulator = () => {
    // 1. Data Logic Hook
    const { data, loading, handleJsonExport } = usePermissionData();
    const { starredTeams, toggleStarTeam, starredMenus, toggleStarMenu } = useFavorites();

    useEffect(() => {
        console.log("%c[v12.0 LIVE] WINK Admin Map Simulator - Production Ready", "color: #6366f1; font-weight: bold;");
    }, []);

    // 2. UI Layout Logic Hook
    const {
        isSidebarOpen, setIsSidebarOpen,
        showDiff, setShowDiff,
        darkMode, toggleDarkMode
    } = useLayoutState();

    // 3. App State (Search, Admin, Compare)
    const [{ selectedTeams }, updateUrl] = useUrlState();
    const [activeNode, setActiveNode] = useState(null);
    const [searchTargetId, setSearchTargetId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [compareTeams, setCompareTeams] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // [v6.11.26] Global Keyboard Handler (Esc to Close Modals) & Theme
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowDiff(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Initial Theme Setup
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setShowDiff]);

    // 4. Recent Items Logic
    const [recentItems, setRecentItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentItems') || '[]');
        } catch { return []; }
    });

    // Toast Logic
    const [toasts, setToasts] = useState([]);
    const toastTimersRef = useRef({});

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (toastTimersRef.current[id]) {
            clearTimeout(toastTimersRef.current[id]);
            delete toastTimersRef.current[id];
        }
    }, []);

    const showToast = useCallback((msg, type = 'info') => {
        // [v6.11.29] 사용자 요청: Toast에서 page, button, tab 등 시스템 용어 제거
        const filteredMsg = msg
            .replace(/\b(page|button|tab|dropdown)\b/gi, '')
            .replace(/\(\s*\)/g, '')
            .trim();

        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => {
            if (prev.some(t => t.msg === filteredMsg)) return prev;
            return [...prev, { id, msg: filteredMsg, type }];
        });

        const timer = setTimeout(() => {
            dismissToast(id);
        }, 2500);

        toastTimersRef.current[id] = timer;
    }, [dismissToast]);

    useEffect(() => {
        const timers = toastTimersRef.current;
        return () => {
            Object.values(timers).forEach(timer => clearTimeout(timer));
        };
    }, []);

    // Wrapped Favorites Logic with Toasts
    const handleToggleStarTeam = useCallback((team) => {
        const teamId = typeof team === 'string' ? team : team.id;
        const isStarred = starredTeams.some(t => (typeof t === 'string' ? t : t.id) === teamId);
        toggleStarTeam(team);
        showToast(isStarred ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.', 'info');
    }, [toggleStarTeam, starredTeams, showToast]);

    const handleToggleStarMenu = useCallback((menu) => {
        const isStarred = starredMenus.some(m => {
            const targetPath = typeof menu === 'string' ? menu : (menu.fullPath || menu.path);
            const targetId = typeof menu === 'string' ? null : menu.id;
            if (typeof m === 'string') return m === targetPath;
            if (targetId && m.id === targetId) return true;
            return m.fullPath === targetPath;
        });
        toggleStarMenu(menu);
        showToast(isStarred ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.', 'info');
    }, [toggleStarMenu, starredMenus, showToast]);

    const addRecentItem = useCallback((result) => {
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
    }, [isAdmin]);

    const clearRecentItems = useCallback(() => {
        setRecentItems([]);
        localStorage.removeItem('recentItems');
        showToast('최근 검색 기록이 삭제되었습니다.', 'info');
    }, [showToast]);

    const searchResults = useMemo(() => {
        if (!data || !searchQuery || searchQuery.length < 2) return [];
        const term = searchQuery.toLowerCase();
        const results = [];

        (data.teams || []).forEach(t => {
            if (t.toLowerCase().includes(term)) {
                results.push({ type: 'team', name: t, id: t });
            }
        });

        const traverse = (nodes) => {
            nodes.forEach(node => {
                const nodeType = (node.type || '').toLowerCase().trim();
                if (node.name.toLowerCase().includes(term)) {
                    const viewItem = node.items?.find(i => i.type === 'view');
                    results.push({
                        type: nodeType, // [v12.6] 제멋대로 추측하거나 기본값을 주지 않고 노드 타입을 그대로 보존
                        name: node.name,
                        node,
                        id: viewItem?.id,
                        path: node.fullPath,
                        parentName: node.parentName
                    });
                }
                if (node.items) {
                    node.items.forEach(item => {
                        const itemType = (item.type || '').toLowerCase().trim();
                        if (item.name.toLowerCase().includes(term) && itemType !== 'view') {
                            results.push({
                                type: itemType,
                                name: item.name,
                                node,
                                path: item.path,
                                id: item.id,
                                parentName: item.parentName
                            });
                        }
                    });
                }
                if (node.children) traverse(node.children);
            });
        };
        traverse(data.menuStructure);


        return results.slice(0, 500);
    }, [searchQuery, data]);

    // [v8.8] 팀별 접근 불가 항목(메뉴/버튼) 분석 로직 추가
    const teamAccessAnalysis = useMemo(() => {
        if (!data || !data.teams || !data.permissionMap) return {};

        const totalItems = [];
        const leafNodes = [];

        const traverse = (nodes) => {
            nodes.forEach(node => {
                if (node.items) {
                    const buttons = node.items.filter(i => i.type !== 'view');
                    totalItems.push(...buttons);
                }
                if ((!node.children || node.children.length === 0) && (node.type === 'page' || node.type === 'tab')) {
                    leafNodes.push(node);
                }
                if (node.children) traverse(node.children);
            });
        };
        traverse(data.menuStructure);

        const analysis = {};
        data.teams.forEach(team => {
            const perms = data.permissionMap[team] || {};

            // 1. 접근 불가 버튼 카운트
            const deniedButtons = totalItems.filter(item => perms[item.id] !== true).length;

            // 2. 접근 불가 메뉴 카운트 (리프 노드 기준)
            const deniedMenus = leafNodes.filter(node => {
                // 해당 노드의 view 아이템 또는 버튼들 중 하나라도 권한이 있는지 확인
                return !node.items?.some(i => perms[i.id] === true);
            }).length;

            analysis[team] = {
                deniedButtons,
                deniedMenus,
                totalDenied: deniedButtons + deniedMenus
            };
        });

        return analysis;
    }, [data]);

    const findNodeById = useCallback((id, nodes = data?.menuStructure || []) => {
        if (!id || !nodes) return null;
        for (const node of nodes) {
            if (node.items?.some(item => item.id === id)) return node;
            if (node.children) {
                const found = findNodeById(id, node.children);
                if (found) return found;
            }
        }
        return null;
    }, [data?.menuStructure]);

    const findNodeByPath = useCallback((path, nodes = data?.menuStructure || []) => {
        if (!path || !nodes) return null;
        for (const node of nodes) {
            if (node.fullPath === path) return node;
            if (node.children) {
                const found = findNodeByPath(path, node.children);
                if (found) return found;
            }
        }
        return null;
    }, [data?.menuStructure]);

    const handleSelectResult = (result) => {
        if (!result) return;
        addRecentItem(result);

        if (result.type === 'team') {
            const isAlreadySelected = selectedTeams.includes(result.id);
            if (isAlreadySelected) {
                const temp = selectedTeams.filter(t => t !== result.id);
                updateUrl({ selectedTeams: temp });
                setTimeout(() => {
                    updateUrl({ selectedTeams: [...temp, result.id] });
                }, 50);
                showToast(`${result.name} 팀은 이미 선택되어 있습니다.`, 'info');
            } else {
                if (isCompareMode && selectedTeams.length >= 5) {
                    showToast('비교 모드에서는 최대 5개 팀까지만 선택할 수 있습니다.', 'warning');
                    return;
                }
                updateUrl({ selectedTeams: [...selectedTeams, result.id] });
                showToast(`${result.name} 팀을 선택했습니다.`, 'success');
            }
        } else {
            let targetNode = findNodeById(result.id) || findNodeByPath(result.fullPath || result.path);
            if (!targetNode && result.node && result.node.fullPath) {
                targetNode = result.node;
            }

            if (targetNode) {
                setActiveNode(null);
                setSearchTargetId(null);
                setTimeout(() => {
                    setActiveNode(targetNode);
                    if (result.type !== 'page') {
                        setSearchTargetId(result.id);
                    }
                }, 10);
                setSearchQuery('');
                setIsSearchFocused(false);
                showToast(`${result.name}로 이동합니다.`, 'info');
            } else {
                showToast('해당 메뉴를 찾을 수 없습니다.', 'error');
            }
        }
    };

    const handleNodeSelect = useCallback((node) => {
        setActiveNode(node);
        setSearchTargetId(null);
    }, []);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setIsSearchFocused(false);
        updateUrl({ selectedTeams: [] });
        setActiveNode(null);
        setSearchTargetId(null);
        setCompareTeams([]);
        setIsCompareMode(false);
        setShowDiff(false);
        setIsSidebarOpen(true);
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            showToast('초기 화면으로 이동하며 모든 필터를 초기화했습니다.', 'info');
        }, 300);
    }, [updateUrl, setShowDiff, showToast, setIsSidebarOpen]);

    const handleCompareChange = (action, team) => {
        if (action === 'mode') {
            setIsCompareMode(team);
            if (team && selectedTeams.length > 0) {
                setCompareTeams(selectedTeams.slice(0, 5));
            } else if (!team) {
                setCompareTeams([]);
            }
        } else if (action === 'toggle') {
            setCompareTeams(prev => {
                if (prev.includes(team)) return prev.filter(t => t !== team);
                if (prev.length >= 5) {
                    showToast('비교는 최대 5개 팀까지만 가능합니다.', 'warning');
                    return prev;
                }
                return [...prev, team];
            });
        }
    };

    const handleMarkdownExport = useCallback(() => {
        if (!data) return;
        const targetTeams = displayedTeams(selectedTeams, isCompareMode, compareTeams);
        const mdContent = generateMarkdown(data, targetTeams);

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = targetTeams.length === 1
            ? `${targetTeams[0]}_권한명세_${dateStr}.md`
            : `권한명세서_통합_${dateStr}.md`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('마크다운 문서가 생성되었습니다.', 'success');
    }, [data, selectedTeams, isCompareMode, compareTeams, showToast]);

    const displayedTeams = (sel, comp, compTeams) => {
        if (comp) return compTeams;
        return sel;
    };

    const [showHiddenMenu, setShowHiddenMenu] = useState(false);

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-bold animate-pulse">데이터를 불러오는 중입니다...</p>
        </div>
    );

    return (
        <div className={`flex flex-col h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300 font-sans relative`}>
            {isRefreshing && (
                <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl flex flex-col items-center gap-6 border border-gray-100 dark:border-slate-700 animate-in zoom-in duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">화면 초기화 중</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">최적의 검색 환경을 준비하고 있습니다.</p>
                        </div>
                    </div>
                </div>
            )}

            <HeaderControls
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onReset={handleReset}
                showDiff={showDiff}
                setShowDiff={setShowDiff}
                onTreeMapOpen={() => { }}
                allData={data}
                teams={data.teams}
                selectedTeams={selectedTeams}
                onTeamsChange={(teams) => updateUrl({ selectedTeams: teams })}
                isCompareMode={isCompareMode}
                onCompareChange={handleCompareChange}
                compareTeams={compareTeams}
                recentItems={isAdmin ? recentItems : []}
                onClearRecentItems={clearRecentItems}
                starredMenus={isAdmin ? starredMenus : []}
                onToggleStarMenu={handleToggleStarMenu}
                starredTeams={isAdmin ? starredTeams : []}
                onToggleStarTeam={handleToggleStarTeam}
                searchResults={searchResults}
                onSelectResult={handleSelectResult}
                showToast={showToast}
                handleJsonExport={handleJsonExport}
                handlePdfExport={() => window.print()}
                handleMarkdownExport={handleMarkdownExport}
                showHiddenMenu={showHiddenMenu}
                setShowHiddenMenu={setShowHiddenMenu}
                teamAccessAnalysis={teamAccessAnalysis}
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="print:hidden h-full">
                    <Sidebar
                        menuStructure={data?.menuStructure || []}
                        permissions={data?.permissionMap || {}}
                        selectedTeams={displayedTeams(selectedTeams, isCompareMode, compareTeams)}
                        onSelect={handleNodeSelect}
                        activeNode={activeNode}
                        isAdmin={isAdmin}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        starredTeams={starredTeams}
                        onToggleStar={handleToggleStarTeam}
                        starredMenus={starredMenus}
                        onToggleStarMenu={handleToggleStarMenu}
                        searchTerm={searchQuery}
                        isCompareMode={isCompareMode}
                        isRefreshing={isRefreshing}
                    />
                </div>
                <div className="flex-1 h-full overflow-hidden flex flex-col">
                    <MainContent
                        activeNode={activeNode}
                        selectedTeams={displayedTeams(selectedTeams, isCompareMode, compareTeams)}
                        allData={data}
                        starredMenus={starredMenus}
                        onToggleStarMenu={handleToggleStarMenu}
                        isCompareMode={isCompareMode}
                        searchTargetId={searchTargetId}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            <ExcelDiffModal isOpen={showDiff} onClose={() => setShowDiff(false)} />
            <HiddenMenuModal
                isOpen={showHiddenMenu}
                onClose={() => setShowHiddenMenu(false)}
                teams={data?.teams || []}
            />

            {/* [v6.11.30] Toast 위치 조정: 전체 팀 보기 드롭다운 영역 아래 (top-40 -> top-[90px]) */}
            <div className="fixed top-[90px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 print:hidden items-center w-full pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-top-full duration-300 pointer-events-auto",
                            toast.type === 'success' ? "bg-white border-green-500 text-green-700 dark:bg-green-900/90 dark:text-green-100" :
                                toast.type === 'error' ? "bg-white border-red-500 text-red-700 dark:bg-red-900/90 dark:text-red-100" :
                                    toast.type === 'warning' ? "bg-white border-amber-500 text-amber-700 dark:bg-amber-900/90 dark:text-amber-100" :
                                        "bg-white border-blue-500 text-blue-700 dark:bg-blue-900/90 dark:text-blue-100"
                        )}
                    >
                        <span className="font-extrabold text-sm tracking-tight">{toast.msg}</span>
                        <button onClick={() => dismissToast(toast.id)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
