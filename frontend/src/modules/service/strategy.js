
import { generalStrategy } from '../../modules/general/strategy.js';

export const serviceStrategy = {
    ...generalStrategy,

    preprocessRow: function (state) {
        // [v6.11.0] 서비스(운영)관리 확장: 학습기 설정 및 학부모 메뉴 대응
        // [v6.11.5] GNB 강제 보정 (엑셀에서 GNB가 비어있어 이전 메뉴(학생 등)로 잘못 붙는 것 방지)
        const { gnb, lnb, d3, d4, d5, page, t1 } = state;

        let fixedGnb = gnb;
        if (['학습기 설정', '학부모'].includes(lnb)) {
            fixedGnb = '서비스(운영)관리';
        }

        // GNB가 서비스(운영)관리가 아니라면 일반 처리를 하려 했으나,
        // 위에서 강제 보정했으므로 이제 서비스 로직을 타게 됨.
        if (fixedGnb !== '서비스(운영)관리' && !gnb) {
            return generalStrategy.preprocessRow(state);
        }

        // 1. 학습기 설정
        if (lnb === '학습기 설정') {
            let currentTab = t1;
            if (currentTab && currentTab.includes('학습 알림 팝업 관리')) {
                if (d4 && d4.includes('(링크)')) {
                    return {
                        ...state,
                        gnb: fixedGnb, // [Fix] GNB 보정 적용
                        d3: null, d4: null, d5: null,
                        page: '학습기 설정',
                        t1: currentTab,
                        subPage1: d4,
                        subPage2: null
                    };
                }
            }
            return {
                ...state,
                gnb: fixedGnb, // [Fix] GNB 보정 적용
                d3: null, d4: null, d5: null,
                page: '학습기 설정',
                t1: currentTab,
                subPage1: null,
                subPage2: null
            };
        }

        // 2. 학부모
        if (lnb === '학부모') {
            const { t2 } = state;
            // D3가 페이지 역할 (메인관리, 배너 관리 등)
            const targetPage = d3 || page;

            // 메인관리인 경우, T1 탭과 D4 서브페이지 처리
            if (targetPage === '메인관리') {
                const targetTab = t1;
                let subPage = null;

                // 2-1. 팝업 설정 (공백 제거 비교로 안전성 확보)
                const cleanTab = (targetTab || '').replace(/\s+/g, '');
                if (cleanTab === '팝업설정') {
                    if (d4 && d4.includes('(링크)')) subPage = d4;
                }
                // 2-2. 학습자료실
                else if (targetTab === '학습자료실') {
                    if (d4 && d4.includes('(링크)')) subPage = d4;
                    // 441행 '신규등록'은 (링크)가 없으므로 subPage = null -> 아이템으로 처리됨
                }

                return {
                    ...state,
                    gnb: fixedGnb, // [Fix] GNB 보정 적용
                    d3: null, d4: null, d5: null,
                    page: targetPage,
                    t1: targetTab,
                    subPage1: subPage,
                    subPage2: null
                };
            }

            // [v6.11.7] 배너 관리 - 탭 하위 개별 배너 서브페이지 처리
            if (targetPage === '배너 관리') {
                // 1. 학부모앱 등 2차 탭(T2)이 있는 경우 전용 처리 (기존 로직 유지 및 강화)
                if (t1 === '학부모앱') {
                    const targetBanners = [
                        '메인 롤링 배너',
                        '왼쪽 햄버거 메뉴 내 배너',
                        '메인화면 플로팅 말풍선',
                        '신한은행 계좌 등록 완료 페이지 배너'
                    ];
                    if (targetBanners.includes(t2)) {
                        if (d4 && !d4.includes('[버튼]') && (d4.includes('(링크)') || d4.includes('(클릭)'))) {
                            return {
                                ...state,
                                gnb: fixedGnb,
                                d3: null, d4: null, d5: null,
                                page: targetPage,
                                t1: t1,
                                t2: t2,
                                subPage1: d4,
                                subPage2: null
                            };
                        }
                    }
                }

                // 2. 모바일웹, PC웹 등 일반 탭 하위 D4 서브페이지 처리 (버튼 제외)
                // [v6.11.8] '모바일웹' 탭부터 개별 D4 페이지 구현 대응
                if (d4 && !d4.includes('[버튼]') && (d4.includes('(링크)') || d4.includes('(클릭)'))) {
                    return {
                        ...state,
                        gnb: fixedGnb,
                        d3: null, d4: null, d5: null,
                        page: targetPage,
                        t1: t1,
                        t2: (t2 && t2 !== '-') ? t2 : null,
                        subPage1: d4,
                        subPage2: null
                    };
                }
            }

            // [v6.11.9] 게시글 관리, 육아교육백과, 이벤트 관리, 푸시 관리 D4 서브페이지 구현
            const autoSubPagePages = ['게시글 관리', '육아교육백과', '이벤트 관리', '푸시 관리'];
            if (autoSubPagePages.includes(targetPage)) {
                if (d4 && !d4.includes('[버튼]') && (d4.includes('(링크)') || d4.includes('(클릭)'))) {
                    return {
                        ...state,
                        gnb: fixedGnb,
                        d3: null, d4: null, d5: null,
                        page: targetPage,
                        t1: t1,
                        t2: (t2 && t2 !== '-') ? t2 : null,
                        subPage1: d4,
                        subPage2: null
                    };
                }
            }

            // 그 외 학부모 메뉴 -> 탭 없이 페이지로만
            return {
                ...state,
                gnb: fixedGnb, // [Fix] GNB 보정 적용
                d3: null, d4: null, d5: null,
                page: targetPage,
                t1: t1,
                subPage1: null,
                subPage2: null
            };
        }

        // 그 외 서비스(운영)관리
        let finalPage = page;
        if (!finalPage) {
            if (d3 && !this.isFeature(d3)) finalPage = d3;
            else if (d4 && !this.isFeature(d4)) finalPage = d4;
        }

        return {
            ...state,
            gnb: fixedGnb, // [Fix] GNB 보정 적용
            d3: null, d4: null, d5: null,
            page: finalPage,
            t1: t1,
            t2: state.t2
        };
    },

    // [v6.11.6] '팝업설정'은 탭 이름이므로 기능(버튼)으로 분류하지 않도록 오버라이드
    isFeature: function (val) {
        if (!val) return false;
        // '팝업설정'은 탭 이름 - 기능으로 분류 제외
        const tabNames = ['팝업설정', '팝업 설정', '롤링메시지관리', '학습자료실', '학습 알림 팝업 관리', '윙크 소식 당첨자 일괄 등록'];
        if (tabNames.some(t => val.includes(t))) return false;
        return generalStrategy.isFeature(val);
    },

    shouldFilterOut: function (name, desc, pageName) {
        return generalStrategy.shouldFilterOut(name, desc, pageName);
    }
};
