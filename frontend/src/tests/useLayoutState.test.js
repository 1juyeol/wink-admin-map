
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

    it('모달 상태 제어가 독립적으로 동작해야 한다 (Modal Test)', () => {
        const { result } = renderHook(() => useLayoutState());

        act(() => {
            result.current.setShowPersona(true);
            result.current.setShowDiff(true);
        });

        expect(result.current.showPersona).toBe(true);
        expect(result.current.showDiff).toBe(true);
        expect(result.current.showAudit).toBe(false); // Should remain untouched
    });
});
