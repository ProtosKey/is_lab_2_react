import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../main/card';
import Select from '../main/select';
import { FILTERABLE_COLUMNS } from '../../utils/enums';
import { clearNotice, setQuery } from '../../store/slices/citiesSlice';

const DEFAULT_FIELD = FILTERABLE_COLUMNS[0]?.field ?? 'name';

const CityFilters = () => {
    const dispatch = useDispatch();
    const query = useSelector((state) => state.cities.query);
    const [field, setField] = useState(query.filterField || DEFAULT_FIELD);
    const [value, setValue] = useState(query.filterValue);
    const column = FILTERABLE_COLUMNS.find((item) => item.field === field);

    const apply = (event) => {
        event.preventDefault();
        const trimmed = column?.options ? value : value.trim();
        dispatch(clearNotice());
        dispatch(setQuery(trimmed ? { filterField: field, filterValue: trimmed } : { filterField: '', filterValue: '' }));
    };

    const reset = () => {
        setField(DEFAULT_FIELD);
        setValue('');
        dispatch(clearNotice());
        dispatch(setQuery({ filterField: '', filterValue: '' }));
    };

    return (
        <Card title="Поиск по списку" centered className="form-card">
            <form className="filter-form" onSubmit={apply}>
                <div className="filter-row">
                    <Select
                        value={field}
                        onChange={(next) => {
                            setField(next);
                            setValue('');
                        }}
                    >
                        {FILTERABLE_COLUMNS.map(({ field: name, title }) => (
                            <option key={name} value={name}>
                                {title}
                            </option>
                        ))}
                    </Select>
                    {column?.options ? (
                        <Select value={value} onChange={setValue}>
                            <option value="">Выберите значение</option>
                            {column.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    ) : (
                        <input
                            className="input-data no-add"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Поиск: ${column?.title?.toLowerCase() ?? 'значение'}…`}
                        />
                    )}
                    <button type="submit" className="submit-btn">
                        Найти
                    </button>
                    <button type="button" className="ghost-btn" onClick={reset}>
                        Сбросить
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default CityFilters;
