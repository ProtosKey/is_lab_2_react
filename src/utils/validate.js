import { CLIMATES } from './enums';

export const MAX_COORDINATE_X = 974;
const MAX_INT = 2147483647;

export const isEmpty = (value) => value === null || value === undefined || String(value).trim() === '';

const DECIMAL_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

export const toNumber = (value) => {
    const text = String(value ?? '').trim().replace(',', '.');
    if (!DECIMAL_PATTERN.test(text)) {
        return null;
    }
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
};

export const toInteger = (value) => {
    const number = toNumber(value);
    return number !== null && Number.isInteger(number) ? number : null;
};

export const today = () => {
    const now = new Date();
    const pad = (part) => String(part).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const isDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
};

export const isPastDate = (value) => isDate(value) && value <= today();

const isPositiveInteger = (value, max = MAX_INT) => {
    const number = toInteger(value);
    return number !== null && number > 0 && number <= max;
};

const isPositiveNumber = (value) => {
    const number = toNumber(value);
    return number !== null && number > 0;
};

export const validateCoordinates = ({ x, y }) => {
    if (isEmpty(x) || toInteger(x) === null) {
        return 'X должен быть целым числом';
    }
    if (toInteger(x) > MAX_COORDINATE_X) {
        return `X не может быть больше ${MAX_COORDINATE_X}`;
    }
    if (isEmpty(y) || toInteger(y) === null) {
        return 'Y должен быть целым числом';
    }
    return null;
};

export const validateGovernor = ({ name, age, birthday }) => {
    if (isEmpty(name)) {
        return 'Имя губернатора не может быть пустым';
    }
    if (!isPositiveInteger(age, Number.MAX_SAFE_INTEGER)) {
        return 'Возраст должен быть положительным целым числом';
    }
    if (!isEmpty(birthday) && !isPastDate(birthday)) {
        return 'Дата рождения должна содержать день, месяц и год';
    }
    return null;
};

export const validateCity = (form, coordinates, governor) => {
    if (isEmpty(form.name)) {
        return 'Название города не может быть пустым';
    }
    if (!isPositiveInteger(form.area)) {
        return 'Площадь должна быть положительным целым числом';
    }
    if (!isPositiveInteger(form.population)) {
        return 'Население должно быть положительным целым числом';
    }
    if (!isPositiveNumber(form.populationDensity)) {
        return 'Плотность населения должна быть положительным числом';
    }
    if (!isEmpty(form.metersAboveSeaLevel) && toNumber(form.metersAboveSeaLevel) === null) {
        return 'Высота над уровнем моря должна быть числом';
    }
    if (!isEmpty(form.establishmentDate) && !isPastDate(form.establishmentDate)) {
        return 'Дата основания должна содержать день, месяц и год';
    }
    if (!isEmpty(form.creationDate) && !isPastDate(form.creationDate)) {
        return 'Дата создания должна содержать день, месяц и год';
    }
    if (isEmpty(form.standardOfLiving)) {
        return 'Выберите уровень жизни';
    }
    if (!isEmpty(form.climate) && !CLIMATES.some((item) => item.value === form.climate)) {
        return 'Выберите климат из списка';
    }

    return (coordinates.id ? null : validateCoordinates(coordinates))
        ?? (governor.id ? null : validateGovernor(governor));
};

export const coordinatesPayload = ({ x, y }) => ({ x: toInteger(x), y: toInteger(y) });

export const governorPayload = ({ name, age, birthday }) => {
    const governor = { name: name.trim(), age: toInteger(age) };
    if (!isEmpty(birthday)) {
        governor.birthday = birthday;
    }
    return governor;
};

export const cityPayload = (form, coordinates, governor) => {
    const payload = {
        name: form.name.trim(),
        area: toInteger(form.area),
        population: toInteger(form.population),
        capital: form.capital === true || form.capital === 'true',
        populationDensity: toNumber(form.populationDensity),
        standardOfLiving: form.standardOfLiving,
        coordinates,
        governor,
    };
    if (!isEmpty(form.metersAboveSeaLevel)) {
        payload.metersAboveSeaLevel = toNumber(form.metersAboveSeaLevel);
    }
    if (!isEmpty(form.establishmentDate)) {
        payload.establishmentDate = form.establishmentDate;
    }
    if (!isEmpty(form.creationDate)) {
        payload.creationDate = form.creationDate;
    }
    if (!isEmpty(form.climate)) {
        payload.climate = form.climate;
    }
    return payload;
};
