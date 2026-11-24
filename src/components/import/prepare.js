import React, { useState } from 'react';
import { Card, Field } from '../main/card';
import { Messages } from '../main/message';
import Pills from '../main/pills';
import Select from '../main/select';
import DateInput from '../main/date';
import { CLIMATES, STANDARDS_OF_LIVING } from '../../utils/enums';
import {
    cityPayload,
    coordinatesPayload,
    governorPayload,
    toInteger,
    validateCity,
    validateCoordinates,
    validateGovernor,
} from '../../utils/validate';

const CAPITAL_OPTIONS = [
    { value: 'true', label: 'Да' },
    { value: 'false', label: 'Нет' },
];

const emptyCoordinates = () => ({ x: '', y: '' });
const emptyGovernor = () => ({ name: '', age: '', birthday: '' });
const emptyCity = () => ({
    name: '',
    area: '',
    population: '',
    populationDensity: '',
    metersAboveSeaLevel: '',
    establishmentDate: '',
    creationDate: '',
    capital: 'false',
    climate: '',
    standardOfLiving: '',
    coordinatesX: '',
    coordinatesY: '',
    governorName: '',
    governorAge: '',
    governorBirthday: '',
});

const coordinatesOf = (row) => ({ x: row.coordinatesX, y: row.coordinatesY });
const governorOf = (row) => ({ name: row.governorName, age: row.governorAge, birthday: row.governorBirthday });

const mapRecords = (rows, section, validate, toRecord) => {
    const list = [];
    for (const [index, row] of rows.entries()) {
        const problem = validate(row);
        if (problem) {
            return { error: `${section}, запись №${index + 1}: ${problem}` };
        }
        list.push(toRecord(row));
    }
    return { list };
};

const SECTIONS = [
    ['coordinates', 'Координаты', validateCoordinates, ({ x, y }) => ({ x: toInteger(x), y: toInteger(y) })],
    ['governors', 'Губернаторы', validateGovernor, governorPayload],
    [
        'cities',
        'Города',
        (row) => validateCity(row, coordinatesOf(row), governorOf(row)),
        (row) => cityPayload(row, coordinatesPayload(coordinatesOf(row)), governorPayload(governorOf(row))),
    ],
];

const buildBatch = (source) => {
    const batch = {};
    for (const [key, section, validate, toRecord] of SECTIONS) {
        if (source[key].length === 0) {
            continue;
        }
        const result = mapRecords(source[key], section, validate, toRecord);
        if (result.error) {
            return result;
        }
        batch[key] = result.list;
    }
    return { batch };
};

