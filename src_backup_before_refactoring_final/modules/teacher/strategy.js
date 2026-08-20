
import { generalStrategy } from '../general/strategy.js';

/**
 * [한국어 설명] 교사관리 특화 파싱 전략입니다. (v6.5.0)
 * 인사/조직 관리의 '팀 게시판 관리' 섹션도 '팀 교사관리'와 동일하게 계층을 평탄화합니다.
 */
export const teacherStrategy = {
    ...generalStrategy,

    preprocessRow: function (state, context) {
        let currentState = generalStrategy.preprocessRow(state);
        const { gnb, lnb, d3, d4, d5, page, t1, t2 } = currentState;

        if (gnb === '교사관리' && lnb === '인사/조직 관리') {
            const validTabs = ['교사관리', '팀관리', '센터관리', '지원자관리'];

            // --- 1. 팀 교사관리 섹션 ---

            // 1-1. 소속 탭(t1) 결정
            let finalTab = [t1, page, d3].find(n => validTabs.includes(n));

            // 1-2. (링크) 항목 결정
            const linkName = [t2, t1, page, d4, d3].find(n => n?.includes('(링크)'));

            if (linkName) {
                // (링크)가 있으면 '팀 교사관리' > '탭' > '페이지(링크)' 구조로 변환
                return {
                    ...currentState,
                    d3: null, d4: null, d5: null,
                    page: '팀 교사관리',
                    t1: finalTab || '교사관리',
                    t2: linkName
                };
            }

            // 1-3. 일반적인 '팀 교사관리' 섹션
            const isTeamTeacherSection = (
                d3 === '팀/교사 관리' ||
                page === '팀/교사 관리' ||
                validTabs.includes(d3) ||
                validTabs.includes(page)
            );

            if (isTeamTeacherSection) {
                return {
                    ...currentState,
                    d3: null, d4: null, d5: null,
                    page: '팀 교사관리',
                    t1: finalTab || page,
                    t2: null
                };
            }

            // --- 2. [v6.5.0] 팀 게시판 관리 섹션 ---
            const isBoardSection = (
                d3 === '팀 게시판 관리' ||
                page === '팀 게시판' ||
                t1 === '팀 게시판' ||
                t1 === '삭제된 팀 게시판'
            );

            if (isBoardSection) {
                let currentBoardTab = t1;
                // 페이지 이름이 탭 역할인 경우 (T1이 없을 때)
                if (!currentBoardTab && (page === '팀 게시판' || page === '삭제된 팀 게시판')) {
                    currentBoardTab = page;
                }

                return {
                    ...currentState,
                    d3: null, d4: null, d5: null,
                    page: '팀 게시판 관리', // 페이지명을 폴더명과 통일하여 3DEPTH 제거 효과
                    t1: currentBoardTab || '팀 게시판',
                    t2: null
                };
            }
        }

        return currentState;
    },

    shouldFilterOut: function (name, desc, pageName) {
        return generalStrategy.shouldFilterOut(name, desc, pageName);
    }
};
