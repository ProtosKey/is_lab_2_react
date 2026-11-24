import React from 'react';

const ErrorMessage = ({ children }) =>
    children ? <div className="error-message double">{children}</div> : null;

const GoodMessage = ({ children }) =>
    children ? <div className="good-message double">{children}</div> : null;

const Messages = ({ notice, error }) =>
    notice || error ? (
        <div className="messages">
            <GoodMessage>{notice}</GoodMessage>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    ) : null;

export { ErrorMessage, GoodMessage, Messages };
