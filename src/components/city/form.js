import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Field } from '../main/card';
import { ErrorMessage } from '../main/message';
import Modal from '../main/modal';
import Pills from '../main/pills';
import Select from '../main/select';
import DateInput from '../main/date';
import { create, findById, remove, update } from '../../controllers/cities';
import { findAll as findAllCoordinates } from '../../controllers/coordinates';
import { findAll as findAllGovernors } from '../../controllers/governors';
import { setNotice } from '../../store/slices/citiesSlice';
import { setCoordinates, setGovernors } from '../../store/slices/listSlices';
import { CLIMATES, STANDARDS_OF_LIVING } from '../../utils/enums';
import useList from '../../utils/useList';
import {
    cityPayload,
    coordinatesPayload,
    governorPayload,
    validateCity,
} from '../../utils/validate';

const EXISTING = 'existing';
const NEW = 'new';
const COORDINATE_MODES = [
    { value: EXISTING, label: 'Из справочника' },
    { value: NEW, label: 'Новые' },
];
const GOVERNOR_MODES = [
    { value: EXISTING, label: 'Из справочника' },
    { value: NEW, label: 'Новый' },
];
const CAPITAL_OPTIONS = [
    { value: 'true', label: 'Да' },
    { value: 'false', label: 'Нет' },
];

const text = (value) => (value === null || value === undefined ? '' : String(value));

const EMPTY_FORM = {
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
    coordinatesMode: EXISTING,
    coordinatesId: '',
    coordinatesX: '',
    coordinatesY: '',
    governorMode: EXISTING,
    governorId: '',
    governorName: '',
    governorAge: '',
    governorBirthday: '',
};

const fromCity = (city) => ({
    ...EMPTY_FORM,
    name: text(city.name),
    area: text(city.area),
    population: text(city.population),
    populationDensity: text(city.populationDensity),
    metersAboveSeaLevel: text(city.metersAboveSeaLevel),
    establishmentDate: text(city.establishmentDate),
    capital: city.capital ? 'true' : 'false',
    climate: city.climate ?? '',
    standardOfLiving: city.standardOfLiving ?? '',
    coordinatesId: text(city.coordinates?.id),
    governorId: text(city.governor?.id),
});

