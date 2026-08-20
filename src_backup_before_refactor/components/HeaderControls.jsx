import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Search, Grid, RotateCcw, Clock, X, ChevronRight, Trash2, Star } from 'lucide-react';
import { cn } from '../utils/cn';
import { AccountManager } from './AccountManager';
import { MultiSelect } from './MultiSelect';
import { getDesignByType } from '../utils/designSystem';

// Tooltip Component
const Tooltip = ({ children, content, side = 'bottom' }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={cn(
                    "absolute z-[100] px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none",
                    side === 'bottom' && "top-full mt-2 left-1/2 -translate-x-1/2",
                    side === 'top' && "bottom-full mb-2 left-1/2 -translate-x-1/2",
                    side === 'right' && "left-full ml-2 top-1/2 -translate-y-1/2",
                    side === 'left' && "right-full mr-2 top-1/2 -translate-y-1/2"
                )}>
                    {content}
                    <div className={cn(
                        "absolute w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45 -z-10",
                        side === 'bottom' && "-top-1 left-1/2 -translate-x-1/2",
                        side === 'top' && "-bottom-1 left-1/2 -translate-x-1/2",
                        side === 'right' && "-left-1 top-1/2 -translate-y-1/2",
                        side === 'left' && "-right-1 top-1/2 -translate-y-1/2"
                    )} />
                </div>
            )}
        </div>
    );
};