const Prepare = () => {
    const [coordinates, setCoordinates] = useState([]);
    const [governors, setGovernors] = useState([]);
    const [cities, setCities] = useState([]);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const patch = (setter) => (index, name, value) => {
        setError('');
        setter((prev) => prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)));
    };
    const remove = (setter) => (index) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };
    const add = (setter, blank) => () => {
        setError('');
        setter((prev) => [...prev, blank()]);
    };

    const patchCoordinates = patch(setCoordinates);
    const patchGovernors = patch(setGovernors);
    const patchCities = patch(setCities);

    const download = () => {
        setNotice('');

        if (coordinates.length + governors.length + cities.length === 0) {
            setError('Добавьте хотя бы одну запись');
            return;
        }
        const result = buildBatch({ coordinates, governors, cities });
        if (result.error) {
            setError(result.error);
            return;
        }

        const blob = new Blob([JSON.stringify(result.batch, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'import.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setError('');
        setNotice('Файл скачан, теперь его можно импортировать в соответствующем разделе');
    };

    return (
        <>
            <Card title={`Координаты`}>
                <div className="edit-list">
                    {coordinates.length === 0 && <p className="info">Записей пока нет</p>}
                    {coordinates.map((row, index) => (
                        <div className="edit-row" key={index}>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add"
                                aria-label="X"
                                placeholder="X (не больше 974)"
                                value={row.x}
                                onChange={(e) => patchCoordinates(index, 'x', e.target.value)}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add"
                                aria-label="Y"
                                placeholder="Y"
                                value={row.y}
                                onChange={(e) => patchCoordinates(index, 'y', e.target.value)}
                            />
                            <button
                                type="button"
                                className="small-btn danger"
                                aria-label="Удалить запись"
                                onClick={() => remove(setCoordinates)(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="ghost-btn" onClick={add(setCoordinates, emptyCoordinates)}>
                    Добавить координаты
                </button>
            </Card>
            <Card title={`Губернаторы`}>
                <div className="edit-list">
                    {governors.length === 0 && <p className="info">Записей пока нет</p>}
                    {governors.map((row, index) => (
                        <div className="edit-row" key={index}>
                            <input
                                className="input-data no-add"
                                aria-label="Имя"
                                placeholder="Имя"
                                value={row.name}
                                onChange={(e) => patchGovernors(index, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add narrow-input"
                                aria-label="Возраст"
                                placeholder="Возраст"
                                value={row.age}
                                onChange={(e) => patchGovernors(index, 'age', e.target.value)}
                            />
                            <DateInput
                                aria-label="День рождения"
                                title="День рождения (необязательно)"
                                value={row.birthday}
                                onChange={(value) => patchGovernors(index, 'birthday', value)}
                            />
                            <button
                                type="button"
                                className="small-btn danger"
                                aria-label="Удалить запись"
                                onClick={() => remove(setGovernors)(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="ghost-btn" onClick={add(setGovernors, emptyGovernor)}>
                    Добавить губернатора
                </button>
            </Card>
            <Card title="Города" double>
                {cities.length === 0 && <p className="info">Записей пока нет</p>}
                {cities.map((city, index) => {
                    const set = (name) => (event) => patchCities(index, name, event.target.value);
                    const name = city.name.trim();
                    return (
                        <div className="sub-card" key={index}>
                            <div className="sub-card-title">
                                <h3>
                                    Город №{index + 1}
                                    {name && ` · ${name}`}
                                </h3>
                                <button
                                    type="button"
                                    className="small-btn danger"
                                    onClick={() => remove(setCities)(index)}
                                >
                                    Удалить
                                </button>
                            </div>
                            <div className="grid-input">
                                <Field label="Название">
                                    <input
                                        className="input-data no-add"
                                        value={city.name}
                                        onChange={set('name')}
                                        placeholder="Укажите название"
                                    />
                                </Field>
                                <Field label="Координаты">
                                    <div className="pair">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input-data no-add"
                                            aria-label="X"
                                            placeholder="X (не больше 974)"
                                            value={city.coordinatesX}
                                            onChange={set('coordinatesX')}
                                        />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input-data no-add"
                                            aria-label="Y"
                                            placeholder="Y"
                                            value={city.coordinatesY}
                                            onChange={set('coordinatesY')}
                                        />
                                    </div>
                                </Field>
                                <Field label="Губернатор">
                                    <div className="pair">
                                        <input
                                            className="input-data no-add"
                                            aria-label="Имя губернатора"
                                            placeholder="Имя"
                                            value={city.governorName}
                                            onChange={set('governorName')}
                                        />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input-data no-add"
                                            aria-label="Возраст губернатора"
                                            placeholder="Возраст"
                                            value={city.governorAge}
                                            onChange={set('governorAge')}
                                        />
                                    </div>
                                </Field>
                                <Field label="День рождения">
                                    <DateInput
                                        aria-label="День рождения губернатора"
                                        value={city.governorBirthday}
                                        onChange={(value) => patchCities(index, 'governorBirthday', value)}
                                    />
                                </Field>
                                <Field label="Площадь, население">
                                    <div className="pair">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input-data no-add"
                                            aria-label="Площадь"
                                            placeholder="Площадь"
                                            value={city.area}
                                            onChange={set('area')}
                                        />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="input-data no-add"
                                            aria-label="Население"
                                            placeholder="Население"
                                            value={city.population}
                                            onChange={set('population')}
                                        />
                                    </div>
                                </Field>
                                <Field label="Плотность, высота">
                                    <div className="pair">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="input-data no-add"
                                            aria-label="Плотность населения"
                                            placeholder="Плотность"
                                            value={city.populationDensity}
                                            onChange={set('populationDensity')}
                                        />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="input-data no-add"
                                            aria-label="Высота над уровнем моря"
                                            placeholder="Высота, м"
                                            value={city.metersAboveSeaLevel}
                                            onChange={set('metersAboveSeaLevel')}
                                        />
                                    </div>
                                </Field>
                                <Field label="Даты">
                                    <div className="pair">
                                        <DateInput
                                            aria-label="Дата основания"
                                            title="Дата основания (необязательно)"
                                            value={city.establishmentDate}
                                            onChange={(value) => patchCities(index, 'establishmentDate', value)}
                                        />
                                        <DateInput
                                            aria-label="Дата создания"
                                            title="Дата создания (необязательно)"
                                            value={city.creationDate}
                                            onChange={(value) => patchCities(index, 'creationDate', value)}
                                        />
                                    </div>
                                </Field>
                                <Field label="Столица">
                                    <Pills
                                        name={`capital-${index}`}
                                        options={CAPITAL_OPTIONS}
                                        value={city.capital}
                                        onChange={(value) => patchCities(index, 'capital', value)}
                                    />
                                </Field>
                                <Field label="Климат и уровень жизни">
                                    <div className="pair">
                                        <Select
                                            value={city.climate}
                                            onChange={(value) => patchCities(index, 'climate', value)}
                                        >
                                            <option value="">Климат не указан</option>
                                            {CLIMATES.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </Select>
                                        <Select
                                            value={city.standardOfLiving}
                                            onChange={(value) => patchCities(index, 'standardOfLiving', value)}
                                        >
                                            <option value="">Выберите уровень</option>
                                            {STANDARDS_OF_LIVING.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    );
                })}
                <button type="button" className="ghost-btn" onClick={add(setCities, emptyCity)}>
                    Добавить город
                </button>
            </Card>
            <Card centered>
                <button type="button" className="submit-btn" onClick={download}>
                    Скачать итоговый файл
                </button>
                <Messages notice={notice} error={error} />
            </Card>
        </>
    );
};

export default Prepare;
