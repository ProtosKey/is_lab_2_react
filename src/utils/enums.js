export const CLIMATES = [
    { value: 'EQUATORIAL', label: 'Экваториальный' },
    { value: 'SUBEQUATORIAL', label: 'Субэкваториальный' },
    { value: 'TROPICAL', label: 'Тропический' },
    { value: 'TROPICAL_DESERT', label: 'Тропический пустынный' },
    { value: 'SUBTROPICAL', label: 'Субтропический' },
    { value: 'TEMPERATE', label: 'Умеренный' },
    { value: 'SUBARCTIC', label: 'Субарктический' },
    { value: 'ARCTIC', label: 'Арктический' },
    { value: 'ANTARCTIC', label: 'Антарктический' },
];

export const STANDARDS_OF_LIVING = [
    { value: 'VERY_HIGH', label: 'Очень высокий' },
    { value: 'HIGH', label: 'Высокий' },
    { value: 'ABOVE_AVERAGE', label: 'Выше среднего' },
    { value: 'MEDIUM', label: 'Средний' },
    { value: 'BELOW_AVERAGE', label: 'Ниже среднего' },
    { value: 'LOW', label: 'Низкий' },
    { value: 'VERY_LOW', label: 'Очень низкий' },
    { value: 'POVERTY', label: 'За чертой бедности' },
    { value: 'EXTREME_POVERTY', label: 'Крайняя нищета' },
    { value: 'CRITICAL', label: 'Критический' },
    { value: 'NIGHTMARE', label: 'Кошмарный' },
];

export const USER_LEVELS = {
    ADMIN: 'Администратор',
    USER: 'Пользователь',
};

export const OPERATION_TYPES = {
    IMPORT: 'Импорт',
};

export const OPERATION_STATUSES = {
    SUCCESS: 'Успешно',
    FAILED: 'Ошибка',
};

export const climateLabel = (value) => CLIMATES.find((item) => item.value === value)?.label ?? value;

export const standardOfLivingLabel = (value) =>
    STANDARDS_OF_LIVING.find((item) => item.value === value)?.label ?? value;

const dash = (value) => value ?? '—';

export const CITY_COLUMNS = [
    { field: 'id', title: 'ID', get: (city) => city.id },
    { field: 'name', title: 'Название', get: (city) => city.name, filterable: true, ellipsis: true },
    { field: 'coordinatesX', title: 'X', get: (city) => city.coordinates?.x },
    { field: 'coordinatesY', title: 'Y', get: (city) => city.coordinates?.y },
    { field: 'creationDate', title: 'Дата создания', get: (city) => city.creationDate },
    { field: 'area', title: 'Площадь', get: (city) => city.area },
    { field: 'population', title: 'Население', get: (city) => city.population },
    { field: 'establishmentDate', title: 'Дата основания', get: (city) => city.establishmentDate },
    { field: 'capital', title: 'Столица', get: (city) => (city.capital ? 'да' : 'нет') },
    { field: 'metersAboveSeaLevel', title: 'Высота', get: (city) => dash(city.metersAboveSeaLevel) },
    { field: 'populationDensity', title: 'Плотность', get: (city) => city.populationDensity },
    {
        field: 'climate',
        title: 'Климат',
        get: (city) => dash(climateLabel(city.climate)),
        filterable: true,
        options: CLIMATES,
    },
    {
        field: 'standardOfLiving',
        title: 'Уровень жизни',
        get: (city) => standardOfLivingLabel(city.standardOfLiving),
        filterable: true,
        options: STANDARDS_OF_LIVING,
    },
    {
        field: 'governor',
        title: 'Губернатор',
        get: (city) => dash(city.governor?.name),
        filterable: true,
        ellipsis: true,
    },
];

export const FILTERABLE_COLUMNS = CITY_COLUMNS.filter((column) => column.filterable);
