
import { renderHook, act } from '@testing-library/react';
import { useLayoutState } from '../hooks/useLayoutState';
import { describe, it, expect, vi } from 'vitest';

describe('useLayoutState Hook', () => {

    // Mocking localStorage
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('사이드바는 기본적으로 열려 있어야 한다 (Default State)', () => {
        const { result } = renderHook(() => useLayoutState());
        expect(result.current.isSidebarOpen).toBe(true);
    });

    it('사이드바 토글 기능이 올바르게 동작해야 한다 (Toggle Test)', () => {
        const { result } = renderHook(() => useLayoutState());

        act(() => {
            result.current.setIsSidebarOpen(false);
        });

        expect(result.current.isSidebarOpen).toBe(false);

        act(() => {
            result.current.setIsSidebarOpen(true);
        });

        expect(result.current.isSidebarOpen).toBe(true);
    });

    it('다크 모드 토글 시 LocalStorage에 저장되어야 한다 (Dark Mode Test)', () => {
        const { result } = renderHook(() => useLayoutState());

        // Initial check: System preference or false
        const initial = result.current.darkMode;

        act(() => {
            result.current.toggleDarkMode();
        });

        expect(result.current.darkMode).not.toBe(initial);
        expect(localStorage.getItem('theme')).toBe(result.current.darkMode ? 'dark' : 'light');
    });

    it('showDiff 모달 상태가 독립적으로 토글되어야 한다 (Modal Test)', () => {
        // useLayoutState가 실제로 관리하는 모달 상태는 showDiff뿐임
        // (showPersona/showAudit은 코드베이스 전체에 존재하지 않는 상태명 — 이전 테스트의 오기)
        const { result } = renderHook(() => useLayoutState());

        act(() => {
            result.current.setShowDiff(true);
        });

        expect(result.current.showDiff).toBe(true);
    });
});
