import React from 'react';
import { Users, CheckSquare, Layers, FileText, Folder, UserCheck, MousePointerClick } from 'lucide-react';

export const DESIGN_TOKENS = {
    gnb: {
        icon: (size = 18, strokeWidth = 2) => <Users size={size} strokeWidth={strokeWidth} />,
        className: "bg-white dark:bg-slate-900 text-blue-600 border-blue-200 shadow-sm rounded-xl",
        activeClassName: "bg-blue-500 text-white shadow-lg shadow-blue-400/20"
    },
    lnb: {
        icon: (size = 18, strokeWidth = 2) => <CheckSquare size={size} strokeWidth={strokeWidth} />,
        className: "bg-green-50 text-green-600 border-green-200 shadow-sm rounded-xl",
        activeClassName: "bg-green-500 text-white shadow-lg shadow-green-400/20"
    },
    tab: {
        icon: (size = 18, strokeWidth = 2) => <Layers size={size} strokeWidth={strokeWidth} />,
        className: "bg-purple-50 text-purple-600 border-purple-200 shadow-sm rounded-xl",
        activeClassName: "bg-purple-500 text-white shadow-lg shadow-purple-400/20"
    },
    page: {
        icon: (size = 18, strokeWidth = 2) => <FileText size={size} strokeWidth={strokeWidth} />,
        className: "bg-orange-50 text-orange-600 border-orange-200 shadow-sm rounded-xl",
        activeClassName: "bg-orange-500 text-white shadow-lg shadow-orange-400/20"
    },
    folder: {
        icon: (size = 18, strokeWidth = 2) => <Folder size={size} strokeWidth={strokeWidth} />,
        className: "bg-gray-50 text-gray-500 border-gray-200 shadow-sm rounded-xl",
        activeClassName: "bg-gray-500 text-white shadow-lg shadow-gray-400/20"
    },
    team: {
        icon: (size = 18, strokeWidth = 2) => <UserCheck size={size} strokeWidth={strokeWidth} />,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm rounded-xl",
        activeClassName: "bg-indigo-500 text-white shadow-lg shadow-indigo-400/20"
    },
    button: {
        icon: (size = 18, strokeWidth = 2.5) => <MousePointerClick size={size} strokeWidth={strokeWidth} />,
        className: "bg-sky-50 text-sky-600 border-sky-200 shadow-[0_3px_0_0_rgb(186,230,253)] active:shadow-none active:translate-y-[2px] rounded-lg font-bold transition-all border-b-2"
    },
    dropdown: {
        icon: (size = 18, strokeWidth = 2.5) => <Layers size={size} strokeWidth={strokeWidth} />,
        className: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 shadow-[0_3px_0_0_rgb(245,208,254)] active:shadow-none active:translate-y-[2px] rounded-lg font-bold transition-all border-b-2"
    }
};

export const getDesignByType = (type) => {
    const t = (type || '').toLowerCase().trim();
    return DESIGN_TOKENS[t] || DESIGN_TOKENS.page;
};
