
import React, { useMemo, useState } from 'react';
import { X, Layout, Layers, Box, Maximize2 } from 'lucide-react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

export const TreeMapModal = ({ isOpen, onClose, menuStructure }) => {
    if (!isOpen) return null;

    // Transform menu structure for Recharts
    const transformData = (nodes) => {
        return nodes.map(node => ({
            name: node.name,
            size: node.children ? node.children.length + 1 : 1, // Size based on complexity (children count)
            depth: node.children ? 2 : 1,
            children: node.children ? transformData(node.children) : undefined
        }));
    };

    const treeData = useMemo(() => transformData(menuStructure), [menuStructure]);

    // Custom Content for Treemap Nodes
    const CustomizedContent = (props) => {
        const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

        // Dynamic Color based on depth/category
        const color = depth === 1 ? '#3b82f6' :
            depth === 2 ? '#60a5fa' :
                '#93c5fd';

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: color, // custom logic needed for better colors
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                    }}
                />
                {width > 50 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight={depth === 1 ? 'bold' : 'normal'}
                    >
                        {name}
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">메뉴 구조 시각화 (Tree Map)</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">시스템 전체 메뉴의 깊이와 복잡도를 한눈에 파악합니다.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 relative bg-gray-50 dark:bg-slate-900">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            width={400}
                            height={200}
                            data={treeData}
                            dataKey="size"
                            ratio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                        >
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </Treemap>
                    </ResponsiveContainer>

                    <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs text-gray-500 border border-gray-200 dark:border-slate-700">
                        * 사각형 크기는 하위 메뉴의 개수(복잡도)를 나타냅니다.
                    </div>
                </div>
            </div>
        </div>
    );
};
