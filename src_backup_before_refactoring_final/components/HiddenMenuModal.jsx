
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, FileText, Layers } from 'lucide-react';
import { cn } from '../utils/cn';

export const HiddenMenuModal = ({ isOpen, onClose, teams = [] }) => {
    const [rawContent, setRawContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('/Hidden%20Menus%20in%20Multi-Permissions%20.txt')
                .then(res => res.text())
                .then(data => {
                    setRawContent(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load hidden menu documentation:', err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    // [한국어 설명] 데이터를 팀(기본 권한) -> 충돌 권한 -> 숨겨지는 기능 리스트 순으로 그룹화
    const groupedData = useMemo(() => {
        if (!rawContent) return {};

        const lines = rawContent.split('\n').filter(line => line.trim() && line.startsWith('- '));
        const groups = {};

        lines.forEach(line => {
            // [v9.2] [추측], [확정] 고지 텍스트를 파싱 전 전역 제거 (사용자 불만 사항 반영)
            const cleanLine = line.replace(/\[추측\]|\[확정\]/g, '').trim();

            // 1. 기본 팀(권한) 추출
            const teamMatch = cleanLine.match(/^- ([^(]+)\(/);
            if (!teamMatch) return;
            const teamName = teamMatch[1].trim();

            // 2. 함께 부여된(충돌) 권한 추출
            const conflictMatch = cleanLine.match(/\+\s*([^(]+?)(?:\(|\s+조합)/);
            let conflictTeam = conflictMatch ? conflictMatch[1].trim() : "알 수 없는 권한";

            // [v7.5] 동일 권한 부여는 불가능하므로 중복 케이스는 제외 처리
            if (conflictTeam === teamName) return;

            // 3. 숨겨지는 기능 이름 추출 및 정제 (v7.4)
            const funcMatch = cleanLine.match(/\*\*([^*]+)\*\*/g);
            let funcs = [];

            if (funcMatch) {
                funcMatch.forEach(f => {
                    let cleaned = f.replace(/\*\*/g, '');
                    // 1) (1040000) 같은 숫자 ID 제거 및 2) 상세 정보 제거
                    cleaned = cleaned.replace(/\([^)]+\)/g, '').trim();

                    let targetName = cleaned;

                    // [v9.6] 가비지 필터 (설명용 텍스트 제외 로직 최종 강화)
                    // 메뉴명이 아닌 상황 설명 문구(금액, 대부분 등)를 완벽하게 차단합니다.
                    const garbage = ['대부분', '내부', '항목', '전체', '포함', '보이고', '보임', '있음', '금액', '사항', '경우', '조합', '단일', '일부', '대다수', '보일 수', '있는', '보일', '함께', '부여된'];
                    const isDescriptive = garbage.some(k => targetName.includes(k)) || targetName.length > 15;

                    if (isDescriptive) return;

                    if (targetName.includes('업무')) {
                        targetName = '단건상담 등록';
                    }

                    if (targetName.includes('재회수')) {
                        funcs.push('재회수 예약', '재회수 예약 변경', '재회수 예약 취소');
                    } else if (targetName.includes('반복수업')) {
                        funcs.push('반복수업', '반복수업 삭제', '유료회원 체험수업 등록');
                    } else {
                        funcs.push(targetName);
                    }
                });
                funcs = [...new Set(funcs)]; // 중복 제거
            }

            const mainFunc = funcs[0] || "알 수 없는 기능";

            if (!groups[teamName]) groups[teamName] = {};
            if (!groups[teamName][conflictTeam]) groups[teamName][conflictTeam] = new Set();

            funcs.forEach(f => groups[teamName][conflictTeam].add(f));
        });

        const finalObj = {};
        Object.keys(groups).forEach(team => {
            finalObj[team] = {};
            Object.keys(groups[team]).forEach(conflict => {
                finalObj[team][conflict] = Array.from(groups[team][conflict]);
            });
        });

        return finalObj;
    }, [rawContent]);

    if (!isOpen) return null;

    // [v9.7] 정렬 순서 준수: excelParser에서 넘어온 팀 리스트(O개수 정렬된 상태)를 기준으로 필터링
    const sortedRelevantTeams = teams.filter(t => groupedData[t]);

    // 혹시라도 teams에 없는데 groupedData에는 있는 팀이 있다면 뒤에 추가 (데이터 무결성)
    const allRelevantTeams = [...new Set([...sortedRelevantTeams, ...Object.keys(groupedData)])];

    const filteredTeams = allRelevantTeams.filter(teamName => {
        if (!groupedData[teamName]) return false;
        const matchesTeam = teamName.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingConflict = Object.keys(groupedData[teamName]).some(conflict =>
            conflict.toLowerCase().includes(searchQuery.toLowerCase()) ||
            groupedData[teamName][conflict].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return matchesTeam || hasMatchingConflict;
    });

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50">
                            <Layers size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                접근 제한 항목 분석 (복수 권한 충돌)
                                <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-[10px] font-black tracking-widest uppercase">Guide</span>
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="팀 또는 숨겨진 메뉴명으로 검색..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-white dark:bg-slate-900">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                            <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-slate-400 font-black animate-pulse">데이터 분석 중...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {filteredTeams.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800">
                                        <Search size={40} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 font-black text-lg">결과를 찾을 수 없습니다.</p>
                                </div>
                            ) : (
                                filteredTeams.map((teamName) => (
                                    <div key={teamName} className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden mb-16 last:mb-0 shadow-sm">
                                        {/* Team Section Header */}
                                        <div className="sticky top-0 bg-white dark:bg-slate-900 px-10 py-6 border-b border-slate-100 dark:border-slate-800 z-20 flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-2 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                                                    {teamName}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Conflicts Grouping */}
                                        <div className="p-10 space-y-10">
                                            {Object.keys(groupedData[teamName]).map((conflict) => {
                                                const functions = groupedData[teamName][conflict];
                                                const matchesSearch = conflict.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    functions.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

                                                if (!matchesSearch && !teamName.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                                return (
                                                    <div key={conflict} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                        <div className="flex items-center gap-3 mb-5">
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                                                                    {conflict}
                                                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 text-[10px]">총 {functions.length}개</span>
                                                                </span>
                                                            </div>
                                                            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {functions.map((func, fidx) => (
                                                                <div
                                                                    key={fidx}
                                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all cursor-default group/item"
                                                                >
                                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700 shrink-0">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="text-[14px] font-black text-slate-700 dark:text-slate-200 truncate">
                                                                            {func}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-end">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        Wink Admin Conflict Analyzer &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};
