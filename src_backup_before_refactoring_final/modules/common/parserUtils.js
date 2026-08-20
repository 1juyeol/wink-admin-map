
/**
 * [한국어 설명] 모든 모듈에서 공통으로 사용하는 유틸리티 함수 및 파싱 엔진입니다. (v4.0.0)
 */

export const cleanValue = (val) => {
    if (!val) return null;
    return String(val).replace(/[\u00A0\u200B]/g, ' ').trim();
};

export const findOrCreateNode = (levelList, name, type = 'folder') => {
    let safeName = cleanValue(name);
    if (!safeName) return null;

    // [v5.1.2] 사용자 엑셀의 명칭을 임의로 수정하지 않고 그대로 사용합니다.

    let node = levelList.find(n => n.name === safeName);
    if (!node) {
        node = { name: safeName, type, children: [], items: [] };
        levelList.push(node);
    } else {
        // [v12.3] 구조적 위계 우선순위 교정: GNB/LNB는 최상위 구조이므로 하위 타입으로 덮어써지지 않도록 함
        const typePriority = { gnb: 100, lnb: 80, tab: 60, page: 40, folder: 20 };
        const newPriority = typePriority[type] || 0;
        const currentPriority = typePriority[node.type] || 0;
        if (newPriority > currentPriority) {
            node.type = type;
        }
    }
    return node;
};

export const createViewItem = (node, pathStr, desc) => {
    return {
        id: `view-${node.name || 'page'}-${pathStr}`,
        name: node.name,
        parentName: node.parentName,
        type: 'view',
        description: desc || "",
        requiredPermissions: [],
        accessibleTeams: []
    };
};
