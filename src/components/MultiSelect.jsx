import React, { useState, useRef, useEffect } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Check from 'lucide-react/dist/esm/icons/check';
import X from 'lucide-react/dist/esm/icons/x';
import Search from 'lucide-react/dist/esm/icons/search';
import Users from 'lucide-react/dist/esm/icons/users';
import { cn } from '../utils/cn';

export const MultiSelect = ({ options, selected, onChange, placeholder = "팀 선택...", isCompareMode, compareTeams = [], onCompareChange, dropUp = false, teamAccessAnalysis = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const renderOption = (option) => {
        const isSelected = selected.includes(option);
        const stats = teamAccessAnalysis[option] || { deniedButtons: 0, deniedMenus: 0, totalDenied: 0 };

        return (
            <div
                key={option}
                className={cn(
                    "px-3 py-2.5 text-[13.5px] cursor-pointer rounded-xl flex items-center gap-3 transition-all group",
                    isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium"
                )}
                onClick={() => handleToggleOption(option)}
            >
                {isCompareMode ? (
                    <div className="flex items-center gap-3 w-full">
                        <span className="flex-1 break-keep leading-snug mt-0.5">{option}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCompareChange('toggle', option); }}
                            className={cn(
                                "px-3 py-1 text-[10px] font-black rounded-lg border transition-all truncate min-w-[50px]",
                                compareTeams.includes(option)
                                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/30"
                                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400 hover:border-purple-400"
                            )}
                        >
                            {compareTeams.includes(option) ? `T${compareTeams.indexOf(option) + 1} 선택됨` : "비교 추가"}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                            isSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        )}>
                            {isSelected && <Check size={12} className="text-white animate-in zoom-in" />}
                        </div>
                        <span className="flex-1 break-keep leading-snug mt-0.5">{option}</span>
                    </>
                )}
            </div>
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedOptions = options;

    const handleToggleOption = (option) => {
        if (isCompareMode) return;
        const newSelected = selected.includes(option)
            ? selected.filter(s => s !== option)
            : [...selected, option];
        onChange(newSelected);
        inputRef.current?.focus({ preventScroll: true });
    };

    const removeOption = (e, option) => {
        e.stopPropagation();
        onChange(selected.filter(s => s !== option));
    };

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div
                className={cn(
                    "flex flex-col w-full p-1.5 bg-white dark:bg-slate-800 border rounded-xl cursor-text transition-all shadow-sm min-h-[44px]",
                    isOpen ? "border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30" : "border-gray-300 dark:border-slate-700 hover:border-blue-400",
                    isCompareMode && "border-purple-300 ring-4 ring-purple-100 dark:ring-purple-900/20"
                )}
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                {((!isCompareMode && selected.length > 0) || (isCompareMode && compareTeams.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5 p-1 mb-1.5 border-b border-gray-50 dark:border-slate-700/50 pb-2 max-h-32 overflow-y-auto no-scrollbar">
                        {!isCompareMode && (
                            <>
                                {selected.length <= 3 ? (
                                    selected.map(team => (
                                        <span
                                            key={team}
                                            className="whitespace-nowrap flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-800"
                                        >
                                            {team}
                                            <button onClick={(e) => removeOption(e, team)} className="hover:text-blue-500 transition-colors"><X size={10} /></button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                                        <Users size={12} />
                                        {selected[0]} 외 {selected.length - 1}개 팀
                                        <button onClick={(e) => { e.stopPropagation(); onChange([]); }} className="ml-1 hover:text-blue-200"><X size={12} /></button>
                                    </span>
                                )}
                            </>
                        )}

                        {isCompareMode && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {compareTeams.map((team, idx) => (
                                    <span
                                        key={team}
                                        className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-black border whitespace-nowrap flex items-center gap-1.5",
                                            idx === 0 ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                idx === 1 ? "bg-orange-50 text-orange-600 border-orange-200" :
                                                    idx === 2 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                        idx === 3 ? "bg-violet-50 text-violet-600 border-violet-200" :
                                                            "bg-rose-50 text-rose-600 border-rose-200"
                                        )}
                                    >
                                        <span className="opacity-50">T{idx + 1}</span>
                                        {team}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onCompareChange('toggle', team); }}
                                            className="hover:opacity-100 opacity-60 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 px-1.5 h-8 flex-1">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm dark:text-white placeholder:text-gray-400 font-medium"
                        placeholder={(isCompareMode ? compareTeams.length === 0 : selected.length === 0) ? placeholder : "검색..."}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                    />
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {searchTerm && (
                            <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400">
                                <X size={14} />
                            </button>
                        )}
                        <ChevronDown size={18} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className={cn(
                    "absolute left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-[400px] overflow-hidden z-[510] flex flex-col mt-2 animate-in fade-in slide-in-from-top-2",
                    dropUp && "bottom-full mb-4 origin-bottom"
                )}>
                    <div className="overflow-y-auto flex-1 p-2">
                        {options.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm italic">
                                로드된 데이터가 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {sortedOptions
                                    .filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(option => renderOption(option))}
                            </div>
                        )}
                        {searchTerm && sortedOptions.filter(i => i.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="py-8 text-center text-gray-400 text-sm">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
