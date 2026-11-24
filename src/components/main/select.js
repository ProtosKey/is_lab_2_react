import React, { useEffect, useMemo, useRef, useState } from 'react';

const collectOptions = (children) => {
    const result = [];
    React.Children.forEach(children, (child) => {
        if (!child) {
            return;
        }
        if (Array.isArray(child)) {
            result.push(...collectOptions(child));
            return;
        }
        if (child.type === React.Fragment) {
            result.push(...collectOptions(child.props.children));
            return;
        }
        if (child.type === 'option') {
            result.push({
                value: String(child.props.value ?? ''),
                label: child.props.children,
                disabled: Boolean(child.props.disabled),
            });
        }
    });
    return result;
};

const Select = ({ value, onChange, disabled = false, children }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const options = useMemo(() => collectOptions(children), [children]);
    const current = String(value ?? '');
    const selected = options.find((item) => item.value === current) ?? options[0];

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const handleOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    useEffect(() => {
        if (disabled) {
            setOpen(false);
        }
    }, [disabled]);

    const choose = (option) => {
        if (option.disabled) {
            return;
        }
        setOpen(false);
        onChange?.(option.value);
    };

    return (
        <div ref={rootRef} className={`select ${open ? 'open' : ''}`}>
            <button
                type="button"
                className="input-data no-add select-trigger"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className={`select-label ${current === '' ? 'placeholder' : ''}`}>
                    {selected?.label ?? ''}
                </span>
            </button>
            {open && (
                <div className="select-menu" role="listbox">
                    {options.map((option) => {
                        const active = option.value === current;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={active}
                                disabled={option.disabled}
                                className={`select-option ${active ? 'active' : ''}`}
                                onClick={() => choose(option)}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Select;
