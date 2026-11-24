import React from 'react';

const Pills = ({ name, options, value, onChange }) => (
    <div className="radio-container">
        {options.map((option) => (
            <label
                key={option.value}
                className={`radio-label ${value === option.value ? 'selected' : ''}`}
            >
                <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(event) => onChange(event.target.value)}
                />
                {option.label}
            </label>
        ))}
    </div>
);

export default Pills;
