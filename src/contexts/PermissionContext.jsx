import React, { createContext, useContext, useState, useMemo } from 'react';
import { useUrlState } from '../hooks/useUrlState';
import { usePermissionData } from '../hooks/usePermissionData';
import { useSearch } from '../hooks/useSearch';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
    const { data, loading, handleJsonExport } = usePermissionData();
    const [{ selectedTeams }, updateUrl] = useUrlState();

    // Core App State
    const searchParams = useSearch(data);

    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [compareTeams, setCompareTeams] = useState([]);

    const [activeNode, setActiveNode] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Provide derived analytics
    const teamAccessAnalysis = useMemo(() => {
        if (!data || !data.teams || !data.permissionMap) return {};
        const totalItems = [];
        const leafNodes = [];
        const traverse = (nodes) => {
            nodes.forEach(node => {
                if (node.items) {
                    const buttons = node.items.filter(i => i.type !== 'view');
                    totalItems.push(...buttons);
                }
                if ((!node.children || node.children.length === 0) && (node.type === 'page' || node.type === 'tab')) {
                    leafNodes.push(node);
                }
                if (node.children) traverse(node.children);
            });
        };
        traverse(data.menuStructure);

        return {
            totalItems, leafNodes
        };
    }, [data]);

    const value = useMemo(() => ({
        data, loading, handleJsonExport,
        selectedTeams, updateUrl,
        ...searchParams,
        isAdmin, setIsAdmin,
        isCompareMode, setIsCompareMode,
        compareTeams, setCompareTeams,
        activeNode, setActiveNode,
        isRefreshing, setIsRefreshing,
        teamAccessAnalysis
    }), [
        data, loading, handleJsonExport,
        selectedTeams, updateUrl,
        searchParams, // Since searchParams is an object, we just pass the object as a dependency (useSearch must memoize its return or we spread its properties manually)
        isAdmin, isCompareMode, compareTeams,
        activeNode, isRefreshing, teamAccessAnalysis
    ]);

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};
