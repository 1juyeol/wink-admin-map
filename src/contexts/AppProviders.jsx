import React from 'react';
import { ToastProvider } from './ToastContext';
import { PermissionProvider } from './PermissionContext';
import { BookmarkProvider } from './BookmarkContext';
import { LayoutProvider } from './LayoutContext';

export const AppProviders = ({ children }) => {
    return (
        <ToastProvider>
            <PermissionProvider>
                <BookmarkProvider>
                    <LayoutProvider>
                        {children}
                    </LayoutProvider>
                </BookmarkProvider>
            </PermissionProvider>
        </ToastProvider>
    );
};
