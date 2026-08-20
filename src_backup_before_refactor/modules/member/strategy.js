
import { generalStrategy } from '../general/strategy.js';

export const memberStrategy = {
    ...generalStrategy,

    preprocessRow: function (state, context) {
        let currentState = generalStrategy.preprocessRow(state);
        const { lnb, d3, page } = currentState;

        // 학부모회원 > 이름(링크) 병합
        if (lnb === '학부모회원' && d3 === '이름(링크)') {
            currentState = { ...currentState, d3: null, page: '이름(링크)' };
        }

        // 학생회원 검색 설명 고정 (지시하신 텍스트만)
        if (lnb === '학생회원 검색' || page === '학생회원 검색') {
            currentState = { ...currentState, desc: '학생회원을 검색할 수 있는 메뉴입니다.' };
        }

        return currentState;
    },

    shouldFilterOut: function (name, desc, pageName) {
        return generalStrategy.shouldFilterOut(name, desc, pageName);
    }
};
