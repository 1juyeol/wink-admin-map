import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Star from 'lucide-react/dist/esm/icons/star';
import Folder from 'lucide-react/dist/esm/icons/folder';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import PanelLeftClose from 'lucide-react/dist/esm/icons/panel-left-close';
import PanelLeftOpen from 'lucide-react/dist/esm/icons/panel-left-open';
import FolderOpen from 'lucide-react/dist/esm/icons/folder-open';
import FolderClosed from 'lucide-react/dist/esm/icons/folder-closed';
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import Users from 'lucide-react/dist/esm/icons/users';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import Layers from 'lucide-react/dist/esm/icons/layers';
import PanelLeft from 'lucide-react/dist/esm/icons/panel-left';
import { cn } from '../utils/cn';
import { getDesignByType } from '../utils/designSystem';
import { usePermission } from '../contexts/PermissionContext';
import { useLayout } from '../contexts/LayoutContext';
import { useBookmark } from '../contexts/BookmarkContext';

const Tooltip = ({ children, content }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            {isVisible && (
                <div className="absolute z-[101] bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-bold text-white bg-slate-800 rounded shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-0.5" />
                </div>
            )}
        </div>
    );
};

export const Sidebar = React.memo(() => {
    const {
        data,
        selectedTeams,
        compareTeams,
        activeNode,
        setActiveNode,
        setSearchTargetId,
        searchQuery: searchTerm,
        isCompareMode,
        isRefreshing,
        isAdmin
    } = usePermission();

    const { isSidebarOpen: isOpen, setIsSidebarOpen } = useLayout();
    const { starredMenus, handleToggleStarMenu: onToggleStarMenu } = useBookmark();

    const menuStructure = data?.menuStructure || [];
    const permissions = data?.permissionMap || {};

    // Use the exact same logic for mapping displayed teams
    const displayedTeams = isCompareMode ? compareTeams : selectedTeams;

    const onSelect = useCallback((node) => {
        setActiveNode(node);
        setSearchTargetId(null);
    }, [setActiveNode, setSearchTargetId]);

    const onToggle = useCallback(() => setIsSidebarOpen(prev => !prev), [setIsSidebarOpen]);

    const [expandedNodes, setExpandedNodes] = useState(new Set());

    // [v6.11.23] 초기화 요청 시 모든 폴더 접기
    useEffect(() => {
        if (isRefreshing) {
            setExpandedNodes(new Set());
        }
    }, [isRefreshing]);

    const [sidebarWidth, setSidebarWidth] = useState(560); // [한국어 설명] 너비 560px 고정 (setter 추가)
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);

    const isFavorite = (node) => {
        const viewItem = node.items?.find(i => i.type === 'view');
        const nodeId = viewItem?.id;
        const nodePath = node.fullPath;

        return starredMenus.some(m => {
            if (typeof m === 'string') return m === nodePath;
            // [v6.11.12] ID가 존재하면 반드시 ID가 일치해야 함 (메뉴와 버튼 분리)
            if (nodeId && m.id) return m.id === nodeId;
            // ID가 없는 레거시 데이터는 경로로 비교하되, 한쪽에만 ID가 있는 경우는 매칭 제외
            return !m.id && !nodeId && m.fullPath === nodePath;
        });
    };

    const toggleFavorite = (e, node) => {
        e.stopPropagation();
        const viewItem = node.items?.find(i => i.type === 'view');
        // [v6.11.12] 사이드바에서의 즐겨찾기는 해당 페이지(view) 자체의 ID를 부여하여 버튼과 식별자를 분리
        const favNode = {
            ...node,
            id: viewItem?.id,
            type: 'page'
        };
        if (onToggleStarMenu) onToggleStarMenu(favNode);
    };

    const handleToggleAll = () => {
        const allPaths = new Set();
        const traverse = (nodes) => {
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    allPaths.add(node.fullPath);
                    traverse(node.children);
                }
            });
        };
        traverse(menuStructure);

        // [v6.11.27] 만약 일부라도 닫혀있다면 전체 펼치기, 모두 펼쳐져 있다면 전체 접기
        const isAllExpanded = allPaths.size > 0 && Array.from(allPaths).every(path => expandedNodes.has(path));

        if (isAllExpanded) {
            setExpandedNodes(new Set());
        } else {
            setExpandedNodes(allPaths);
        }
    };

    const toggleNode = (e, path) => {
        e.stopPropagation();
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) return;
        const pathsToExpand = new Set();
        const findMatchingPaths = (nodes, parentPath = []) => {
            nodes.forEach(node => {
                const currentPath = [...parentPath, node.fullPath];
                if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    currentPath.forEach(path => pathsToExpand.add(path));
                }
                if (node.children) findMatchingPaths(node.children, currentPath);
            });
        };
        findMatchingPaths(menuStructure);
        setExpandedNodes(pathsToExpand);
    }, [searchTerm, menuStructure]);

    useEffect(() => {
        if (!activeNode || !activeNode.fullPath) return;
        const pathParts = activeNode.fullPath.split(' > ');
        const parentPaths = [];
        for (let i = 0; i < pathParts.length; i++) {
            parentPaths.push(pathParts.slice(0, i + 1).join(' > '));
        }
        setExpandedNodes(prev => {
            const next = new Set(prev);
            parentPaths.forEach(p => next.add(p));
            return next;
        });
        const timer = setTimeout(() => {
            const activeElement = sidebarRef.current?.querySelector(`[data-path="${activeNode.fullPath}"]`);
            if (activeElement) activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return () => clearTimeout(timer);
    }, [activeNode]);

    const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            // [한국어 설명] 최소 200px, 최대 1200px까지 확장 가능하도록 조절
            if (newWidth >= 200 && newWidth <= 1200) setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const renderTree = (nodes, depth = 0) => {
        return nodes.map((node) => {
            const isFolder = node.children && node.children.length > 0;
            const isExpanded = expandedNodes.has(node.fullPath);
            const isActive = activeNode?.fullPath === node.fullPath;
            const favorite = isFavorite(node);

            const hasAccess = (() => {
                if (displayedTeams.length === 0) return true;
                const check = (n) => {
                    if (n.items?.some(i => displayedTeams.some(t => permissions[t]?.[i.id]))) return true;
                    return n.children?.some(check);
                };
                return check(node);
            })();

            const highlightSearch = (text) => {
                if (!searchTerm || searchTerm.length < 2) return text;
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'));
                return parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase()
                        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-900 text-gray-900 rounded-sm px-0.5">{part}</span>
                        : part
                );
            };

            const isGNB = node.type === 'gnb';
            const depthStyles = { paddingLeft: `${depth * 18 + 16}px` };

            const theme = isGNB ? { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', active: 'bg-blue-500', hover: 'hover:bg-blue-100' } : null;


            return (
                <div key={node.fullPath} className="flex flex-col">
                    <div
                        data-path={node.fullPath}
                        className={cn(
                            "group flex items-center py-3 px-4 mx-2 my-1.5 rounded-xl cursor-pointer transition-all relative overflow-hidden border border-transparent hover:scale-[1.01]",
                            isGNB ? "h-[64px] shadow-sm mb-4" : "py-2.5",
                            isActive
                                ? (isGNB ? `${theme.active} text-white shadow-lg shadow-blue-400/20` : "bg-blue-500 text-white shadow-lg shadow-blue-400/30 border-blue-300")
                                : (isGNB
                                    ? `${theme.bg} dark:bg-slate-800 text-gray-800 dark:text-gray-100 border-gray-100 dark:border-slate-700 ${theme.hover}`
                                    : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-black")
                        )}
                        style={depthStyles}
                        onClick={() => onSelect(node)}
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0 transition-all">
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white opacity-90 rounded-r-full" />}

                            {isGNB && !isActive && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent" />
                            )}

                            <div className="flex items-center gap-4 flex-1 min-w-0 pointer-events-none">
                                <span className={cn(
                                    "truncate flex-1 tracking-tight transition-all flex items-center gap-4",
                                    isGNB ? "text-[20px] font-black" : "text-[16px] font-black",
                                    hasAccess
                                        ? "text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                        : "text-gray-500 dark:text-slate-400"
                                )}>
                                    <span className={cn(
                                        "rounded-xl font-black border uppercase shrink-0 flex items-center justify-center transition-all bg-white dark:bg-slate-900 shadow-sm",
                                        isGNB ? "w-12 h-12" : "w-8 h-8",
                                        (() => {
                                            const design = getDesignByType(node.type);
                                            return cn(design.className, !hasAccess && "opacity-60 grayscale");
                                        })()
                                    )}>
                                        {(() => {
                                            const design = getDesignByType(node.type);
                                            const iconSize = isGNB ? 24 : 16;
                                            const strokeWidth = isGNB ? 2.5 : 2;
                                            return design.icon(iconSize, strokeWidth);
                                        })()}
                                    </span>

                                    <span className="truncate relative inline-block p-0.5">
                                        <span className={cn(!hasAccess && "opacity-70 group-hover:opacity-100 transition-opacity")}>
                                            {highlightSearch(node.name.replace(/\[(버튼|드롭다운|Button|Dropdown)\]/g, '').trim())}
                                        </span>
                                        {!hasAccess && (
                                            <span className={cn(
                                                "absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-red-600/60 z-0 pointer-events-none rounded-full",
                                                isGNB ? "h-[2px]" : "h-[1px]"
                                            )} />
                                        )}
                                    </span>
                                </span>

                                {isFolder && (
                                    <button
                                        onClick={(e) => toggleNode(e, node.fullPath)}
                                        className={cn("p-2 rounded-full transition-all duration-300 pointer-events-auto hover:bg-black/5 dark:hover:bg-white/5", isExpanded && "rotate-90")}
                                    >
                                        <ChevronRight size={20} className={isActive ? "text-white" : "text-gray-400"} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 ml-2 shrink-0 pointer-events-auto">
                                {isCompareMode && displayedTeams.length > 0 && (
                                    <div className="flex items-center p-1 bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-slate-700/50 gap-1.5 mr-2">
                                        {displayedTeams.map((team, idx) => {
                                            const teamHasAccess = (() => {
                                                const checkNode = (n) => {
                                                    if (n.items?.some(i => permissions[team]?.[i.id])) return true;
                                                    return n.children?.some(checkNode);
                                                };
                                                return checkNode(node);
                                            })();

                                            // [v7.0] Premium Modern Color Palette
                                            const teamColors = [
                                                { active: "from-blue-500 to-blue-600", border: "border-blue-400", shadow: "shadow-blue-500/20" },
                                                { active: "from-orange-500 to-orange-600", border: "border-orange-400", shadow: "shadow-orange-500/20" },
                                                { active: "from-emerald-500 to-emerald-600", border: "border-emerald-400", shadow: "shadow-emerald-500/20" },
                                                { active: "from-violet-500 to-violet-600", border: "border-violet-400", shadow: "shadow-violet-500/20" },
                                                { active: "from-rose-500 to-rose-600", border: "border-rose-400", shadow: "shadow-rose-500/20" }
                                            ];

                                            const color = teamColors[idx] || teamColors[0];

                                            return (
                                                <div
                                                    key={team}
                                                    className={cn(
                                                        "w-1.5 h-6 rounded-full transition-all duration-500 relative group/pip",
                                                        teamHasAccess
                                                            ? `bg-gradient-to-b ${color.active} shadow-lg ${color.shadow} scale-y-110`
                                                            : "bg-gray-200 dark:bg-slate-700/50 scale-y-75 opacity-30"
                                                    )}
                                                >
                                                    {/* Glow effect on hover or if active */}
                                                    {teamHasAccess && (
                                                        <div className={cn("absolute inset-0 rounded-full blur-[4px] opacity-0 group-hover/pip:opacity-100 transition-opacity bg-gradient-to-b", color.active)} />
                                                    )}

                                                    {/* Tooltip-like Mini indicator for T1-T5 */}
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/pip:opacity-100 transition-all pointer-events-none px-1.5 py-0.5 bg-slate-800 text-[8px] text-white rounded font-black whitespace-nowrap z-50">
                                                        T{idx + 1}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {isAdmin && (
                                    <button
                                        onClick={(e) => toggleFavorite(e, node)}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all border shadow-sm",
                                            favorite
                                                ? "bg-yellow-400 text-white border-yellow-500 scale-110 shadow-yellow-500/20"
                                                : (isActive
                                                    ? "bg-white/20 text-white border-white/30 hover:bg-white/40"
                                                    : "bg-white dark:bg-slate-800 text-gray-300 border-gray-200 dark:border-slate-700 hover:text-yellow-400 hover:border-yellow-300")
                                        )}
                                    >
                                        <Star size={20} fill={favorite ? "currentColor" : "none"} strokeWidth={favorite ? 0 : 2.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isFolder && isExpanded && (
                        <div className={cn(
                            "border-l-2 ml-[44px] mb-4 transition-all duration-300 border-gray-100 dark:border-slate-800"
                        )}>
                            {renderTree(node.children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div
            ref={sidebarRef}
            className={cn(
                "h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col relative",
                isResizing ? "transition-none select-none" : "transition-all duration-300"
            )}
            style={{ width: isOpen ? sidebarWidth : 48 }}
        >
            <div className={cn("p-4 border-b border-gray-200 dark:border-slate-800 font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 z-10", isOpen ? "justify-between" : "justify-center p-2")}>
                {isOpen && <span className="truncate text-lg tracking-tight">메뉴 탐색기</span>}
                {isOpen && (
                    <button onClick={handleToggleAll} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors border border-transparent hover:border-gray-200">
                        {expandedNodes.size > 0 ? <FolderClosed size={22} className="text-blue-600" /> : <FolderOpen size={22} className="text-blue-600" />}
                    </button>
                )}
                <button onClick={onToggle} className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                    {isOpen ? <PanelLeftClose size={24} strokeWidth={2.5} /> : <PanelLeftOpen size={26} strokeWidth={2.5} />}
                </button>
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {renderTree(menuStructure)}
                </div>
            )}

            {isOpen && (
                <div
                    className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/50 z-50 transition-colors"
                    onMouseDown={startResizing}
                />
            )}
        </div>
    );
});

Sidebar.displayName = 'Sidebar';
