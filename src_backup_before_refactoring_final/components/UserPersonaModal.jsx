
import React, { useState } from 'react';
import { X, UserPlus, Shield, CheckSquare, Square, Save } from 'lucide-react';
import { cn } from '../utils/cn';

export const UserPersonaModal = ({ isOpen, onClose, menuStructure, onCreatePersona }) => {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState(new Set()); // Set of IDs
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    if (!isOpen) return null;

    const togglePermission = (id) => {
        const next = new Set(selectedPermissions);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedPermissions(next);
    };

    const toggleExpand = (name) => {
        const next = new Set(expandedNodes);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        setExpandedNodes(next);
    };

    const handleCreate = () => {
        if (!name.trim()) return alert('페르소나 이름을 입력해주세요.');
        // Create Mock Permissions Object { "id": true/false }
        const perms = {};
        selectedPermissions.forEach(id => perms[id] = true);
        onCreatePersona(name, perms);
        onClose();
        setName('');
        setSelectedPermissions(new Set());
    };

    const renderNode = (node, depth = 0) => {
        const isExpanded = expandedNodes.has(node.name);
        const hasChildren = node.children && node.children.length > 0;
        const hasItems = node.items && node.items.length > 0;

        return (
            <div key={node.name} className="ml-4 border-l border-gray-200 dark:border-slate-700 pl-4 py-1">
                <div className="flex items-center gap-2">
                    {hasChildren && (
                        <button onClick={() => toggleExpand(node.name)} className="text-gray-400">
                            {isExpanded ? '-' : '+'}
                        </button>
                    )}
                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{node.name}</span>
                </div>

                {(isExpanded || !hasChildren) && (
                    <div className="mt-1 space-y-1">
                        {hasItems && node.items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded"
                                onClick={() => togglePermission(item.id)}
                            >
                                {selectedPermissions.has(item.id)
                                    ? <CheckSquare size={16} className="text-blue-500" />
                                    : <Square size={16} className="text-gray-300" />}
                                <span className={cn("text-xs text-gray-600 dark:text-slate-400", selectedPermissions.has(item.id) && "text-blue-600 dark:text-blue-400 font-medium")}>
                                    {item.name} ({item.type})
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {hasChildren && isExpanded && node.children.map(child => renderNode(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-[800px] h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-transparent dark:border-slate-800">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <UserPlus className="text-purple-500" />
                            가상 사용자 생성
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">원하는 권한 조합으로 테스트 계정을 만들어 시뮬레이션할 수 있습니다.</p>
                    </div>
                    <button onClick={onClose}>
                        <X size={24} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex gap-4">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                        placeholder="페르소나 이름 (예: 신규 입사자, 인턴)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Save size={18} /> 생성하기
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">권한 트리</h3>
                    {menuStructure.map(node => renderNode(node))}
                </div>
            </div>
        </div>
    );
};
