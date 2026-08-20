import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastTimersRef = useRef({});

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        if (toastTimersRef.current[id]) {
            clearTimeout(toastTimersRef.current[id]);
            delete toastTimersRef.current[id];
        }
    }, []);

    const showToast = useCallback((msg, type = 'info') => {
        const filteredMsg = msg
            .replace(/\b(page|button|tab|dropdown)\b/gi, '')
            .replace(/\(\s*\)/g, '')
            .trim();

        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => {
            if (prev.some(t => t.msg === filteredMsg)) return prev;
            return [...prev, { id, msg: filteredMsg, type }];
        });

        toastTimersRef.current[id] = setTimeout(() => {
            dismissToast(id);
        }, 3000);
    }, [dismissToast]);

    useEffect(() => {
        const currentTimers = toastTimersRef.current;
        return () => {
            Object.values(currentTimers).forEach(timer => clearTimeout(timer));
        };
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-[90px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 print:hidden items-center w-full pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-top-full duration-300 pointer-events-auto",
                            toast.type === 'success' ? "bg-white border-green-500 text-green-700 dark:bg-green-900/90 dark:text-green-100" :
                                toast.type === 'error' ? "bg-white border-red-500 text-red-700 dark:bg-red-900/90 dark:text-red-100" :
                                    toast.type === 'warning' ? "bg-white border-amber-500 text-amber-700 dark:bg-amber-900/90 dark:text-amber-100" :
                                        "bg-white border-blue-500 text-blue-700 dark:bg-blue-900/90 dark:text-blue-100"
                        )}
                    >
                        <span className="font-extrabold text-sm tracking-tight">{toast.msg}</span>
                        <button onClick={() => dismissToast(toast.id)} className="p-1 hover:bg-black/5 rounded-full transition-colors pointer-events-auto">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
