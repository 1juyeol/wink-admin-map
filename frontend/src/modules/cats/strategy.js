import { generalStrategy } from '../general/strategy.js';

/**
 * [v6.12.5] 캐츠(CATS) 전용 전략 (CODE FREEZE)
 * - 불필요한 폴더 계층 제거
 * - D3, D4 링크/클릭 기반 서브페이지 자동 승격 및 버튼 필터링 완료
 */
export const catsStrategy = {
    ...generalStrategy,
    preprocessRow: function (state) {
        const { gnb, lnb, d3, d4, d5, page, t1, t2 } = state;

        let finalPage = page;
        let subPage1 = null;

        if (!finalPage) {
            // 캐츠는 D3(학생회원 등)가 사실상 페이지 그룹/페이지이므로 이를 page로 승격
            if (d3 && !this.isFeature(d3)) finalPage = d3;
            else if (d4 && !this.isFeature(d4)) finalPage = d4;
        }

        // [v6.12.2] 캐츠(CATS) D3, D4 서브페이지 구현
        if (d3 && d3 !== finalPage && !d3.includes('[버튼]') && (d3.includes('(링크)') || d3.includes('(클릭)'))) {
            subPage1 = d3;
        } else if (d4 && d4 !== finalPage && !d4.includes('[버튼]') && (d4.includes('(링크)') || d4.includes('(클릭)'))) {
            subPage1 = d4;
        }

        return {
            ...state,
            d3: null, // 폴더 계층 제거
            d4: null,
            d5: null,
            page: finalPage,
            t1: t1,
            t2: t2,
            subPage1: subPage1
        };
    }
};
