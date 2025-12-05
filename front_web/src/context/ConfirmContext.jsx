import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { }
    });

    const confirm = useCallback((params) => {
        return new Promise((resolve) => {
            setOptions({
                title: params.title,
                message: params.message,
                onConfirm: () => {
                    setOpen(false);
                    resolve(true);
                },
                onCancel: () => {
                    setOpen(false);
                    resolve(false);
                }
            });
            setOpen(true);
        });
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <ConfirmDialog
                open={open}
                onClose={options.onCancel}
                onConfirm={options.onConfirm}
                title={options.title}
                message={options.message}
            />
        </ConfirmContext.Provider>
    );
};
