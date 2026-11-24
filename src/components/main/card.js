import React from 'react';

const classList = (...names) => names.filter(Boolean).join(' ');

const Card = ({ title, subtitle, double = false, centered = false, className, children }) => (
    <div className={classList('container', double && 'double', centered && 'centered', className)}>
        <div className="container-content">
            {title && (
                <div className="main">
                    <h2>{title}</h2>
                    {subtitle && <p className="info">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    </div>
);

const Field = ({ label, span = false, children }) => (
    <>
        <div className="label">
            <h3>{label}</h3>
        </div>
        <div className={span ? 'span-3' : undefined}>
            {children}
        </div>
    </>
);

export { Card, Field };
