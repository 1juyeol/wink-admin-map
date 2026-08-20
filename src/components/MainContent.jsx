
import React, { useState } from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Lock from 'lucide-react/dist/esm/icons/lock';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import MousePointerClick from 'lucide-react/dist/esm/icons/mouse-pointer-click';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import GitCompare from 'lucide-react/dist/esm/icons/git-compare';
import Users from 'lucide-react/dist/esm/icons/users';
import Star from 'lucide-react/dist/esm/icons/star';
import { cn } from '../utils/cn';
import { getDesignByType } from '../utils/designSystem';

import { usePermission } from '../contexts/PermissionContext';
import { useBookmark } from '../contexts/BookmarkContext';

export const MainContent = React.memo(() => {
    const {
        data: allData,
        selectedTeams,
        compareTeams,
        activeNode,
        searchTargetId,
        isCompareMode,
        isAdmin
    } = usePermission();

    // Use the exact same logic for mapping displayed teams
    const displayedTeams = isCompareMode ? compareTeams : selectedTeams;

    const { starredMenus, handleToggleStarMenu: onToggleStarMenu } = useBookmark();

    const isComparison = isCompareMode && displayedTeams.length > 1;
    const [expandedFeatureId, setExpandedFeatureId] = useState(null);

    // [v6.11.14] Rules of Hooks 준수: 모든 Hook은 Early Return 이전에 호출되어야 함
    React.useEffect(() => {
        if (searchTargetId && activeNode) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`feature-${searchTargetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [searchTargetId, activeNode]);

    // [v6.11.14] renderRow를 아래에서 사용할 수 있도록 최상단 부근에 정의 (Hoisting 보장)
    function renderRow(item, isAllowed, isDimmed, isExpanded, TypeIcon, isGrouped = false, extraClasses = "") {
        return (
            <React.Fragment key={`feat-${item.id}`}>
                <tr
                    id={`feature-${item.id}`} // [v6.11.13] 검색 이동을 위해 고유 ID 부여
                    className={cn(
                        "transition-all duration-500 cursor-pointer group border-l-4",
                        isExpanded ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-blue-500" : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-l-transparent",
                        isDimmed && !isExpanded && "bg-gray-50/30 dark:bg-slate-900/10",
                        isGrouped && "bg-gray-50/30 dark:bg-slate-900/20",
                        searchTargetId === item.id && "ring-4 ring-blue-500 ring-inset z-10 shadow-lg bg-blue-50/30 dark:bg-blue-900/10", // [v6.11.15] scale 제거 (텍스트 밀림 방지)
                        extraClasses
                    )}
                    onClick={() => toggleExpand(item.id)}
                >
                    <td className="py-3 px-4 w-[1px] whitespace-nowrap text-left">
                        {(() => {
                            const design = getDesignByType(item.type);
                            return (
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-8 rounded-lg border transition-all",
                                    design.className
                                )}>
                                    <div className="shrink-0">{design.icon(16, 2.5)}</div>
                                </div>
                            );
                        })()}
                    </td>
                    <td
                        className={cn(
                            "py-3 px-4 transition-colors font-extrabold",
                            isAllowed
                                ? "text-gray-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                : "text-gray-400 dark:text-slate-500 line-through decoration-red-500 dark:decoration-red-600 decoration-2",
                            isGrouped && "pl-6"
                        )}
                        style={{ fontWeight: '800', color: isAllowed ? '#000' : undefined }}
                    >
                        {item.name?.replace(/\[(버튼|드롭다운|Button|Dropdown)\]/g, '').trim()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-slate-400">
                        {item.description || "-"}
                    </td>
                    {isComparison ? (
                        displayedTeams.map((team, idx) => (
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
                                {isAllowed ? <CheckCircle size={18} className={cn(displayedTeams.length > 1 ? "text-indigo-500" : "text-green-500")} /> : <Lock size={18} className="text-red-500" />}
                                {!isComparison && displayedTeams.length > 1 && isAllowed && (
                                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                                        {displayedTeams.filter(t => allData.permissionMap[t]?.[item.id]).length}팀 허용
                                    </div>
                                )}
                            </div>
                        </td>
                    )}
                    <td className="py-3 px-4 text-gray-400 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggleStarMenu) onToggleStarMenu(item);
                                    }}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-all duration-200 shadow-sm border",
                                        starredMenus.some(m => {
                                            if (typeof m === 'string') return m === item.id;
                                            return m.id === item.id;
                                        })
                                            ? "bg-yellow-400 text-white border-yellow-500 opacity-100 scale-110"
                                            : "bg-white dark:bg-slate-800 text-gray-300 border-gray-100 dark:border-slate-700 opacity-100 hover:text-yellow-400 hover:border-yellow-200"
                                    )}
                                    title="즐겨찾기 추가/해제"
                                >
                                    <Star size={16} fill={starredMenus.some(m => (typeof m === 'string' ? false : m.id === item.id)) ? "currentColor" : "none"} strokeWidth={starredMenus.some(m => (typeof m === 'string' ? false : m.id === item.id)) ? 0 : 2} />
                                </button>
                            )}
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </td>
                </tr>

                {isExpanded && (
                    <tr className="bg-gray-50/50 dark:bg-slate-900/50 box-shadow-inner">
                        <td colSpan={5 + Math.max(1, displayedTeams.length)} className="p-4 pl-12">
                            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <UserCheck size={12} /> 팀별 상세 권한
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {allData.teams.map(team => {
                                        const hasAccess = allData.permissionMap[team]?.[item.id];
                                        const isSelected = displayedTeams.includes(team);

                                        return (
                                            <div
                                                key={team}
                                                className={cn(
                                                    "px-3 py-2 rounded text-sm border flex items-center justify-between transition-all",
                                                    hasAccess
                                                        ? "bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/30 text-gray-800 dark:text-slate-200"
                                                        : "bg-gray-50 dark:bg-slate-800/50 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-600",
                                                    isSelected && hasAccess && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20",
                                                    isSelected && !hasAccess && "ring-2 ring-red-300 ring-offset-1 dark:ring-offset-slate-800 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                                                )}
                                            >
                                                <span className={cn("font-medium truncate", !hasAccess && "line-through decoration-gray-300 dark:decoration-slate-700")}>
                                                    {team}
                                                </span>
                                                {hasAccess ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300 dark:text-slate-600" />}
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
    }

    const toggleExpand = (id) => {
        setExpandedFeatureId(prev => prev === id ? null : id);
    };

    if (!activeNode) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-slate-900/50">
                <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Lock size={32} className="text-gray-400 dark:text-slate-600" />
                </div>
                <p className="dark:text-slate-500">왼쪽 메뉴에서 페이지를 선택해주세요.</p>
            </div>
        );
    }

    const items = activeNode.items || [];
    const pageInfo = items.find(item => item.type === 'view') || { name: activeNode.name, description: '' };

    // [한국어 설명] 상세 기능 목록에서 페이지 설명이나 단순 가이드 항목을 필터링합니다. (v3.52)
    const features = items.filter(item => {
        if (item.type === 'view') return false;

        // 1. 기능명이 '-'인 경우 제외 (주로 엑셀 가이드용 행)
        if (item.name === '-') return false;

        // 2. 페이지 제목과 동일한 명칭의 버튼은 엑셀 가이드용이므로 제외
        if (item.name === activeNode.name) return false;

        // 3. 설명문이 페이지 제목과 동일한 경우 제외 (사용자 요청 반영)
        if (item.description === activeNode.name) return false;

        // 4. '페이지 소개/안내/개요' 등 기능이 아닌 설명 성격의 키워드 필터링
        const introKeywords = ['페이지 소개', '페이지 안내', '기능 요약', '페이지 개요', '안내 가이드', '시스템 가이드'];
        if (introKeywords.some(k => item.name?.includes(k) || item.description?.includes(k))) return false;

        return true;
    });

    // [v6.11.9] 사이드바와 권한 체크 로직 완전 동기화 (재귀적 체크 도입)
    // 상위 메뉴(폴더) 선택 시, 하위 메뉴 중 하나라도 권한이 있으면 접근 가능으로 표시
    const hasPageAccess = (() => {
        if (!displayedTeams || displayedTeams.length === 0) return true;

        const checkNode = (node) => {
            if (!node) return false;
            // 1. 현재 노드의 아이템(버튼/뷰 등) 중 권한이 있는지 확인
            if (node.items?.some(item =>
                displayedTeams.some(team => allData.permissionMap[team]?.[item.id] === true)
            )) return true;

            // 2. 하위 노드들을 재귀적으로 확인
            if (node.children?.length > 0) {
                return node.children.some(child => checkNode(child));
            }

            return false;
        };

        return checkNode(activeNode);
    })();

    // (하단 useEffect 제거됨)

    return (
        <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900 p-8 relative">
            <div className={cn(
                "mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl border shadow-sm transition-all",
                !hasPageAccess ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10" : "border-gray-200 dark:border-slate-700"
            )}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            {/* [v12.5] 사이드바와 100% 동일한 디자인 토큰 적용 (아이콘+배지) */}
                            {(() => {
                                const design = getDesignByType(activeNode.type);
                                return (
                                    <div className={cn("w-12 h-12 flex items-center justify-center shrink-0 shadow-sm border", design.className)}>
                                        {design.icon(24, activeNode.type === 'gnb' ? 2.5 : 2)}
                                    </div>
                                );
                            })()}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className={cn(
                                        "text-3xl font-[900] tracking-tight",
                                        !hasPageAccess ? "text-gray-400 line-through decoration-red-400/50" : "text-gray-900 dark:text-white"
                                    )}>
                                        {activeNode.name}
                                    </h1>
                                </div>
                                {!hasPageAccess && (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wider w-fit">
                                        <Lock size={10} /> 접근 권한 없음
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed max-w-3xl">
                            {pageInfo.description}
                        </p>
                    </div>
                </div>

            </div>

            {displayedTeams.length > 1 && (
                <div className={cn(
                    "mb-4 p-3 rounded-lg text-sm flex items-center gap-2",
                    isComparison
                        ? "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                        : "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                )}>
                    {isComparison ? (
                        <>
                            <GitCompare size={16} />
                            <span><strong>비교 모드:</strong> 각 팀별 권한을 개별적으로 비교합니다. (최대 5개 팀)</span>
                        </>
                    ) : (
                        <>
                            <Users size={16} />
                            <span><strong>통합 모드:</strong> 선택된 {displayedTeams.length}개 팀 중 <strong>하나라도</strong> 권한이 있으면 접근 가능한 것으로 표시됩니다. (겸직자 기준 합집합)</span>
                        </>
                    )}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-medium text-sm">
                        <tr>
                            <th className="py-3 px-4 w-32">구분</th>
                            <th className="py-3 px-4">기능명</th>
                            <th className="py-3 px-4">설명</th>
                            {isComparison ? (
                                displayedTeams.map((team, idx) => (
                                    <th
                                        key={team}
                                        className={cn(
                                            "py-3 px-4 w-28 text-center font-bold border-l border-gray-100 dark:border-slate-700",
                                            idx === 0 ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600" :
                                                idx === 1 ? "bg-orange-50/50 dark:bg-orange-900/10 text-orange-600" :
                                                    idx === 2 ? "bg-green-50/50 dark:bg-green-900/10 text-green-600" :
                                                        idx === 3 ? "bg-purple-50/50 dark:bg-purple-900/10 text-purple-600" :
                                                            "bg-pink-50/50 dark:bg-pink-900/10 text-pink-600"
                                        )}
                                    >
                                        {team}
                                    </th>
                                ))
                            ) : (
                                <th className="py-3 px-4 w-32 text-center">
                                    {displayedTeams.length > 1 ? (
                                        <div className="flex flex-col items-center leading-tight">
                                            <span>권한 여부</span>
                                            <span className="text-[9px] text-gray-400 font-normal normal-case">
                                                ( {displayedTeams.length}개 팀 합산 )
                                            </span>
                                        </div>
                                    ) : "상태"}
                                </th>
                            )}
                            <th className="py-3 px-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {(() => {
                            // [한국어 설명] 엑셀 데이터 순서를 엄격히 따르는 순차 그루핑 로직 (v3.13)
                            const finalFeatures = [];
                            let currentGroup = null;

                            features.forEach(item => {
                                if (item.group) {
                                    // [한국어 설명] 그룹명(J열)이 있는 경우: 연속된 경우만 묶음
                                    if (currentGroup && currentGroup.name === item.group) {
                                        currentGroup.items.push(item);
                                    } else {
                                        currentGroup = { type: 'group', name: item.group, items: [item] };
                                        finalFeatures.push(currentGroup);
                                    }
                                } else {
                                    // [한국어 설명] 그룹명이 없는 일반 버튼: 독립적으로 나열
                                    currentGroup = null;
                                    finalFeatures.push({ type: 'single', item });
                                }
                            });

                            return finalFeatures.map((group, index) => {
                                if (group.type === 'single') {
                                    const { item } = group;
                                    const isAllowed = displayedTeams.length === 0
                                        ? true
                                        : displayedTeams.some(team => allData.permissionMap[team]?.[item.id]);

                                    return renderRow(item, isAllowed, !hasPageAccess || !isAllowed, expandedFeatureId === item.id, MousePointerClick, false, "border-b border-gray-50 dark:border-slate-800");
                                } else {
                                    // [한국어 설명] 2. 그룹 섹션 디자인 수정 (v3.22)
                                    // 배경색은 제거하고, 굵은 구분선과 좌측 보더만으로 섹션을 구분함
                                    return (
                                        <React.Fragment key={`grp-${group.name}-${index}`}>
                                            {/* [한국어 설명] 3. 일반 버튼과의 경계선 (12px 두께의 강력한 구분선) */}
                                            <tr>
                                                <td colSpan={10} className="h-[12px] bg-slate-200 dark:bg-slate-700"></td>
                                            </tr>

                                            {/* 그룹 헤더: 배경색 제거, 굵은 텍스트와 보더 유지 */}
                                            <tr className="border-t-4 border-slate-400 dark:border-slate-500 shadow-sm bg-white dark:bg-slate-900">
                                                <td colSpan={5 + Math.max(1, displayedTeams.length)} className="py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-3 h-8 bg-blue-700 rounded-sm"></div>
                                                        <span className="text-[20px] font-[900] text-blue-900 dark:text-blue-100 uppercase tracking-tighter">
                                                            {group.name}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* 그룹 내부 버튼들: 배경색 제거, 8px 좌측 보더 유지 */}
                                            {group.items.filter(item => item.name !== group.name && item.type !== 'dropdown').map((item) => {
                                                const isAllowed = displayedTeams.length === 0
                                                    ? true
                                                    : displayedTeams.some(team => allData.permissionMap[team]?.[item.id]);

                                                return renderRow(
                                                    item,
                                                    isAllowed,
                                                    !hasPageAccess || !isAllowed,
                                                    expandedFeatureId === item.id,
                                                    MousePointerClick,
                                                    true,
                                                    "border-l-[8px] border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800"
                                                );
                                            })}

                                            {/* 그룹 섹션 종료 구분선 */}
                                            <tr>
                                                <td colSpan={10} className="h-[12px] bg-slate-200 dark:bg-slate-700"></td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                }
                            });
                        })()}
                        {features.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-8 text-center text-gray-400 text-sm">
                                    이 페이지에 정의된 기능이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

MainContent.displayName = 'MainContent';