export const HeaderControls = ({
    isAdmin,
    setIsAdmin,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchQuery,
    handleJsonExport,
    handlePdfExport,
    handleMarkdownExport,
    darkMode,
    toggleDarkMode,
    onReset,
    showDiff,
    setShowDiff,
    showHiddenMenu,
    setShowHiddenMenu,
    showDashboard,
    setShowDashboard,
    onTreeMapOpen,
    allData,
    teams,
    selectedTeams,
    onTeamsChange,
    isCompareMode,
    onCompareChange,
    compareTeams,
    searchResults = [],
    onSelectResult,
    recentItems = [],
    onClearRecentItems,
    starredMenus = [],
    onToggleStarMenu,
    starredTeams = [],
    onToggleStarTeam,
    showToast,
    teamAccessAnalysis
}) => {
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);
    const scrollRef = useRef(null);
    const searchContainerRef = useRef(null);
    const [searchWidth, setSearchWidth] = useState(600);
    const [isResizingSearch, setIsResizingSearch] = useState(false);
    const [searchTab, setSearchTab] = useState('all');
    const [activeIndex, setActiveIndex] = useState(0);

    const recentTeams = recentItems.filter(i => i.type === 'team');
    const recentMenus = recentItems.filter(i => i.type === 'gnb' || i.type === 'lnb' || i.type === 'tab' || i.type === 'page' || i.type === 'view');
    const recentFeatures = recentItems.filter(i => i.type === 'button' || i.type === 'dropdown');

    const startResizingSearch = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizingSearch(true);
    }, []);

    const stopResizingSearch = useCallback(() => {
        setIsResizingSearch(false);
    }, []);

    const resizeSearch = useCallback((e) => {
        if (!isResizingSearch || !searchContainerRef.current) return;
        const rect = searchContainerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        if (newWidth >= 300 && newWidth <= 1200) {
            setSearchWidth(newWidth);
        }
    }, [isResizingSearch]);

    useEffect(() => {
        if (isResizingSearch) {
            document.addEventListener('mousemove', resizeSearch);
            document.addEventListener('mouseup', stopResizingSearch);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', resizeSearch);
            document.removeEventListener('mouseup', stopResizingSearch);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', resizeSearch);
            document.removeEventListener('mouseup', stopResizingSearch);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingSearch, resizeSearch, stopResizingSearch]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (resultsRef.current && !resultsRef.current.contains(e.target) && !searchInputRef.current.contains(e.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsSearchFocused]);

    const filteredResults = searchResults.filter(result => {
        if (searchTab === 'all') return true;
        if (searchTab === 'menu') return ['gnb', 'lnb', 'tab', 'page', 'view'].includes(result.type);
        if (searchTab === 'button') return result.type === 'button' || result.type === 'dropdown';
        if (searchTab === 'team') return result.type === 'team';
        return true;
    });

    useEffect(() => { setActiveIndex(0); }, [searchQuery, searchTab]);

    useEffect(() => {
        if (isSearchFocused && searchQuery && scrollRef.current) {
            const activeItem = scrollRef.current.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [activeIndex, isSearchFocused, searchQuery]);

    const handleKeyDown = (e) => {
        if (!isSearchFocused && e.key !== 'Escape') return;
        if (e.key === 'Escape') {
            setIsSearchFocused(false);
            if (searchInputRef.current) searchInputRef.current.blur();
            return;
        }
        if (!searchQuery) return;
        const max = filteredResults.length - 1;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < max ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex <= max) {
                const item = filteredResults[activeIndex];
                onSelectResult(item);
                if (item.type !== 'team') {
                    setIsSearchFocused(false);
                    if (searchInputRef.current) searchInputRef.current.blur();
                }
            }
        }
    };


    // [v12.8] 통합 아이템 렌더링 함수 - 컴팩트 사이즈 복구 및 타입 로직 유지
    const renderResultItem = (item, isActive = false, isRecent = false, isFavorite = false, dataIndex = null) => {
        if (!item) return null;

        // [Simple Logic] Trust the data. No inference.
        const path = item.fullPath || item.path || '';
        let name = (item.name || '').replace(/\[(버튼|드롭다운|Button|Dropdown)\]/g, '').trim();
        if (!name) name = item.name; // Fallback if cleanup results in empty string
        const type = item.type || 'page';

        const design = getDesignByType(type);

        const isStarred = item.type === 'team'
            ? starredTeams.some(t => (typeof t === 'string' ? t : t.id) === item.id)
            : starredMenus.some(m => {
                const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                return mPath === path;
            });

        const accessCount = item.type !== 'team' && item.id && allData ?
            allData.teams.filter(t => allData.permissionMap[t]?.[item.id]).length : null;

        return (
            <div
                data-index={dataIndex}
                className={cn(
                    "group flex items-center gap-2 p-1 pr-3 rounded-xl transition-all cursor-pointer relative",
                    isActive
                        ? "bg-blue-100 dark:bg-blue-900/60 ring-1 ring-blue-500/20 shadow-sm"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    isRecent && "bg-gray-50/50 dark:bg-slate-800/30",
                    (type === 'button' || type === 'dropdown') && "active:scale-95 transition-transform"
                )}
                onClick={() => {
                    onSelectResult(item);
                    if (item.type !== 'team') setIsSearchFocused(false);
                }}
            >
                {/* Simplified Icon Implementation: 100% Consistent with Design System */}
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center shrink-0 border",
                    design.className // Apply unified design token directly
                )}>
                    {design.icon(20, 2)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                            "text-base font-extrabold truncate flex-1 min-w-0",
                            (type === 'button' || type === 'dropdown') ? "text-sky-800 dark:text-sky-200" : "text-gray-800 dark:text-gray-100"
                        )}>
                            {name}
                        </span>
                        {item.parentName && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800 font-black shadow-sm shrink-0">
                                {item.parentName}
                            </span>
                        )}
                        {/* [BTN] 라벨 삭제 유지 */}
                        {item.type === 'team' && !isRecent && !isFavorite && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded font-bold tracking-tighter">TEAM</span>}
                        {accessCount !== null && !isRecent && !isFavorite && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-bold tracking-tighter whitespace-nowrap">
                                {accessCount}개 팀
                            </span>
                        )}
                    </div>
                    {/* 경로 표시 복구 */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate font-medium">
                        {item.type !== 'team' && path && path.split(' > ').map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                                <span className={idx === arr.length - 1 ? "text-gray-600 dark:text-gray-400" : ""}>{part}</span>
                                {idx < arr.length - 1 && <ChevronRight size={10} className="shrink-0" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {isAdmin && !isRecent && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'team') onToggleStarTeam?.(item);
                            else onToggleStarMenu?.(item);
                        }}
                        className={cn(
                            "p-1.5 rounded-lg transition-all z-10 border shadow-sm",
                            isStarred
                                ? "bg-yellow-400 text-white border-yellow-500 opacity-100 scale-110"
                                : "bg-white dark:bg-slate-700 text-gray-300 border-gray-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 hover:text-yellow-400 hover:border-yellow-300"
                        )}
                        title="즐겨찾기 추가/제거"
                    >
                        <Star size={16} fill={isStarred ? "currentColor" : "none"} strokeWidth={isStarred ? 0 : 2} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <header className="print:hidden min-h-16 h-auto py-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between px-6 shadow-sm z-[500] relative gap-4">
            <Tooltip content="초기화 및 홈으로 이동">
                <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={onReset}>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg">
                        <Grid size={20} />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100 tracking-tight leading-none">Wink Admin Map</h1>
                    </div>
                </div>
            </Tooltip>

            <div className="flex-1 flex items-center gap-3 mx-4 min-w-0">
                <div ref={searchContainerRef} className="relative min-w-[200px] max-w-[1200px]" style={{ width: searchWidth }}>
                    <div className={cn("relative transition-all duration-300 group rounded-xl border", isSearchFocused ? 'bg-white dark:bg-slate-800 border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700')}>
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", isSearchFocused ? 'text-blue-500' : 'text-gray-400')} size={18} />
                        <input ref={searchInputRef} onKeyDown={handleKeyDown} type="text" placeholder="메뉴, 기능, 팀 검색 (Ctrl+K)" className="w-full pl-10 pr-12 py-2.5 bg-transparent text-sm focus:outline-none dark:text-gray-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); searchInputRef.current.focus(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                <X size={14} />
                            </button>
                        )}
                        <div className={cn("absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize transition-all rounded-r-xl", isResizingSearch ? "bg-blue-500 opacity-100" : "bg-transparent hover:bg-blue-400/50")} onMouseDownCapture={startResizingSearch} title="드래그하여 검색창 크기 조절" />
                    </div>

                    {isSearchFocused && (
                        <div ref={resultsRef} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[510]">
                            {searchQuery && (
                                <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                                    {['all', 'menu', 'button', 'team'].map(tab => (
                                        <button key={tab} onClick={() => setSearchTab(tab)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", searchTab === tab ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-gray-200 dark:border-slate-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700")}>
                                            {tab === 'all' ? '전체' : tab === 'menu' ? '메뉴' : tab === 'button' ? '기능' : '팀'}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
                                {!searchQuery ? (
                                    <div className="p-2 space-y-4">
                                        {!isAdmin ? (
                                            <div className="py-12 text-center text-gray-400 font-medium">로그인하면 최근 방문 기록과 즐겨찾기가 제공됩니다.</div>
                                        ) : (
                                            <>
                                                {recentItems.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-700/50 mb-2 bg-slate-50 dark:bg-slate-800/80 rounded-t-xl mx-1">
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Clock size={12} className="text-blue-500" /> 최근 방문 항목 ({recentItems.length})
                                                            </div>
                                                            <button onClick={onClearRecentItems} className="text-gray-400 hover:text-red-500 text-xs font-bold transition-all flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
                                                        </div>
                                                        <div className="px-2 space-y-1">
                                                            {recentTeams.map((item, i) => <div key={`rec-team-${i}`}>{renderResultItem(item, false, true)}</div>)}
                                                            {recentMenus.map((item, i) => <div key={`rec-menu-${i}`}>{renderResultItem(item, false, true)}</div>)}
                                                            {recentFeatures.map((item, i) => <div key={`rec-feat-${i}`}>{renderResultItem(item, false, true)}</div>)}
                                                        </div>
                                                    </div>
                                                )}
                                                {(starredMenus.length > 0 || starredTeams.length > 0) && (
                                                    <div className="mt-4">
                                                        <div className="flex items-center px-3 py-2 border-b border-amber-100 bg-amber-50 dark:bg-amber-900/20 rounded-t-xl mx-1 mb-2">
                                                            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                                                <Star size={12} className="fill-amber-500 text-amber-500" /> 즐겨찾는 항목
                                                            </div>
                                                        </div>
                                                        <div className="px-2 space-y-1">
                                                            {starredTeams.map((item, i) => <div key={`fav-team-${i}`}>{renderResultItem(item, false, false, true)}</div>)}
                                                            {starredMenus.map((item, i) => <div key={`fav-menu-${i}`}>{renderResultItem(item, false, false, true)}</div>)}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {filteredResults.length === 0 ? (
                                            <div className="py-12 text-center text-gray-400 font-medium">검색 결과가 없습니다.</div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">검색 결과 ({filteredResults.length})</div>
                                                {filteredResults.map((result, i) => (
                                                    <div key={`search-res-${i}`} data-index={i}>
                                                        {renderResultItem(result, i === activeIndex)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Tooltip content="권한을 비교할 팀을 선택하세요">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-64 sm:w-80">
                            <MultiSelect options={teams || []} selected={selectedTeams} onChange={onTeamsChange} placeholder={isCompareMode ? "비교할 팀을 선택하세요" : "전체 팀 보기"} isCompareMode={isCompareMode} compareTeams={compareTeams} onCompareChange={onCompareChange} teamAccessAnalysis={teamAccessAnalysis} />
                        </div>
                        <button onClick={() => onCompareChange('mode', !isCompareMode)} className={cn("px-4 h-[44px] rounded-xl border transition-all flex items-center justify-center whitespace-nowrap text-sm font-bold", isCompareMode ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-purple-400 hover:text-purple-600")}>비교모드</button>
                    </div>
                </Tooltip>

                <Tooltip content="모든 필터 초기화">
                    <button onClick={onReset} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 border border-transparent hover:border-red-100">
                        <RotateCcw size={20} />
                    </button>
                </Tooltip>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                <AccountManager isAdmin={isAdmin} onLoginChange={setIsAdmin} onHistorySelect={term => { setSearchQuery(term); setIsSearchFocused(true); }} onJsonExport={handleJsonExport} onPdfExport={handlePdfExport} onMarkdownExport={handleMarkdownExport} showDiff={showDiff} setShowDiff={setShowDiff} showHiddenMenu={showHiddenMenu} setShowHiddenMenu={setShowHiddenMenu} showToast={showToast} darkMode={darkMode} setDarkMode={toggleDarkMode} />
            </div>
        </header>
    );
};
