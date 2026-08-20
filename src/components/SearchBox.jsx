import React, { useRef, useState, useEffect, useCallback } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Clock from 'lucide-react/dist/esm/icons/clock';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Star from 'lucide-react/dist/esm/icons/star';
import { cn } from '../utils/cn';
import { getDesignByType } from '../utils/designSystem';
import { usePermission } from '../contexts/PermissionContext';
import { useBookmark } from '../contexts/BookmarkContext';
import { useToast } from '../contexts/ToastContext';

export const SearchBox = () => {
    const {

        searchQuery, setSearchQuery,
        isSearchFocused, setIsSearchFocused,
        searchResults,
        isAdmin,
        selectedTeams, updateUrl,
        isCompareMode,
        findNodeById, findNodeByPath,
        setActiveNode, setSearchTargetId
    } = usePermission();

    const {
        recentItems, addRecentItem, clearRecentItems,
        starredMenus, handleToggleStarMenu,
        starredTeams, handleToggleStarTeam
    } = useBookmark();

    const { showToast } = useToast();

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

    const handleSelectResult = (result) => {
        if (!result) return;
        addRecentItem(result, isAdmin);

        if (result.type === 'team') {
            const isAlreadySelected = selectedTeams.includes(result.id || result.name);
            if (isAlreadySelected) {
                // If it is already selected, wait, let's keep it robust. The original logic unselected and reselected. Simply warn.
                showToast(`${result.name} 팀은 이미 선택되어 있습니다.`, 'info');
            } else {
                if (isCompareMode && selectedTeams.length >= 5) {
                    showToast('비교 모드에서는 최대 5개 팀까지만 선택할 수 있습니다.', 'warning');
                    return;
                }
                const teamId = result.id || result.name;
                updateUrl({ selectedTeams: [...selectedTeams, teamId] });
                showToast(`${result.name} 팀을 선택했습니다.`, 'success');
            }
            setIsSearchFocused(false);
            if (searchInputRef.current) searchInputRef.current.blur();
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
                handleSelectResult(item);
            }
        }
    };

    const renderResultItem = (item, isActive = false, isRecent = false, isFavorite = false, dataIndex = null) => {
        if (!item) return null;

        const path = item.fullPath || item.path || '';
        let name = (item.name || '').replace(/\[(버튼|드롭다운|Button|Dropdown)\]/g, '').trim();
        if (!name) name = item.name;
        const type = item.type || 'page';

        const design = getDesignByType(type);

        const isStarred = item.type === 'team'
            ? starredTeams.some(t => (typeof t === 'string' ? t : t.id) === (item.id || item.name))
            : starredMenus.some(m => {
                const targetPath = item.fullPath || item.path;
                const targetId = item.id;

                const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                const mId = typeof m === 'string' ? null : m.id;

                if (targetId && mId) return targetId === mId;
                return mPath === targetPath;
            });



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
                onClick={() => handleSelectResult(item)}
            >
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center shrink-0 border",
                    design.className
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
                        {item.type === 'team' && !isRecent && !isFavorite && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded font-bold tracking-tighter">TEAM</span>}

                    </div>
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
                            if (item.type === 'team') handleToggleStarTeam(item);
                            else handleToggleStarMenu(item);
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
                                        {recentItems.length === 0 && starredMenus.length === 0 && starredTeams.length === 0 && (
                                            <div className="py-12 text-center text-gray-400 font-medium">
                                                최근 검색 기록이나 즐겨찾기가 없습니다.
                                            </div>
                                        )}
                                        {recentItems.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-700/50 mb-2 bg-slate-50 dark:bg-slate-800/80 rounded-t-xl mx-1">
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={12} className="text-blue-500" /> 최근 검색 이력 ({recentItems.length}/10)
                                                    </div>
                                                    <button onClick={clearRecentItems} className="text-gray-400 hover:text-red-500 text-xs font-bold transition-all flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
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
                                                        <Star size={12} className="fill-amber-500 text-amber-500" />
                                                        즐겨찾는 항목 ({starredTeams.length + starredMenus.length}/20)
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
                                                {renderResultItem(result, i === activeIndex, false, false, i)}
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
    );
};
