
import * as XLSX from 'xlsx';
import { cleanValue, findOrCreateNode, createViewItem } from '../modules/common/parserUtils.js';
import { generalStrategy } from '../modules/general/strategy.js';
import { memberStrategy } from '../modules/member/strategy.js';
import { teacherStrategy } from '../modules/teacher/strategy.js';
import { staffStrategy } from '../modules/staff/strategy.js';
import { salesStrategy } from '../modules/sales/strategy.js';
import { statsStrategy } from '../modules/stats/strategy.js';

import { lcmsStrategy } from '../modules/lcms/strategy.js';
import { serviceStrategy } from '../modules/service/strategy.js';

const strategyMap = {
    '회원관리': memberStrategy,
    '교사관리': teacherStrategy,
    '직원관리': staffStrategy,
    '매출(회비)관리': salesStrategy,
    '통계관리': statsStrategy,
    '콘텐츠(LCMS)관리': lcmsStrategy,
    '서비스(운영)관리': serviceStrategy
};
const getStrategy = (gnbName) => strategyMap[gnbName] || generalStrategy;

export const parseExcel = async (input) => {
    try {
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
            const strategy = getStrategy(state.gnb);

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
            const p = strategy.preprocessRow ? strategy.preprocessRow({ ...state }) : { ...state };

            const pathNodes = [
                { name: p.gnb, type: 'gnb' }, { name: p.lnb, type: 'lnb' },
                { name: p.d3, type: 'folder' }, { name: p.d4, type: 'folder' }, { name: p.d5, type: 'folder' },
                { name: p.page, type: 'page' },
                { name: p.t1, type: (p.t1?.includes('(링크)') || p.t1?.includes('(트리)')) ? 'page' : 'tab' },
                { name: p.t2, type: (p.t2?.includes('(링크)') || p.t2?.includes('(트리)')) ? 'page' : 'tab' }
            ].filter(n => n.name && n.name !== '-');

            if (pathNodes.length === 0) return;

            let current = { children: menuStructure };
            pathNodes.forEach(n => {
                // 부모와 자식의 이름이 같으면 중복으로 간주하고 생성하지 않음 (LNB와 페이지 구분 없음)
                // 단, '탭'인 경우에는 부모와 이름이 같더라도 반드시 하위 노드로 생성함
                if (current.name === n.name && n.type !== 'tab') return;

                let target = current.children.find(child => child.name === n.name && (n.type === 'tab' ? child.type === 'tab' : true));
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

            const isNewPage = current.fullPath !== lastPagePath;
            const functionName = rButton || rDropdown;
            const isFeatureRow = strategy.isFeature(rButton) || strategy.isFeature(rDropdown);

            // [v6.4.4] 설명 보정값(p.desc) 우선 적용
            const targetDesc = p.desc || rDesc;
            if (targetDesc && !isFeatureRow && !viewItem.description) {
                viewItem.description = targetDesc;
            }

            if (functionName && !strategy.shouldFilterOut(functionName, rDesc, current.name)) {
                current.items.push({
                    id: excelRowIndex,
                    name: functionName,
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
            permissionMap[name] = rows.reduce((acc, r, i) => { acc[i + 2] = cleanValue(r[11])?.toUpperCase() === 'O'; return acc; }, {});
        });
        const cleanup = (nodes) => { nodes.forEach(n => { delete n.parent; if (n.children) cleanup(n.children); }); };
        cleanup(menuStructure);
        return { menuStructure, flatMenuMap, permissionMap, teams: Object.keys(permissionMap) };
    } catch (e) {
        console.error("Critical Parse Error:", e);
        return null;
    }
};
