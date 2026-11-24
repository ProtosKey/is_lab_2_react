import React, { useEffect } from 'react';
import { ErrorMessage } from './message';

const Modal = ({
    open,
    title,
    text,
    children,
    confirmText = 'Подтвердить',
    confirmDisabled = false,
    busy = false,
    error = '',
    onConfirm,
    onClose,
}) => {
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="container modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="container-content">
                    <div className="main">
                        <h2>{title}</h2>
                    </div>
                    {text && <p className="modal-text">{text}</p>}
                    {children}
                    <ErrorMessage>{error}</ErrorMessage>
                    <div className="modal-actions">
                        <button type="button" className="exit-btn" disabled={busy || confirmDisabled} onClick={onConfirm}>
                            {busy ? 'Выполнение…' : confirmText}
                        </button>
                        <button type="button" className="pill-btn" disabled={busy} onClick={onClose}>
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
