/*
 * NO TOUCH, FROZEN
 */

import { generalStrategy } from '../../modules/general/strategy.js';

export const lcmsStrategy = {
    ...generalStrategy,

    // [v6.9.6] 통합 상태 변수
    currentGnb: null,
    currentLnb: null,
    currentTabContext: null,
    currentSubPage1: null,
    currentSubPage2: null,

    preprocessRow: function (state) {
        // [v6.9.6] 교재/교보재 관리 구조 단순화: T1 무시하고 교재/교보재 페이지로 직행
        const { gnb, lnb } = state;

        if (gnb !== this.currentGnb || lnb !== this.currentLnb) {
            this.currentGnb = gnb;
            this.currentLnb = lnb;
            this.currentTabContext = null;
            this.currentSubPage1 = null;
            this.currentSubPage2 = null;
        }

        if (gnb !== '콘텐츠(LCMS)관리') {
            return generalStrategy.preprocessRow(state);
        }

        // 1. 교재/교보재 관리 전용 로직 (우선 처리)
        if (lnb === '교재/교보재 관리') {
            return this.processTextbook(state);
        }

        // 2. 나머지 LCMS 메뉴 (커리큘럼, 전시, 리소스)
        if (['커리큘럼 관리', '콘텐츠 전시 관리', '콘텐츠 리소스 관리'].includes(lnb)) {
            return this.processLCMSGeneric(state);
        }

        return this.flattenDefault(state);
    },

    // [Helper] 교재/교보재 관리 전용
    processTextbook: function (state) {
        const { d3, d4, d5, page, t1 } = state;

        // T1(탭) 무시하고 오직 D3(콘텐츠 구분)에 따라 페이지 결정
        // 엑셀 데이터상 D3에 '교재 콘텐츠 제목(링크)' 또는 '교보재 콘텐츠 제목(링크)'라고 적혀 있음.

        const rawValues = [String(d3 || ''), String(d4 || ''), String(page || '')];

        let targetPage = null;

        if (rawValues.some(v => v.includes('교재 콘텐츠 제목'))) {
            targetPage = '교재 콘텐츠 제목(링크)';
        } else if (rawValues.some(v => v.includes('교보재 콘텐츠 제목'))) {
            targetPage = '교보재 콘텐츠 제목(링크)';
        }

        // 만약 식별되지 않았다면? -> 기존 값 유지 (Sticky)
        if (targetPage) {
            this.currentSubPage1 = targetPage;
        }

        // T1과 D3, D4를 모두 날리고 LNB 바로 아래 SubPage1을 붙임
        // 구조: [LNB] > [SubPage1]

        // 만약 현재 행이 단지 탭/페이지 정의용이라면 내용 없이 리턴
        if (!d3 && !d4 && !page) return { ...state, d3: null, d4: null, d5: null, page: '교재/교보재 관리', t1: null, subPage1: null };

        return {
            ...state,
            d3: null, d4: null, d5: null,
            page: '교재/교보재 관리', // 1Depth (LNB 겸용)
            t1: null,                 // T1 제거 (탭 없음)
            t2: null,
            subPage1: this.currentSubPage1, // 교재 or 교보재 페이지
            subPage2: null
        };
    },

    // [Helper] LCMS 범용 처리 로직 (커리큘럼, 전시, 리소스)
    processLCMSGeneric: function (state) {
        const { d3, d4, d5, page, t1 } = state;

        const upperKeywords = [
            '회차', '주차', '호', '품목', '영역', '단계',
            '카테고리명', '콘텐츠 제목'
        ];
        const lowerKeywords = ['일차', '차시', '권호', '코너'];
        const allKeywords = [...upperKeywords, ...lowerKeywords];

        // 1. 탭 컨텍스트 결정 (T1)
        const rawValues = [String(t1 || ''), String(page || ''), String(d3 || ''), String(d4 || ''), String(d5 || '')];
        const hasTodayKeyword = rawValues.some(v => v.includes('오늘의 공부'));

        if (hasTodayKeyword) {
            this.currentTabContext = '오늘의 공부';
        } else if (t1 && t1 !== '-') {
            const isStructure = allKeywords.some(k => t1.includes(k));
            if (!isStructure) {
                this.currentTabContext = t1;
                this.currentSubPage1 = null;
                this.currentSubPage2 = null;
            }
        }

        // 2. 페이지 매핑
        if (this.currentTabContext) {
            let matchedUpper = null;
            let matchedLower = null;
            const checkValues = [d3, d4, d5, page];

            for (const val of checkValues) {
                if (val && upperKeywords.some(k => val.includes(k))) { matchedUpper = val; break; }
            }
            for (const val of checkValues) {
                if (val && lowerKeywords.some(k => val.includes(k))) { matchedLower = val; break; }
            }

            if (matchedUpper) {
                this.currentSubPage1 = matchedUpper;
                this.currentSubPage2 = null;
            }
            if (matchedLower) {
                if (this.currentSubPage1) {
                    this.currentSubPage2 = matchedLower;
                } else {
                    this.currentSubPage1 = matchedLower; // 승격
                    this.currentSubPage2 = null;
                }
            }

            if (t1 === this.currentTabContext && !d3 && !d4 && !page) {
                // 부모 페이지 이름 결정 (LNB 사용)
                const parentPageName = state.lnb;
                return { ...state, page: parentPageName, t1: this.currentTabContext, subPage1: null, subPage2: null };
            }

            const parentPageName = state.lnb;

            return {
                ...state,
                d3: null, d4: null, d5: null,
                page: parentPageName,        // 1Depth
                t1: this.currentTabContext,  // 2Depth (Tab)
                t2: null,
                subPage1: this.currentSubPage1, // 3Depth
                subPage2: this.currentSubPage2  // 4Depth
            };
        }

        return this.flattenDefault(state);
    },

    flattenDefault: function (state) {
        const { page, d3, d4 } = state;
        let finalPage = page;
        if (!finalPage) {
            if (d3 && !this.isFeature(d3)) finalPage = d3;
            else if (d4 && !this.isFeature(d4)) finalPage = d4;
        }
        return {
            ...state,
            d3: null, d4: null, d5: null,
            page: finalPage
        };
    },

    shouldFilterOut: function (name, desc, pageName) {
        return generalStrategy.shouldFilterOut(name, desc, pageName);
    }
};
