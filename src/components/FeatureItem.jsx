import React, { memo } from 'react';
import { cn } from '../utils/cn';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Shield from 'lucide-react/dist/esm/icons/shield';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

// [한국어 설명] 기능 아이템(버튼) 하나를 렌더링하는 컴포넌트입니다.
// MainContent의 복잡한 렌더링 로직을 분리하여 관리 용이성을 높였습니다.
// '배지' 관련 코드는 아예 존재하지 않습니다.
export const FeatureItem = memo(({
    item,
    isAllowed,
    isDimmed,
    isExpanded,
    onToggle,
    isGrouped,
    extraClasses,
    selectedTeams,
    allData,
    isComparison
}) => {
    return (
        <React.Fragment key={item.id}>
            <tr
                className={cn(
                    "transition-colors cursor-pointer group border-l-4",
                    isExpanded ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500" : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent",
                    isDimmed && !isExpanded && "bg-gray-50/30 dark:bg-slate-900/10",
                    isGrouped && "bg-gray-50/30 dark:bg-slate-900/20",
                    extraClasses
                )}
                onClick={() => onToggle(item.id)}
            >
                {/* [한국어 설명] 구분 컬럼: 배지 제거됨 */}
                <td className="py-3 px-4 w-[1px] whitespace-nowrap"></td>

                {/* 이름 컬럼 */}
                <td
                    className={cn(
                        "py-3 px-4 transition-colors font-extrabold",
                        isAllowed
                            ? "text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                            : "text-gray-400 dark:text-slate-500 line-through decoration-gray-500 dark:decoration-slate-500 decoration-2",
                        isGrouped && "pl-6"
                    )}
                    style={{ fontWeight: '800', color: isAllowed ? '#000' : undefined }}
                >
                    {item.name}
                </td>

                {/* 설명 컬럼 */}
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400">
                    {item.description || "-"}
                </td>

                {/* 권한 상태 컬럼 */}
                {isComparison ? (
                    selectedTeams.map((team, idx) => (
                        <td
                            key={team}
                            className={cn(
                                "py-3 px-4 text-center border-l border-gray-100 dark:border-slate-700/50",
                                idx % 2 === 1 && "bg-gray-50/30 dark:bg-slate-900/10"
                            )}
                        >
                            {allData.permissionMap[team]?.[item.id] ? (
                                <div className="flex justify-center">
                                    <CheckCircle size={18} className="text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]" />
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <Lock size={18} className="text-red-400 opacity-40" />
                                </div>
                            )}
                        </td>
                    ))
                ) : (
                    <td className="py-3 px-4 text-center relative group/cell">
                        <div className="flex flex-col items-center justify-center gap-1">
                            {isAllowed ? <CheckCircle size={18} className={cn(selectedTeams.length > 1 ? "text-indigo-500" : "text-green-500")} /> : <Lock size={18} className="text-red-500" />}

                            {/* Unified Mode Badge */}
                            {!isComparison && selectedTeams.length > 1 && isAllowed && (
                                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                                    {selectedTeams.filter(t => allData.permissionMap[t]?.[item.id]).length}팀 허용
                                </div>
                            )}
                        </div>
                    </td>
                )}

                {/* 확장 토글 아이콘 */}
                <td className="py-3 px-4 text-gray-400 text-right">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </td>
            </tr>

            {/* 확장(Details) 영역 */}
            {isExpanded && (
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 box-shadow-inner">
                    <td colSpan={5 + Math.max(1, selectedTeams.length)} className="p-4 pl-12">
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Shield size={12} /> 팀별 상세 권한
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {allData.teams.map(team => {
                                    const hasAccess = allData.permissionMap[team]?.[item.id];
                                    const isSelected = selectedTeams.includes(team);

                                    return (
                                        <div key={team} className={cn(
                                            "flex items-center gap-2 p-2 rounded border text-xs",
                                            hasAccess
                                                ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                                                : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500",
                                            isSelected && "ring-1 ring-blue-500"
                                        )}>
                                            {hasAccess ? <CheckCircle size={10} /> : <Lock size={10} />}
                                            <span className="font-medium">{team}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
});

FeatureItem.displayName = 'FeatureItem';
