import React from 'react';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Star from 'lucide-react/dist/esm/icons/star';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { cn } from '../utils/cn';
import { getDesignByType } from '../utils/designSystem'; // Reusing the unified design system

export const SearchResultList = ({
    searchResults = [],
    recentItems = [],
    starredMenus = [],
    starredTeams = [],
    searchQuery,
    searchTab,
    setSearchTab,
    onSelectResult,
    onClearRecentItems,
    onToggleStarMenu, // Optional: if we want inline star toggle in search results
    onToggleStarTeam,
    activeIndex,
    isAdmin // To determine if we show history/favorites
}) => {

    // Helper to render a single item.
    // logic is pure: Data -> Design Token -> JSX
    const renderItem = (item, isActive = false, isRecent = false, isFavorite = false, dataIndex = null) => {
        if (!item) return null;

        // [Simple Logic] Trust the data.
        const path = item.fullPath || item.path || '';
        let name = (item.name || '').replace(/\[(버튼|드롭다운|Button|Dropdown)\]/g, '').trim();
        if (!name) name = item.name;
        const type = item.type || 'page';

        const design = getDesignByType(type);

        const isStarred = item.type === 'team'
            ? starredTeams.some(t => (typeof t === 'string' ? t : t.id) === item.id)
            : starredMenus.some(m => {
                const mPath = typeof m === 'string' ? m : (m.fullPath || m.path);
                return mPath === path;
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
                onClick={() => onSelectResult(item)}
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
                        {item.type === 'team' && !isRecent && !isFavorite && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 rounded font-bold tracking-tighter">TEAM</span>}
                    </div>
                    {/* Path Display */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate font-medium">
                        {item.type !== 'team' && path && path.split(' > ').map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
                                <span className={idx === arr.length - 1 ? "text-gray-600 dark:text-gray-400" : ""}>{part}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Star Button for Admins (Only when not in recent/favorite context or if requested) */}
                {isAdmin && !isRecent && !isFavorite && (
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
                    >
                        <Star size={16} fill={isStarred ? "currentColor" : "none"} strokeWidth={isStarred ? 0 : 2} />
                    </button>
                )}
            </div>
        );
    };

    // Filter Logic for tabs
    const filteredResults = searchResults.filter(result => {
        if (searchTab === 'all') return true;
        if (searchTab === 'menu') return ['gnb', 'lnb', 'tab', 'page', 'view'].includes(result.type);
        if (searchTab === 'button') return result.type === 'button' || result.type === 'dropdown';
        if (searchTab === 'team') return result.type === 'team';
        return true;
    });

    // Content Rendering
    if (!searchQuery) {
        // [History Mode]
        if (!isAdmin) {
            return <div className="py-12 text-center text-gray-400 font-medium">로그인하면 최근 방문 기록과 즐겨찾기가 제공됩니다.</div>;
        }

        const recentTeams = recentItems.filter(i => i.type === 'team');
        const recentMenus = recentItems.filter(i => i.type !== 'team');
        // Note: original code filtered specific types, but cleaner to just say !team? 
        // Or strictly follow original: gnb, lnb, tab, page, view, button, dropdown. 
        // Let's stick to original grouping if needed, but linear list is fine too.
        // Actually original code rendered them in groups? 
        // No, original code rendered recentTeams, then recentMenus, then recentFeatures.
        // Let's consolidate for simplicity or keep structure?
        // User asked for "Structual Improvement". Consolidating lists is better.
        // But let's respect "Teams" vs "Menus".

        return (
            <div className="p-2 space-y-4">
                {recentItems.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-700/50 mb-2 bg-slate-50 dark:bg-slate-800/80 rounded-t-xl mx-1">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-blue-500" /> 최근 방문 항목 ({recentItems.length}/20)
                            </div>
                            <button onClick={onClearRecentItems} className="text-gray-400 hover:text-red-500 text-xs font-bold transition-all flex items-center gap-1">
                                <Trash2 size={12} /> 전체 삭제
                            </button>
                        </div>
                        <div className="px-2 space-y-1">
                            {/* Render all recent items in order */}
                            {recentItems.map((item, i) => <div key={`rec-${i}`}>{renderItem(item, false, true)}</div>)}
                        </div>
                    </div>
                )}

                {(starredMenus.length > 0 || starredTeams.length > 0) && (
                    <div className="mt-4">
                        <div className="flex items-center px-3 py-2 border-b border-amber-100 bg-amber-50 dark:bg-amber-900/20 rounded-t-xl mx-1 mb-2">
                            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <Star size={12} className="fill-amber-500 text-amber-500" /> 즐겨찾는 항목 ({starredMenus.length + starredTeams.length}/50)
                            </div>
                        </div>
                        <div className="px-2 space-y-1">
                            {starredTeams.map((item, i) => <div key={`fav-team-${i}`}>{renderItem(item, false, false, true)}</div>)}
                            {starredMenus.map((item, i) => <div key={`fav-menu-${i}`}>{renderItem(item, false, false, true)}</div>)}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // [Search Result Mode]
    return (
        <div className="whitespace-normal"> {/* Ensure width flow */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                {['all', 'menu', 'button', 'team'].map(tab => (
                    <button key={tab} onClick={() => setSearchTab(tab)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", searchTab === tab ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-gray-200 dark:border-slate-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700")}>
                        {tab === 'all' ? '전체' : tab === 'menu' ? '메뉴' : tab === 'button' ? '기능' : '팀'}
                    </button>
                ))}
            </div>

            <div className="p-2">
                {filteredResults.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 font-medium">검색 결과가 없습니다.</div>
                ) : (
                    <div className="space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">검색 결과 ({filteredResults.length})</div>
                        {filteredResults.map((result, i) => (
                            <div key={`search-res-${i}`} data-index={i}>
                                {renderItem(result, i === activeIndex)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
