import { generalStrategy } from '../general/strategy.js';

/**
 * [v6.12.5] 마케팅 관리 전용 전략 (CODE FREEZE)
 * - 불필요한 폴더 계층 제거
 * - D3, D4 링크/클릭 기반 서브페이지 자동 승격 및 버튼 필터링 완료
 */
export const marketingStrategy = {
    ...generalStrategy,
    preprocessRow: function (state) {
        const { gnb, lnb, d3, d4, d5, page, t1, t2 } = state;

        let finalPage = page;
        let subPage1 = null;

        // [v6.12.2] 페이지 승격 로직: 의미 있는 텍스트가 있으면 페이지로 사용
        if (!finalPage) {
            if (d3 && !this.isFeature(d3)) finalPage = d3;
            else if (d4 && !this.isFeature(d4)) finalPage = d4;
        }

        // D3, D4에 링크/클릭이 있고 버튼이 아니면 서브페이지로 승격
        // (단, 이미 해당 텍스트가 페이지로 쓰이고 있다면 중복 방지)
        if (d3 && d3 !== finalPage && !d3.includes('[버튼]') && (d3.includes('(링크)') || d3.includes('(클릭)'))) {
            subPage1 = d3;
        } else if (d4 && d4 !== finalPage && !d4.includes('[버튼]') && (d4.includes('(링크)') || d4.includes('(클릭)'))) {
            subPage1 = d4;
        }

        return {
            ...state,
            d3: null, // 계층 단순화를 위해 폴더 타입 제거
            d4: null,
            d5: null,
            page: finalPage,
            t1: t1,
            t2: t2,
            subPage1: subPage1
        };
    }
};
