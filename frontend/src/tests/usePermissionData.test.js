
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermissionData } from '../hooks/usePermissionData';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocking 'fetch' and internal helpers
global.fetch = vi.fn();
// Mocking 'excelParser' (We want to test if 'hook' calls it)
vi.mock('../utils/excelParser', () => ({
    parseExcel: vi.fn().mockResolvedValue({
        menuStructure: [
            { name: '대메뉴1', children: [{ name: '소메뉴1', id: 'page1' }] }
        ],
        permissionMap: { '팀A': { 'page1': true } },
        teams: ['팀A']
    }),
}));

describe('usePermissionData Hook', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        fetch.mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(8),
        });
    });

    it('초기화 시 로딩 상태여야 한다 (Initial Loading)', () => {
        const { result } = renderHook(() => usePermissionData());
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBe(null);
    });

    it('성공적으로 데이터를 로드해야 한다 (Success Loading)', async () => {
        // Wait for asynchronous useEffect
        const { result } = renderHook(() => usePermissionData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).not.toBeNull();
        expect(result.current.data.teams).toContain('팀A');
        expect(result.current.data.menuStructure.length).toBeGreaterThan(0);
    });

    it('페르소나 생성 시 가상 팀이 추가되어야 한다 (Persona Creation)', async () => {
        const { result } = renderHook(() => usePermissionData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const newPersona = { name: '새로운역할', permissions: {} };
        const previousTeamCount = result.current.data.teams.length;

        act(() => {
            result.current.handleCreatePersona(newPersona.name, newPersona.permissions);
        });

        // Check if virtual team is added (Prefixed with [Virtual])
        expect(result.current.data.teams.length).toBe(previousTeamCount + 1);
        const addedTeam = result.current.data.teams[result.current.data.teams.length - 1];
        expect(addedTeam).toContain('새로운역할');
        expect(addedTeam).toContain('[Virtual]');
    });
});
