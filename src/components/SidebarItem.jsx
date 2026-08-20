import React, { memo } from 'react';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Folder from 'lucide-react/dist/esm/icons/folder';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Layout from 'lucide-react/dist/esm/icons/layout';
import Star from 'lucide-react/dist/esm/icons/star';
import { cn } from '../utils/cn';

export const SidebarItem = memo(({
    node,
    depth,
    isExpanded,
    isActive,
    searchTerm,
    permissions,
    selectedTeams,
    isCompareMode,
    isFavorite,
    onToggle,
    onSelect,
    onToggleFavorite,
    children // For recursive rendering
}) => {
    const isFolder = node.children && node.children.length > 0;

    // 권한 확인 로직 (props로 받을 수도 있지만, 여기서 계산하거나 부모에서 계산해서 넘겨줄 수 있음. 
    // 성능을 위해 부모에서 계산된 accessible을 받는게 좋지만, 재귀 구조상 함수를 받는게 나을수도 있음.
    // 여기서는 로직 일관성을 위해 부모 helper를 사용한다고 가정하지 않고, 자체적으로직을 수행하거나 props로 받음.
    // 기존 로직을 최대한 보존.
    const hasAccess = (() => {
        if (selectedTeams.length === 0) return true;

        const checkAccess = (n) => {
            const nodeItems = n.items || [];
            const itemAccess = nodeItems.some(item =>
                selectedTeams.some(team => permissions[team] && permissions[team][item.id] === true)
            );
            if (itemAccess) return true;
            const children = n.children || [];
            return children.some(child => checkAccess(child));
        };
        return checkAccess(node);
    })();

    // 검색어 하이라이팅 헬퍼
    const renderHighlight = (text) => {
        if (!searchTerm || searchTerm.length < 2) return text;
        const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchTerm.toLowerCase() ?
                <span key={i} className="bg-yellow-200 dark:bg-yellow-900 text-black dark:text-white px-0.5 rounded">{part}</span>
                : part
        );
    };

    return (
        <div className="select-none relative group" data-path={node.fullPath}>
            <div
                className={cn(
                    "flex items-center gap-2 px-3 py-2 pr-10 cursor-pointer transition-all text-sm",
                    isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold"
                        : "hover:bg-gray-100 dark:hover:bg-slate-800",
                    !hasAccess
                        ? "text-gray-400 dark:text-slate-600 line-through decoration-gray-500 dark:decoration-slate-500 decoration-2"
                        : !isActive && "text-gray-900 dark:text-gray-100 font-bold",
                    depth === 0 && "font-black text-base"
                )}
                style={{
                    paddingLeft: `${depth * 12 + 12}px`,
                    fontWeight: 'bold',
                    WebkitTextStroke: isActive || hasAccess ? '0.4px currentColor' : '0px',
                    color: isActive || hasAccess ? '#000' : undefined
                }}
                onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    onSelect(node);
                    if (isFolder && !isExpanded) onToggle(node.fullPath);
                }}
            >
                {/* Expand/Collapse Icon */}
                <span
                    className="flex-shrink-0 text-gray-400 dark:text-gray-500 w-4 h-4 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isFolder) onToggle(node.fullPath);
                    }}
                >
                    {isFolder ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                </span>


                {/* Node Name */}
                <span className="truncate flex-1 font-medium flex items-center gap-2">
                    <span className="truncate">{renderHighlight(node.name)}</span>
                    {node.type === 'tab' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800 shrink-0">
                            TAB
                        </span>
                    )}
                </span>

                {/* Comparison Indicators */}
                {isCompareMode && selectedTeams.length > 1 && (
                    <div className="flex gap-1 ml-2 shrink-0 items-center">
                        {selectedTeams.map((team, idx) => {
                            // 팀별 접근 권한 확인 (재귀)
                            const checkTeamAccess = (n) => {
                                const nodeItems = n.items || [];
                                if (nodeItems.some(item => permissions[team]?.[item.id] === true)) return true;
                                return (n.children || []).some(child => checkTeamAccess(child));
                            };
                            const active = checkTeamAccess(node);

                            return (
                                <div
                                    key={team}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all border shrink-0",
                                        active
                                            ? (idx === 0 ? "bg-blue-500 border-blue-400" :
                                                idx === 1 ? "bg-orange-500 border-orange-400" :
                                                    idx === 2 ? "bg-green-500 border-green-400" :
                                                        idx === 3 ? "bg-purple-500 border-purple-400" :
                                                            "bg-pink-500 border-pink-400")
                                            : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                    )}
                                    title={`T${idx + 1} (${team}): ${active ? '권한 있음' : '권한 없음'}`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* [한국어 설명] 즐겨찾기 버튼: 항상 노출(opacity-100)되고 더 선명한 디자인으로 변경 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(node);
                }}
                className={cn(
                    "p-1.5 absolute right-2 top-1/2 -translate-y-1/2 rounded-lg transition-all duration-200 shadow-sm border",
                    isFavorite
                        ? "bg-yellow-400 text-white border-yellow-500 opacity-100 scale-110"
                        : "bg-white dark:bg-slate-800 text-gray-300 border-gray-100 dark:border-slate-700 opacity-100 hover:text-yellow-400 hover:border-yellow-200"
                )}
                title="즐겨찾기 추가/해제"
            >
                <Star size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
            </button>

            {/* Recursive Children Rendering */}
            {isFolder && isExpanded && (
                <div className="border-l border-gray-100 dark:border-slate-800 ml-4">
                    {children}
                </div>
            )}
        </div>
    );
});

SidebarItem.displayName = 'SidebarItem';
