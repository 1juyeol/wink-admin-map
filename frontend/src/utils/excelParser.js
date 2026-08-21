
// XLSX static import 제거 - 빌드 스택 오버플로우 방지 및 런타임 최적화
import { cleanValue, findOrCreateNode, createViewItem } from '../modules/common/parserUtils.js';
import { generalStrategy } from '../modules/general/strategy.js';
import { memberStrategy } from '../modules/member/strategy.js';
import { teacherStrategy } from '../modules/teacher/strategy.js';
import { staffStrategy } from '../modules/staff/strategy.js';
import { salesStrategy } from '../modules/sales/strategy.js';
import { statsStrategy } from '../modules/stats/strategy.js';

import { lcmsStrategy } from '../modules/lcms/strategy.js';
import { serviceStrategy } from '../modules/service/strategy.js';
import { marketingStrategy } from '../modules/marketing/strategy.js';
import { itemStrategy } from '../modules/item/strategy.js';
import { systemStrategy } from '../modules/system/strategy.js';
import { catsStrategy } from '../modules/cats/strategy.js';

const strategyMap = {
    '회원관리': memberStrategy,
    '교사관리': teacherStrategy,
    '직원관리': staffStrategy,
    '매출(회비)관리': salesStrategy,
    '통계관리': statsStrategy,
    '콘텐츠(LCMS)관리': lcmsStrategy,
    '서비스(운영)관리': serviceStrategy,
    '마케팅 관리': marketingStrategy,
    '품목 관리': itemStrategy,
    '시스템 관리': systemStrategy,
    '캐츠': catsStrategy,
    // [v6.11.2] GNB 누락 대비: LNB로 매핑 (학부모, 학습기 설정 등)
    '학부모': serviceStrategy,
    '학습기 설정': serviceStrategy,
    '학생': serviceStrategy,
    '학교공부': lcmsStrategy
};
const getStrategy = (gnbName, lnbName) => strategyMap[gnbName] || strategyMap[lnbName] || generalStrategy;

