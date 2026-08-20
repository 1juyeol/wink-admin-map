
import { generalStrategy } from '../../modules/general/strategy.js';

export const salesStrategy = {
    ...generalStrategy,

    preprocessRow: function (state) {
        // [v6.7.0] 매출관리 전용: 폴더 계층 평탄화
        const { d3, d4, page } = state;

        let finalPage = page;
        if (!finalPage) {
            if (d3 && !this.isFeature(d3)) finalPage = d3;
            else if (d4 && !this.isFeature(d4)) finalPage = d4;
        }

        return {
            ...state,
            d3: null, // 폴더 제거
            d4: null,
            d5: null,
            page: finalPage // 승격된 페이지명 사용
        };
    },

    shouldFilterOut: function (name, desc, pageName) {
        return generalStrategy.shouldFilterOut(name, desc, pageName);
    }
};
