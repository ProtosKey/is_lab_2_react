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
        setNotice('');
        setter((prev) => prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)));
    };
    const remove = (setter) => (index) => {
        setError('');
        setNotice('');
        setter((prev) => prev.filter((_, i) => i !== index));
    };
    const add = (setter, blank) => () => {
        setError('');
        setNotice('');
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
            <div className="stack-column">
                <Card title="Губернаторы">
                    {governors.length === 0 && <p className="info">Записей пока нет</p>}
                    {governors.map((row, index) => (
                        <div className="sub-card" key={index}>
                            <div className="grid-input">
                                <Field label="Имя">
                                    <input
                                        className="input-data no-add"
                                        aria-label="Имя"
                                        placeholder="Имя"
                                        value={row.name}
                                        onChange={(e) => patchGovernors(index, 'name', e.target.value)}
                                    />
                                </Field>
                                <Field label="Возраст">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Возраст"
                                        placeholder="Полных лет"
                                        value={row.age}
                                        onChange={(e) => patchGovernors(index, 'age', e.target.value)}
                                    />
                                </Field>
                                <Field label="День рождения">
                                    <DateInput
                                        aria-label="День рождения"
                                        title="День рождения (необязательно)"
                                        value={row.birthday}
                                        onChange={(value) => patchGovernors(index, 'birthday', value)}
                                    />
                                </Field>
                                <div className="double">
                                    <button
                                        type="button"
                                        className="exit-btn"
                                        onClick={() => remove(setGovernors)(index)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="ghost-btn" onClick={add(setGovernors, emptyGovernor)}>
                        Добавить губернатора
                    </button>
                </Card>
                <Card title="Координаты">
                    {coordinates.length === 0 && <p className="info">Записей пока нет</p>}
                    {coordinates.map((row, index) => (
                        <div className="sub-card" key={index}>
                            <div className="grid-input">
                                <Field label="Координата X">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="X"
                                        placeholder="Абсцисса не больше 974"
                                        value={row.x}
                                        onChange={(e) => patchCoordinates(index, 'x', e.target.value)}
                                    />
                                </Field>
                                <Field label="Координата Y">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Y"
                                        placeholder="Ордината"
                                        value={row.y}
                                        onChange={(e) => patchCoordinates(index, 'y', e.target.value)}
                                    />
                                </Field>
                                <div className="double">
                                    <button
                                        type="button"
                                        className="exit-btn"
                                        onClick={() => remove(setCoordinates)(index)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="ghost-btn" onClick={add(setCoordinates, emptyCoordinates)}>
                        Добавить координаты
                    </button>
                </Card>
            </div>
            <Card title="Города">
                {cities.length === 0 && <p className="info">Записей пока нет</p>}
                {cities.map((city, index) => {
                    const set = (name) => (event) => patchCities(index, name, event.target.value);
                    return (
                        <div className="sub-card" key={index}>
                            <div className="grid-input">
                                <Field label="Название">
                                    <input
                                        className="input-data no-add"
                                        value={city.name}
                                        onChange={set('name')}
                                        placeholder="Укажите название"
                                    />
                                </Field>
                                <Field label="Координата X">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="X"
                                        placeholder="Абсцисса не больше 974"
                                        value={city.coordinatesX}
                                        onChange={set('coordinatesX')}
                                    />
                                </Field>
                                <Field label="Координата Y">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Y"
                                        placeholder="Ордината"
                                        value={city.coordinatesY}
                                        onChange={set('coordinatesY')}
                                    />
                                </Field>
                                <Field label="Площадь">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Площадь"
                                        placeholder="Целое число"
                                        value={city.area}
                                        onChange={set('area')}
                                    />
                                </Field>
                                <Field label="Население">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Население"
                                        placeholder="Целое число"
                                        value={city.population}
                                        onChange={set('population')}
                                    />
                                </Field>
                                <Field label="Плотность">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className="input-data no-add"
                                        aria-label="Плотность населения"
                                        placeholder="Человек на квадратный километр"
                                        value={city.populationDensity}
                                        onChange={set('populationDensity')}
                                    />
                                </Field>
                                <Field label="Высота">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        className="input-data no-add"
                                        aria-label="Высота над уровнем моря"
                                        placeholder="Над уровнем моря"
                                        value={city.metersAboveSeaLevel}
                                        onChange={set('metersAboveSeaLevel')}
                                    />
                                </Field>
                                <Field label="Дата основания">
                                    <DateInput
                                        aria-label="Дата основания"
                                        title="Дата основания (необязательно)"
                                        value={city.establishmentDate}
                                        onChange={(value) => patchCities(index, 'establishmentDate', value)}
                                    />
                                </Field>
                                <Field label="Дата создания">
                                    <DateInput
                                        aria-label="Дата создания"
                                        title="Дата создания (необязательно)"
                                        value={city.creationDate}
                                        onChange={(value) => patchCities(index, 'creationDate', value)}
                                    />
                                </Field>
                                <Field label="Столица">
                                    <Pills
                                        name={`capital-${index}`}
                                        options={CAPITAL_OPTIONS}
                                        value={city.capital}
                                        onChange={(value) => patchCities(index, 'capital', value)}
                                    />
                                </Field>
                                <Field label="Климат">
                                    <Select
                                        value={city.climate}
                                        onChange={(value) => patchCities(index, 'climate', value)}
                                    >
                                        <option value="">Не указан</option>
                                        {CLIMATES.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Уровень жизни">
                                    <Select
                                        value={city.standardOfLiving}
                                        onChange={(value) => patchCities(index, 'standardOfLiving', value)}
                                    >
                                        <option value="">Выберите</option>
                                        {STANDARDS_OF_LIVING.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Имя губернатора">
                                    <input
                                        className="input-data no-add"
                                        aria-label="Имя губернатора"
                                        placeholder="Фамилия, имя, отчество"
                                        value={city.governorName}
                                        onChange={set('governorName')}
                                    />
                                </Field>
                                <Field label="Возраст губернатора">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="input-data no-add"
                                        aria-label="Возраст губернатора"
                                        placeholder="Полных лет"
                                        value={city.governorAge}
                                        onChange={set('governorAge')}
                                    />
                                </Field>
                                <Field label="День рождения">
                                    <DateInput
                                        aria-label="День рождения губернатора"
                                        value={city.governorBirthday}
                                        onChange={(value) => patchCities(index, 'governorBirthday', value)}
                                    />
                                </Field>
                                <div className="double">
                                    <button
                                        type="button"
                                        className="exit-btn"
                                        onClick={() => remove(setCities)(index)}
                                    >
                                        Удалить
                                    </button>
                                </div>
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
