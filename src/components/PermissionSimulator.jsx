import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { HeaderControls } from './HeaderControls';
import { usePermission } from '../contexts/PermissionContext';
import { useLayout } from '../contexts/LayoutContext';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

// Modals
import { ExcelDiffModal } from './ExcelDiffModal';
import { HiddenMenuModal } from './HiddenMenuModal';

export const PermissionSimulator = () => {
    const { loading, isRefreshing, data } = usePermission();
    const { showDiff, setShowDiff } = useLayout();

    // HiddenMenuModal state can stay local since it's only toggled from header and shown here
    const [showHiddenMenu, setShowHiddenMenu] = useState(false);

    useEffect(() => {
        console.log("%c[v12.0 LIVE] WINK Admin Map Simulator - Production Ready", "color: #6366f1; font-weight: bold;");
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowDiff(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setShowDiff]);

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
                showHiddenMenu={showHiddenMenu}
                setShowHiddenMenu={setShowHiddenMenu}
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="print:hidden h-full">
                    <Sidebar />
                </div>
                <div className="flex-1 h-full overflow-hidden flex flex-col">
                    <MainContent />
                </div>
            </div>

            {showDiff && <ExcelDiffModal isOpen={showDiff} onClose={() => setShowDiff(false)} />}
            {showHiddenMenu && (
                <HiddenMenuModal
                    isOpen={showHiddenMenu}
                    onClose={() => setShowHiddenMenu(false)}
                    teams={data?.teams || []}
                />
            )}
        </div>
    );
};
