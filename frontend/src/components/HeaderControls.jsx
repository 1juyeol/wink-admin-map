import React, { useState, useCallback } from 'react';
import Grid from 'lucide-react/dist/esm/icons/grid';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import { cn } from '../utils/cn';
import { AccountManager } from './AccountManager';
import { MultiSelect } from './MultiSelect';
import { SearchBox } from './SearchBox';
import { usePermission } from '../contexts/PermissionContext';
import { useLayout } from '../contexts/LayoutContext';
import { useToast } from '../contexts/ToastContext';
import { generateMarkdown } from '../utils/markdownGenerator';

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

export const HeaderControls = ({ showHiddenMenu, setShowHiddenMenu }) => {
    const {
        data,
        isAdmin, setIsAdmin,
        setSearchQuery, setIsSearchFocused,
        handleJsonExport,
        selectedTeams, updateUrl,
        isCompareMode, setIsCompareMode,
        compareTeams, setCompareTeams,
        setActiveNode, setSearchTargetId,
        setIsRefreshing,
        teamAccessAnalysis
    } = usePermission();

    const {
        darkMode, toggleDarkMode,
        showDiff, setShowDiff,
        setIsSidebarOpen
    } = useLayout();

    const { showToast } = useToast();

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
    }, [setSearchQuery, setIsSearchFocused, updateUrl, setActiveNode, setSearchTargetId, setCompareTeams, setIsCompareMode, setShowDiff, setIsSidebarOpen, setIsRefreshing, showToast]);

    const handleCompareChange = (action, team) => {
        if (action === 'mode') {
            setIsCompareMode(team); // team holds the boolean for the mode toggle
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
        const targetTeams = isCompareMode ? compareTeams : selectedTeams;
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

    const handlePdfExport = () => {
        showToast('PDF 내보내기는 현재 준비 중입니다.', 'info');
    };

    const handleTeamsChange = (teams) => {
        updateUrl({ selectedTeams: teams });
    };

    return (
        <header className="print:hidden min-h-16 h-auto py-2 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between px-6 shadow-sm z-[500] relative gap-4">
            <Tooltip content="초기화 및 홈으로 이동">
                <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={handleReset}>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg">
                        <Grid size={20} />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-bold text-gray-800 dark:text-slate-100 tracking-tight leading-none">Wink Admin Map</h1>
                    </div>
                </div>
            </Tooltip>

            <div className="flex-1 flex items-center gap-3 mx-4 min-w-0">
                <SearchBox />

                <Tooltip content="권한을 비교할 팀을 선택하세요">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-64 sm:w-80">
                            <MultiSelect
                                options={data?.teams || []}
                                selected={selectedTeams}
                                onChange={handleTeamsChange}
                                placeholder={isCompareMode ? "비교할 팀을 선택하세요" : "전체 팀 보기"}
                                isCompareMode={isCompareMode}
                                compareTeams={compareTeams}
                                onCompareChange={handleCompareChange}
                                teamAccessAnalysis={teamAccessAnalysis}
                            />
                        </div>
                        <button
                            onClick={() => handleCompareChange('mode', !isCompareMode)}
                            className={cn(
                                "px-4 h-[44px] rounded-xl border transition-all flex items-center justify-center whitespace-nowrap text-sm font-bold",
                                isCompareMode ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-purple-400 hover:text-purple-600"
                            )}>
                            비교모드
                        </button>
                    </div>
                </Tooltip>

                <Tooltip content="모든 필터 초기화">
                    <button onClick={handleReset} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0 border border-transparent hover:border-red-100">
                        <RotateCcw size={20} />
                    </button>
                </Tooltip>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                <AccountManager
                    isAdmin={isAdmin}
                    onLoginChange={setIsAdmin}
                    onHistorySelect={term => { setSearchQuery(term); setIsSearchFocused(true); }}
                    onJsonExport={handleJsonExport}
                    onPdfExport={handlePdfExport}
                    onMarkdownExport={handleMarkdownExport}
                    showDiff={showDiff}
                    setShowDiff={setShowDiff}
                    showHiddenMenu={showHiddenMenu}
                    setShowHiddenMenu={setShowHiddenMenu}
                    showToast={showToast}
                    darkMode={darkMode}
                    setDarkMode={toggleDarkMode}
                />
            </div>
        </header>
    );
};