export const parseExcel = async (input) => {
    try {
        const XLSX = await import('xlsx');
        let arrayBuffer;
        if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
            arrayBuffer = input;
        } else {
            const response = await fetch(input);
            arrayBuffer = await response.arrayBuffer();
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        const menuSheet = workbook.Sheets[sheetNames[1]] || workbook.Sheets[sheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(menuSheet, { header: 1, blankrows: true, defval: '' }).slice(1);

        const menuStructure = [];
        const flatMenuMap = {};

        let state = { gnb: null, lnb: null, d3: null, d4: null, d5: null, page: null, t1: null, t2: null };
        let lastPagePath = null;

        rawRows.forEach((row, index) => {
            const excelRowIndex = index + 2;
            if (!row || row.length === 0) return;

            const rGnb = cleanValue(row[1]);
            const rLnb = cleanValue(row[2]);
            const rD3 = cleanValue(row[3]);
            const rD4 = cleanValue(row[4]);
            const rD5 = cleanValue(row[5]);
            const rPage = cleanValue(row[6]);
            const rT1 = cleanValue(row[7]);
            const rT2 = cleanValue(row[8]);
            const rDropdown = cleanValue(row[9]);
            const rButton = cleanValue(row[10]);
            const rDesc = cleanValue(row[12]);

            if (rGnb && rGnb !== state.gnb) {
                state = { gnb: rGnb, lnb: null, d3: null, d4: null, d5: null, page: null, t1: null, t2: null };
            }
            const strategy = getStrategy(state.gnb, state.lnb);

            if (rLnb && rLnb !== state.lnb && !strategy.isFeature(rLnb)) {
                state.lnb = rLnb; state.d3 = null; state.d4 = null; state.d5 = null; state.page = null; state.t1 = null; state.t2 = null;
            }
            if (rD3 && rD3 !== state.d3 && !strategy.isFeature(rD3)) {
                state.d3 = rD3; state.d4 = null; state.d5 = null; state.page = null; state.t1 = null; state.t2 = null;
            }
            if (rD4 && rD4 !== state.d4 && !strategy.isFeature(rD4)) {
                state.d4 = rD4; state.d5 = null; state.page = null; state.t1 = null; state.t2 = null;
            }
            if (rD5 && rD5 !== state.d5 && !strategy.isFeature(rD5)) {
                state.d5 = rD5; state.page = null; state.t1 = null; state.t2 = null;
            }
            if (rPage && rPage !== state.page && !strategy.isFeature(rPage)) {
                state.page = rPage; state.t1 = null; state.t2 = null;
            }
            if (rT1 && rT1 !== state.t1 && !strategy.isFeature(rT1)) {
                state.t1 = rT1; state.t2 = null;
            }
            if (rT2 && rT2 !== state.t2 && !strategy.isFeature(rT2)) {
                state.t2 = rT2;
            }

            if (!state.gnb) return;

            // [v6.11.2] 최신화된 lnb로 전략 재결정 (GNB 값이 비어있을 때 lnb가 결정적인 단서가 됨)
            const finalStrategy = getStrategy(state.gnb, state.lnb);
            const p = finalStrategy.preprocessRow ? finalStrategy.preprocessRow({ ...state }) : { ...state };

            const pathNodes = [
                { name: p.gnb, type: 'gnb' }, { name: p.lnb, type: 'lnb' },
                { name: p.d3, type: 'folder' }, { name: p.d4, type: 'folder' }, { name: p.d5, type: 'folder' },
                { name: p.page, type: 'page' },
                { name: p.t1, type: (p.t1?.includes('(링크)') || p.t1?.includes('(트리)')) ? 'page' : 'tab' },
                { name: p.t2, type: (p.t2?.includes('(링크)') || p.t2?.includes('(트리)')) ? 'page' : 'tab' },
                // [v12.0.1] LCMS 오늘의 공부 계층 구현을 위한 추가 페이지 계층
                { name: p.subPage1, type: 'page' },
                { name: p.subPage2, type: 'page' }
            ].filter(n => n.name && n.name !== '-');

            if (pathNodes.length === 0) return;

            let current = { children: menuStructure };
            pathNodes.forEach(n => {
                // 부모와 자식의 이름이 같으면 중복으로 간주하고 생성하지 않음 (LNB와 페이지 구분 없음)
                // 단, '탭'인 경우에는 부모와 이름이 같더라도 반드시 하위 노드로 생성함
                if (current.name === n.name && n.type !== 'tab') return;

                // [v12.0] 중복 노드 처리 통합: 이름이 같으면 동일 노드로 간주하여 타입이 덮여버리는 문제 방지
                let target = current.children.find(child => child.name === n.name);
                if (!target) {
                    target = findOrCreateNode(current.children, n.name, n.type);
                    target.parentName = current.name;
                    target.fullPath = current.fullPath ? `${current.fullPath} > ${n.name}` : n.name;
                }

                current = target;
            });

            if (!current.items.find(i => i.type === 'view')) {
                current.items.unshift(createViewItem(current, current.fullPath, ""));
            }
            const viewItem = current.items.find(i => i.type === 'view');

            // const isNewPage = current.fullPath !== lastPagePath; // Removed unused variable
            const rawFunctionName = rButton || rDropdown;

            // [v8.9] 사용자 요청 기반 명칭 매핑 및 분리 로직 고도화
            let functionName = rawFunctionName;
            if (functionName) {
                // 1. 단순 치환 (업무 -> 단건상담 등록)
                if (functionName.includes('업무')) {
                    functionName = '단건상담 등록';
                }
            }

            const isFeatureRow = strategy.isFeature(rawFunctionName);

            // [v6.11.6] 페이지/탭 자체의 권한 행(Button/Dropdown이 없는 행)의 ID를 view 아이템에 부여하여 
            // 해당 행의 'O/X' 권한이 딤처리에 반영되도록 개선
            if (!functionName && (!viewItem.id || typeof viewItem.id !== 'number')) {
                viewItem.id = excelRowIndex;
            }

            // [v6.4.4] 설명 보정값(p.desc) 우선 적용
            const targetDesc = p.desc || rDesc;
            if (targetDesc && !isFeatureRow && !viewItem.description) {
                viewItem.description = targetDesc;
            }

            if (functionName && !strategy.shouldFilterOut(functionName, rDesc, current.name)) {
                const cleanName = functionName.replace(/^\[|\]$/g, '').trim();
                current.items.push({
                    id: excelRowIndex,
                    name: cleanName,
                    type: rButton ? 'button' : 'dropdown',
                    path: current.fullPath,
                    parentName: current.name,
                    description: rDesc || "",
                    group: (rDropdown && rDropdown !== '-' && rDropdown !== 'N/A') ? rDropdown.replace(/드롭다운[:\s]*/g, '').trim() : null,
                    gnb: state.gnb, page: current.name
                });
            }

            lastPagePath = current.fullPath;
        });

        const permissionMap = {};
        sheetNames.slice(2).forEach(name => {
            const s = workbook.Sheets[name];
            if (!s) return;
            const rows = XLSX.utils.sheet_to_json(s, { header: 1, defval: '' }).slice(1);
            permissionMap[name] = rows.reduce((acc, r, i) => {
                const val = cleanValue(r[11])?.toUpperCase();
                // [v9.8] 다양한 'O' 표시 대응 (O, ○, ㅇ, 1, V, CHK)
                acc[i + 2] = (val === 'O' || val === '○' || val === 'ㅇ' || val === '1' || val === 'V' || val === 'CHK');
                return acc;
            }, {});
        });

        const sortedTeams = Object.keys(permissionMap);


        const cleanup = (nodes) => { nodes.forEach(n => { delete n.parent; if (n.children) cleanup(n.children); }); };
        cleanup(menuStructure);
        return { menuStructure, flatMenuMap, permissionMap, teams: sortedTeams };
    } catch (e) {
        console.error("Critical Parse Error:", e);
        return null;
    }
};
