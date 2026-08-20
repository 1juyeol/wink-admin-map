
import React, { useState } from 'react';
import { X, FileDiff, Upload, ArrowRight, AlertCircle, Plus, Minus, Hash } from 'lucide-react';
// import { parseExcel } from '../utils/excelParser';
import { cn } from '../utils/cn';

export const ExcelDiffModal = ({ isOpen, onClose }) => {
    const [fileA, setFileA] = useState(null);
    const [fileB, setFileB] = useState(null);
    const [diffResult, setDiffResult] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCompare = async () => {
        if (!fileA || !fileB) return;
        setLoading(true);
        try {
            // Placeholder data for now
            const dataA = { flatMenuMap: {} };
            const dataB = { flatMenuMap: {} };

            // Compare Logic
            // 1. Structure Changes
            // 2. Permission Changes (Team - ID)

            const changes = [];

            // Simplified Diff: Compare Flat Maps by ID
            const mapA = dataA.flatMenuMap;
            const mapB = dataB.flatMenuMap;

            const allIds = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);

            allIds.forEach(id => {
                const itemA = mapA[id];
                const itemB = mapB[id];

                if (!itemA && itemB) {
                    changes.push({ type: 'added', id, name: itemB.name, path: itemB.path });
                } else if (itemA && !itemB) {
                    changes.push({ type: 'removed', id, name: itemA.name, path: itemA.path });
                } else if (itemA && itemB) {
                    // Check if content changed? maybe name/desc
                    if (itemA.name !== itemB.name || itemA.path !== itemB.path) {
                        changes.push({ type: 'modified', id, prev: itemA, curr: itemB });
                    }

                    // Check Permissions?
                    // Would be huge list. Let's stick to Structure Diff for now as MVP.
                }
            });

            setDiffResult(changes);

        } catch (e) {
            console.error(e);
            alert("비교 실패! 파일 형식을 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-[900px] h-[700px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                        <FileDiff className="text-orange-500" />
                        엑셀 버전 비교 도구 (Diff Viewer)
                    </h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-bold mb-1">사용 방법</p>
                            <ul className="list-disc list-inside space-y-1 opacity-90">
                                <li><strong>Original (Old)</strong>에 이전 버전 엑셀 파일을, <strong>Target (New)</strong>에 최신 버전 파일을 업로드하세요.</li>
                                <li>비교(Compare) 버튼을 누르면 <strong>메뉴 구조의 변경 사항(추가/삭제/변경)</strong>을 감지하여 보여줍니다.</li>
                            </ul>
                            <div className="flex gap-3 mt-2 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 추가됨(Added)</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 삭제됨(Removed)</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 변경됨(Modified)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-gray-600 dark:text-slate-400">Original (Old)</span>
                        <input type="file" onChange={e => setFileA(e.target.files[0])} className="text-sm dark:text-slate-300" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-gray-600 dark:text-slate-400">Target (New)</span>
                        <input type="file" onChange={e => setFileB(e.target.files[0])} className="text-sm dark:text-slate-300" />
                    </div>
                </div>

                <div className="p-4 flex justify-center border-b border-gray-100 dark:border-slate-800">
                    <button
                        onClick={handleCompare}
                        disabled={!fileA || !fileB || loading}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-full transition-colors"
                    >
                        {loading ? "Analyzing..." : "Compare Files"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                    {!diffResult && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <FileDiff size={48} className="mb-4 opacity-20" />
                            <p>두 개의 엑셀 파일을 선택하고 Compare 버튼을 누르세요.</p>
                        </div>
                    )}

                    {diffResult && (
                        <div className="space-y-2">
                            <h3 className="font-bold mb-4 text-gray-700 dark:text-slate-300">Analysis Results ({diffResult.length})</h3>
                            {diffResult.length === 0 && <p className="text-green-500 font-bold">No structural differences found!</p>}
                            {diffResult.map((change, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        change.type === 'added' ? "bg-green-100 text-green-600" :
                                            change.type === 'removed' ? "bg-red-100 text-red-600" :
                                                "bg-yellow-100 text-yellow-600"
                                    )}>
                                        {change.type === 'added' ? <Plus size={16} /> :
                                            change.type === 'removed' ? <Minus size={16} /> :
                                                <Hash size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs font-bold uppercase px-2 py-0.5 rounded",
                                                change.type === 'added' ? "bg-green-100 text-green-700" :
                                                    change.type === 'removed' ? "bg-red-100 text-red-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                            )}>{change.type}</span>
                                            <span className="font-medium text-gray-800 dark:text-slate-200">
                                                {change.name || change.curr?.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 truncate">
                                            {change.path || change.curr?.path}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
