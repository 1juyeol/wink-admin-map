
import { cleanValue } from '../common/parserUtils.js';

/**
 * [한국어 설명] 범용적인 엑셀 파싱 전략입니다. (v6.7.0)
 * 기존의 generalStrategy로 원복합니다. (직원/매출/통계는 전용 파일로 이관됨)
 */
export const generalStrategy = {
    // 기능 키워드 탐지
    actionRegex: /\[.*\]|버튼|드롭다운|Action|Button|Tab|Popup|팝업|\(팝업\)|\(탭\)|\(Action\)/i,
    navRegex: /[\[\(](트리|항목)[\]\)]|항목$|트리$/i,

    // [v6.3.3] 전처리 로직 초기화: 엑셀 데이터를 그대로 통과시킴
    preprocessRow: function (state) {
        return state;
    },

    // 상세 기능으로 간주할지 여부
    isFeature: function (val) {
        if (!val) return false;
        return this.actionRegex.test(val) && !this.navRegex.test(val);
    },

    // 페이지 정의 행인지 여부
    isPageRow: function (params) {
        const { pageName, prevPage, rawButton, rawDropdown, depthFeature, desc, rawTab1, rawTab2 } = params;
        const introKeywords = ['페이지 소개', '페이지 안내', '기능 요약', '페이지 개요', '안내 가이드', '시스템 가이드'];
        const isIntro = (rawButton && introKeywords.some(k => rawButton.includes(k))) ||
            (depthFeature && introKeywords.some(k => depthFeature.includes(k)));

        if (!isIntro && (this.isFeature(rawButton) || this.isFeature(rawDropdown) || this.isFeature(depthFeature))) return false;
        if (rawTab1 || rawTab2) return false;

        return (
            (!!pageName && (pageName !== prevPage)) ||
            (!!pageName && !rawButton && !rawDropdown && !depthFeature && !!desc) ||
            (rawButton === pageName && !!desc) ||
            (rawButton === '-' && desc && desc.length > 50) ||
            isIntro
        );
    },

    // 텍스트 필터링
    shouldFilterOut: function (itemName, desc, pageName) {
        if (!itemName) return true;
        if (this.actionRegex.test(itemName) && (itemName === pageName)) return true;
        if (itemName === '-') return true;
        const introKeywords = ['페이지 소개', '페이지 안내', '기능 요약', '페이지 개요', '안내 가이드', '시스템 가이드'];
        return introKeywords.some(k => itemName.includes(k) || (desc && desc.includes(k)));
    }
};