const CityForm = ({ id }) => {
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [city, setCity] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(isEdit);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const coordinates = useList((state) => state.coordinates.items, setCoordinates, findAllCoordinates);
    const governors = useList((state) => state.governors.items, setGovernors, findAllGovernors);

    useEffect(() => {
        setError('');
        setConfirming(false);
        setCity(null);
        setForm(EMPTY_FORM);

        if (!isEdit) {
            setLoading(false);
            return undefined;
        }

        let mounted = true;
        setLoading(true);
        findById(id).then((result) => {
            if (!mounted) {
                return;
            }
            setLoading(false);
            if (result.success) {
                setCity(result.data);
                setForm(fromCity(result.data));
            } else {
                setError(result.data);
            }
        });
        return () => {
            mounted = false;
        };
    }, [id, isEdit]);

    const set = (name) => (value) => {
        setError('');
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const change = (name) => (event) => set(name)(event.target.value);

    const submit = async (event) => {
        event.preventDefault();

        const existingCoordinates = form.coordinatesMode === EXISTING;
        const existingGovernor = form.governorMode === EXISTING;
        const coords = existingCoordinates
            ? { id: Number(form.coordinatesId) }
            : { x: form.coordinatesX, y: form.coordinatesY };
        const governor = existingGovernor
            ? { id: Number(form.governorId) }
            : { name: form.governorName, age: form.governorAge, birthday: form.governorBirthday };

        let problem = null;
        if (existingCoordinates && !form.coordinatesId) {
            problem = 'Выберите координаты из справочника или задайте новые';
        } else if (existingGovernor && !form.governorId) {
            problem = 'Выберите губернатора из справочника или создайте нового';
        } else {
            problem = validateCity(form, coords, governor);
        }
        if (problem) {
            setError(problem);
            return;
        }

        setBusy(true);
        const payload = cityPayload(
            form,
            existingCoordinates ? coords : coordinatesPayload(coords),
            existingGovernor ? governor : governorPayload(governor),
        );
        const result = isEdit ? await update(id, payload) : await create(payload);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }
        dispatch(setNotice(isEdit ? `Город «${payload.name}» обновлён` : `Город «${payload.name}» создан`));
        navigate('/main');
    };

    const confirmDelete = async () => {
        setBusy(true);
        const result = await remove(id);
        setBusy(false);

        if (!result.success) {
            setDeleteError(result.data);
            return;
        }
        dispatch(setNotice(`Город «${form.name.trim()}» удалён`));
        navigate('/main');
    };

    if (loading) {
        return (
            <Card title="Город" centered className="form-card">
                <p className="info">Загрузка…</p>
            </Card>
        );
    }

    if (isEdit && !city) {
        return (
            <Card title={`Город №${id}`} centered className="form-card">
                <ErrorMessage>{error}</ErrorMessage>
            </Card>
        );
    }

    const loadError = coordinates.error || governors.error;

    return (
        <Card
            title={isEdit ? `Город №${id}` : 'Новый город'}
            centered
            className="form-card"
        >
            <form className="grid-input" onSubmit={submit}>
                {isEdit && city && (
                    <>
                        <Field label="ID">
                            <input className="input-data no-add" value={city.id} readOnly aria-readonly="true" />
                        </Field>
                        <Field label="Дата создания">
                            <DateInput
                                value={city.creationDate ?? ''}
                                readOnly
                                aria-readonly="true"
                                tabIndex={-1}
                            />
                        </Field>
                    </>
                )}
                <Field label="Название">
                    <input
                        className="input-data no-add"
                        value={form.name}
                        onChange={change('name')}
                        placeholder="Укажите название"
                    />
                </Field>
                <Field label="Координаты">
                    <Pills
                        name="coordinates-mode"
                        options={COORDINATE_MODES}
                        value={form.coordinatesMode}
                        onChange={set('coordinatesMode')}
                    />
                </Field>
                {form.coordinatesMode === EXISTING ? (
                    <Field label="Справочник">
                        <Select value={form.coordinatesId} onChange={set('coordinatesId')}>
                            <option value="">
                                {coordinates.items.length === 0 ? 'Справочник пуст' : 'Выберите координаты'}
                            </option>
                            {coordinates.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                    #{item.id} — ({item.x}, {item.y})
                                </option>
                            ))}
                        </Select>
                    </Field>
                ) : (
                    <>
                        <Field label="Координата X">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add"
                                value={form.coordinatesX}
                                onChange={change('coordinatesX')}
                                placeholder="Абсцисса не больше 974"
                            />
                        </Field>
                        <Field label="Координата Y">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add"
                                value={form.coordinatesY}
                                onChange={change('coordinatesY')}
                                placeholder="Целое число"
                            />
                        </Field>
                    </>
                )}
                <Field label="Площадь">
                    <input
                        type="text"
                        inputMode="numeric"
                        className="input-data no-add"
                        value={form.area}
                        onChange={change('area')}
                        placeholder="Целое число"
                    />
                </Field>
                <Field label="Население">
                    <input
                        type="text"
                        inputMode="numeric"
                        className="input-data no-add"
                        value={form.population}
                        onChange={change('population')}
                        placeholder="Целое число"
                    />
                </Field>
                <Field label="Плотность">
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-data no-add"
                        value={form.populationDensity}
                        onChange={change('populationDensity')}
                        placeholder="Человек на квадратный километр"
                    />
                </Field>
                <Field label="Высота">
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-data no-add"
                        value={form.metersAboveSeaLevel}
                        onChange={change('metersAboveSeaLevel')}
                        placeholder="Над уровнем моря"
                    />
                </Field>
                <Field label="Дата основания">
                    <DateInput
                        value={form.establishmentDate}
                        onChange={set('establishmentDate')}
                    />
                </Field>
                {!isEdit && (
                    <Field label="Дата создания">
                        <DateInput
                            value={form.creationDate}
                            onChange={set('creationDate')}
                        />
                    </Field>
                )}
                <Field label="Столица">
                    <Pills
                        name="capital"
                        options={CAPITAL_OPTIONS}
                        value={form.capital}
                        onChange={set('capital')}
                    />
                </Field>
                <Field label="Климат">
                    <Select value={form.climate} onChange={set('climate')}>
                        <option value="">Не указан</option>
                        {CLIMATES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Уровень жизни">
                    <Select value={form.standardOfLiving} onChange={set('standardOfLiving')}>
                        <option value="">Выберите</option>
                        {STANDARDS_OF_LIVING.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Губернатор">
                    <Pills
                        name="governor-mode"
                        options={GOVERNOR_MODES}
                        value={form.governorMode}
                        onChange={set('governorMode')}
                    />
                </Field>
                {form.governorMode === EXISTING ? (
                    <Field label="Справочник">
                        <Select value={form.governorId} onChange={set('governorId')}>
                            <option value="">
                                {governors.items.length === 0 ? 'Справочник пуст' : 'Выберите губернатора'}
                            </option>
                            {governors.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                    #{item.id} — {item.name} ({item.age})
                                </option>
                            ))}
                        </Select>
                    </Field>
                ) : (
                    <>
                        <Field label="Имя">
                            <input
                                className="input-data no-add"
                                value={form.governorName}
                                onChange={change('governorName')}
                                placeholder="Фамилия, имя, отчество"
                            />
                        </Field>
                        <Field label="Возраст">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-data no-add"
                                value={form.governorAge}
                                onChange={change('governorAge')}
                                placeholder="Полных лет"
                            />
                        </Field>
                        <Field label="День рождения">
                            <DateInput
                                value={form.governorBirthday}
                                onChange={set('governorBirthday')}
                            />
                        </Field>
                    </>
                )}
                <div>
                    <button type="button" className="more-btn" onClick={() => navigate('/main')}>
                        Отмена
                    </button>
                </div>
                <div>
                    <button type="submit" className="submit-btn" disabled={busy}>
                        {busy ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Создать город'}
                    </button>
                </div>
                {isEdit && (
                    <div className="double">
                        <button
                            type="button"
                            className="exit-btn"
                            onClick={() => {
                                setDeleteError('');
                                setConfirming(true);
                            }}
                        >
                            Удалить город
                        </button>
                    </div>
                )}
                <ErrorMessage>{loadError || error}</ErrorMessage>
            </form>
            <Modal
                open={confirming}
                title="Удаление города"
                text={`Удалить город «${form.name.trim()}»? Действие нельзя отменить.`}
                confirmText="Удалить"
                busy={busy}
                error={deleteError}
                onConfirm={confirmDelete}
                onClose={() => setConfirming(false)}
            />
        </Card>
    );
};

export default CityForm;
