
import { useState, useCallback } from 'react';

export function useUrlState() {
    const [urlState, setUrlState] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const teams = params.get('teams');
        const nodeId = params.get('node');
        return {
            selectedTeams: teams ? teams.split(',') : [],
            activeNodeId: nodeId ? parseInt(nodeId, 10) : null
        };
    });

    const updateUrl = useCallback((newState) => {
        const params = new URLSearchParams(window.location.search);

        if (newState.selectedTeams !== undefined) {
            if (newState.selectedTeams.length > 0) {
                params.set('teams', newState.selectedTeams.join(','));
            } else {
                params.delete('teams');
            }
        }

        // Note: We need a way to track node IDs consistently.
        // In our parser, items have IDs, but folders (GNB/LNB) don't explicitly have unique stable IDs in the parser output currently 
        // unless we strictly use index. 
        // For now, we will assume the structure name path is unique or add IDs to nodes in parser.
        // Let's rely on 'node path' or similar if possible, or just ignore node persistence if too complex for now?
        // User asked for "Refresh -> same position". So we need node persistence.
        // Let's use the 'path' string for nodes if available, or just use the node name if unique enough.
        // Update: I'll use a simple path string "GNB>LNB>Depth" for referencing.

        if (newState.activeNodePath) {
            params.set('path', newState.activeNodePath);
        } else if (newState.activeNodePath === null) {
            params.delete('path');
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        setUrlState(prev => ({ ...prev, ...newState }));
    }, []);

    return [urlState, updateUrl];
}
