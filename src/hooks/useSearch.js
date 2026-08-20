import { useState, useEffect, useMemo, useCallback } from 'react';

export const useSearch = (data) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchTargetId, setSearchTargetId] = useState(null);

    // Debounce the search query to prevent lag on rapid typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Create a flat index for O(1) lookup performance instead of O(N) deep traversal on every keystroke
    const flatIndex = useMemo(() => {
        if (!data || !data.menuStructure) return [];

        const index = [];
        const traverse = (nodes) => {
            nodes.forEach(node => {
                const nodeType = (node.type || '').toLowerCase().trim();
                const viewItem = node.items?.find(i => i.type === 'view');

                index.push({
                    type: nodeType,
                    name: node.name,
                    searchName: node.name.toLowerCase(),
                    node: node,
                    id: viewItem?.id,
                    path: node.fullPath,
                    parentName: node.parentName
                });

                if (node.items) {
                    node.items.forEach(item => {
                        const itemType = (item.type || '').toLowerCase().trim();
                        if (itemType !== 'view') {
                            index.push({
                                type: itemType,
                                name: item.name,
                                searchName: item.name.toLowerCase(),
                                node: node,
                                path: item.path,
                                id: item.id,
                                parentName: item.parentName
                            });
                        }
                    });
                }

                if (node.children) traverse(node.children);
            });
        };

        traverse(data.menuStructure);
        return index;
    }, [data]);

    // Fast search using flat index
    const searchResults = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) return [];

        const term = debouncedQuery.toLowerCase();

        // Simple array filter is substantially faster than recursive traversal
        const results = flatIndex.filter(item => item.searchName.includes(term));

        return results.slice(0, 500);
    }, [debouncedQuery, flatIndex]);

    const findNodeById = useCallback((id) => {
        if (!id || !flatIndex) return null;
        const found = flatIndex.find(item => item.id === id);
        return found ? found.node : null;
    }, [flatIndex]);

    const findNodeByPath = useCallback((path) => {
        if (!path || !flatIndex) return null;
        const found = flatIndex.find(item => item.path === path || item.node?.fullPath === path);
        return found ? found.node : null;
    }, [flatIndex]);

    const findNodeByName = useCallback((name) => {
        if (!name || !flatIndex) return null;

        // 1. Try exact match first
        let found = flatIndex.find(item => item.name === name);
        if (found) return found;

        // 2. Try cleaned match by stripping all square brackets and common type suffix words
        const cleanStr = (str) => {
            if (!str) return '';
            return str.replace(/[\[\]]/g, '')
                .replace(/(버튼|드롭다운|Button|Dropdown)/g, '')
                .trim();
        };

        const cleanTargetName = cleanStr(name);
        found = flatIndex.find(item => cleanStr(item.name) === cleanTargetName);

        // 3. Optional partial match if still not found, but exact-clean is robust.
        if (!found) {
            found = flatIndex.find(item => cleanStr(item.name).includes(cleanTargetName));
        }

        return found || null;
    }, [flatIndex]);

    return {
        searchQuery, setSearchQuery,
        debouncedQuery,
        isSearchFocused, setIsSearchFocused,
        searchTargetId, setSearchTargetId,
        searchResults,
        findNodeById, findNodeByPath, findNodeByName
    };
};
