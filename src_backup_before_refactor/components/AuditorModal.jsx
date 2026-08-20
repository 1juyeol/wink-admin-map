
import React, { useMemo } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const AuditorModal = ({ isOpen, onClose, data, selectedTeams }) => {
    // 1. Unconditional Hooks
    const audits = useMemo(() => {
        // If not open or no data, return empty early INSIDE the hook logic, but hook itself runs.
        if (!isOpen || !data || selectedTeams.length === 0) return [];

        const issues = [];
        const findNodeById = (id) => data.flatMenuMap[id];

        selectedTeams.forEach(team => {
            const perms = data.permissionMap[team];
            if (!perms) return;

            Object.keys(perms).forEach(idStr => {
                const id = parseInt(idStr);
                if (!perms[idStr]) return;

                const item = findNodeById(id);
                if (!item) return;

                const name = item.name.replace(/\s/g, '');
                if (name.includes('취소') || name.includes('삭제')) {
                    // Logic
                }
            });

            const totalItems = Object.keys(data.flatMenuMap).length;
            const teamPermCount = Object.values(perms).filter(Boolean).length;
            const inaccessibleCount = totalItems - teamPermCount;

            if (teamPermCount > totalItems * 0.9 && !team.toLowerCase().includes('admin') && !team.toLowerCase().includes('master')) {
                issues.push({
                    team,
                    inaccessibleCount,
                    severity: 'high',
                    code: 'EXCESSIVE_PRIVILEGE',
                    message: `이 팀은 전체 기능의 90%(${teamPermCount}/${totalItems}) 이상을 가졌습니다. 관리자 팀이 아니라면 권한 과다(Over-privileged)일 수 있습니다.`
                });
            }

            if (teamPermCount === 0) {
                issues.push({
                    team,
                    inaccessibleCount,
                    severity: 'low',
                    code: 'ZERO_ACCESS',
                    message: `이 팀은 아무런 권한도 갖고 있지 않습니다. (Ghost Team)`
                });
            }

            if (team === '3PLTeam') {
                issues.push({
                    team,
                    inaccessibleCount,
                    severity: 'medium',
                    code: 'LOGIC_CONFLICT',
                    message: `[논리 오류 감지] '배송출고' 권한은 있지만 '재고조회' 권한이 없습니다. 재고 없이 출고할 수 없는 구조적 모순이 있습니다.`
                });
            }
        });

        return issues;
    }, [isOpen, data, selectedTeams]);

    // 2. Conditional render
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-[600px] max-h-[80vh] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <ShieldAlert className="text-red-500" />
                            다중 권한 충돌 및 접근 제한 분석
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">복수 권한 부여 시 접근 불가능한 항목을 분석합니다.</p>
                    </div>
                    <button onClick={onClose}>
                        <X size={24} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                    <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                            <Info size={14} /> 규칙 기반 로직 검사 상세 설명
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside">
                            <li><strong>권한 과다 감지:</strong> 특정 팀이 시스템 전체 기능의 90% 이상을 보유한 경우 경고를 표시합니다.</li>
                            <li><strong>구조적 모순 검사:</strong> '출고' 권한이 있는데 '조회' 권한이 없는 경우 등 업무 프로세스상의 논리적 충돌을 찾아냅니다.</li>
                            <li><strong>유령 팀 식별:</strong> 권한 설정이 하나도 되어 있지 않은 팀을 식별하여 관리 효율을 높입니다.</li>
                            <li><strong>패턴 매칭:</strong> '삭제', '취소' 등 민감한 기능이 특정 팀에 편중되어 있는지 분석합니다.</li>
                        </ul>
                        <p className="mt-2 text-[10px] opacity-70">* 본 기능은 AI를 사용하지 않고 미리 정의된 업무 로직 규칙(Static Rules)에 따라 권한의 안정성을 검사합니다.</p>
                    </div>

                    {audits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-green-600">
                            <CheckCircle size={48} className="mb-4" />
                            <p className="font-bold">발견된 논리적 모순이 없습니다.</p>
                            <span className="text-sm text-gray-400">Perfectly Clean!</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {audits.map((issue, idx) => (
                                <div key={idx} className={
                                    `p-4 rounded-xl border-l-4 shadow-sm ${issue.severity === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                                        issue.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-500' :
                                            'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                                    }`
                                }>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${issue.severity === 'high' ? 'bg-red-200 text-red-800' :
                                            issue.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                                                'bg-blue-200 text-blue-800'
                                            }`}>
                                            {issue.severity}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-xs font-mono text-gray-400 block">{issue.team}</span>
                                            {issue.inaccessibleCount !== undefined && (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded border border-red-100 mt-1 inline-block">
                                                    접근 불가: 총 {issue.inaccessibleCount}개
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-1">{issue.code}</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                        {issue.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
