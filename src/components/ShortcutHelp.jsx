
import React from 'react';
import Command from 'lucide-react/dist/esm/icons/command';
import CornerDownLeft from 'lucide-react/dist/esm/icons/corner-down-left';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';

export const ShortcutHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { keys: ['Ctrl', 'K'], desc: '검색창 열기' },
        { keys: ['Esc'], desc: '모달 닫기 / 검색 취소' },
        { keys: ['Enter'], desc: '검색 결과 이동' },
        { keys: ['['], desc: '이전 메뉴 (트리 위로)' },
        { keys: [']'], desc: '다음 메뉴 (트리 아래로)' }, // Future impl
    ];

    return (
        <div className="fixed inset-0 bg-black/20 z-[110] flex items-center justify-center backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-[400px]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <Command className="text-gray-400" /> Keyboard Shortcuts
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    {shortcuts.map((sc, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <span className="text-sm text-gray-600 dark:text-slate-400 font-medium group-hover:text-blue-600 transition-colors">
                                {sc.desc}
                            </span>
                            <div className="flex gap-1">
                                {sc.keys.map(k => (
                                    <kbd key={k} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-xs font-mono font-bold text-gray-600 dark:text-slate-300 shadow-sm">
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-gray-400">Press <span className="font-bold">?</span> anytime to see this.</p>
                </div>
            </div>
        </div>
    );
};
