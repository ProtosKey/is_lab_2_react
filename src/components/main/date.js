import React from 'react';

const formatDigits = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
        return digits;
    }
    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};

const toDisplay = (value) => {
    if (!value) {
        return '';
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        return `${day}.${month}.${year}`;
    }
    return value;
};

const toModel = (raw) => {
    const trimmed = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }
    const digits = trimmed.replace(/\D/g, '').slice(0, 8);
    if (digits.length === 0) {
        return '';
    }
    if (digits.length === 8) {
        return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
    }
    return formatDigits(digits);
};

const DateInput = ({ value, onChange, className = 'input-data no-add', placeholder = 'День, месяц и год', ...rest }) => (
    <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        className={className}
        placeholder={placeholder}
        value={toDisplay(value)}
        onChange={(e) => onChange?.(toModel(e.target.value))}
        {...rest}
    />
);

export default DateInput;
