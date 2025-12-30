import React, { useEffect } from 'react';
import { MdClose, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <MdCheckCircle size={24} color="#38a169" />;
            case 'error': return <MdError size={24} color="#e53e3e" />;
            default: return <MdInfo size={24} color="#3182ce" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return '#f0fff4';
            case 'error': return '#fff5f5';
            default: return '#ebf8ff';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return '#c6f6d5';
            case 'error': return '#fed7d7';
            default: return '#bee3f8';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: getBgColor(),
            border: `1px solid ${getBorderColor()}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        }}>
            {getIcon()}
            <div style={{ flex: 1, fontSize: '0.95rem', color: '#2d3748' }}>
                {message}
            </div>
            <button 
                onClick={onClose}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#a0aec0',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                }}
            >
                <MdClose size={20} />
            </button>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default Toast;
