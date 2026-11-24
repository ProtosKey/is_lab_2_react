import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from '../main/select';
import { Card, Field } from '../main/card';
import { ErrorMessage, GoodMessage } from '../main/message';
import Modal from '../main/modal';
import { findAll } from '../../controllers/cities';
import {
    countByMeters,
    deleteByClimate,
    findByName,
    movePopulation,
    movePopulationToSmallest,
} from '../../controllers/special';
import { CLIMATES, climateLabel } from '../../utils/enums';
import { formatNumber, plural } from '../../utils/format';
import { toNumber } from '../../utils/validate';

/** Состояние одной операции: занятость, сообщение об успехе и об ошибке. */
const useAction = () => {
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    /** operation возвращает { success, data, message }; при успехе результат — data. */
    const run = useCallback(async (operation) => {
        setBusy(true);
        setNotice('');
        setError('');
        const result = await operation();
        setBusy(false);
        if (!result.success) {
            setError(result.data);
            return null;
        }
        setNotice(result.message);
        return result.data;
    }, []);

    const reset = useCallback(() => {
        setNotice('');
        setError('');
    }, []);

    const fail = useCallback((message) => {
        setNotice('');
        setError(message);
    }, []);

    return { busy, notice, error, run, reset, fail };
};

/** Все города одним списком — для селектов переселения. */
const useCityOptions = (enabled) => {
    const [cities, setCities] = useState([]);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const result = await findAll();
        if (result.success) {
            setCities(result.data.items);
            setError('');
        } else {
            setError(result.data);
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            load();
        }
    }, [enabled, load]);

    return { cities, error, load };
};

const Cell = ({ children, className }) => (
    <td>
        <div className={`cell ${className ?? ''}`}>{children}</div>
    </td>
);

const SearchOperation = () => {
    const [substring, setSubstring] = useState('');
    const [results, setResults] = useState(null);
    const { busy, notice, error, run, fail } = useAction();

    const submit = async () => {
        const text = substring.trim();

        if (!text) {
            setResults(null);
            fail('Введите подстроку для поиска');
            return;
        }
        const data = await run(async () => {
            const result = await findByName(text);
            return {
                success: result.success,
                data: result.data,
                message: result.success
                    ? `Найдено: ${result.data.length} ${plural(result.data.length, 'город', 'города', 'городов')}`
                    : result.data,
            };
        });
        setResults(data ?? []);
    };

    return (
        <Card title="Поиск городов по названию" centered className="form-card">
            <div className="grid-input">
                <Field label="Подстрока">
                    <input
                        className="input-data no-add"
                        value={substring}
                        onChange={(e) => setSubstring(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                submit();
                            }
                        }}
                        placeholder="Часть названия города"
                    />
                </Field>
                <div className="double">
                    <button type="button" className="submit-btn" disabled={busy} onClick={submit}>
                        {busy ? 'Поиск…' : 'Найти города'}
                    </button>
                </div>
                <GoodMessage>{notice}</GoodMessage>
                <ErrorMessage>{error}</ErrorMessage>
                {results !== null && (
                    <div className="double table">
                        <table className="data compact">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Население</th>
                                    <th>Губернатор</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="cell empty">Ничего не найдено</div>
                                        </td>
                                    </tr>
                                )}
                                {results.map((city) => (
                                    <tr key={city.id}>
                                        <Cell>{city.id}</Cell>
                                        <Cell className="ellipsis">{city.name}</Cell>
                                        <Cell>{formatNumber(city.population)}</Cell>
                                        <Cell className="ellipsis">{city.governor?.name ?? '—'}</Cell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
};

const CountOperation = () => {
    const [meters, setMeters] = useState('');
    const { busy, notice, error, run, fail } = useAction();

    const submit = async () => {
        const value = toNumber(meters);

        if (meters.trim() === '' || value === null) {
            fail('Высота должна быть числом');
            return;
        }
        await run(async () => {
            const result = await countByMeters(value);
            return {
                success: result.success,
                message: result.success
                    ? `Высоту ${meters.trim()} м имеют ${result.data} ${plural(result.data, 'город', 'города', 'городов')}`
                    : result.data,
            };
        });
    };

    return (
        <Card title="Города заданной высоты" centered className="form-card">
            <div className="grid-input">
                <Field label="Высота, м">
                    <input
                        type="text"
                        inputMode="decimal"
                        className="input-data no-add"
                        value={meters}
                        onChange={(e) => setMeters(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                submit();
                            }
                        }}
                        placeholder="Высота городов над уровнем моря"
                    />
                </Field>
                <div className="double">
                    <button type="button" className="submit-btn" disabled={busy} onClick={submit}>
                        {busy ? 'Подсчёт…' : 'Посчитать города'}
                    </button>
                </div>
                <GoodMessage>{notice}</GoodMessage>
                <ErrorMessage>{error}</ErrorMessage>
            </div>
        </Card>
    );
};

/** Удаляет один любой город с выбранным климатом. Только администратор. */
const DeleteByClimateOperation = ({ onChange }) => {
    const [climate, setClimate] = useState(CLIMATES[0].value);
    const [confirming, setConfirming] = useState(false);
    const { busy, notice, error, run, reset } = useAction();

    const open = () => {
        reset();
        setConfirming(true);
    };

    const confirm = async () => {
        const data = await run(async () => {
            const result = await deleteByClimate(climate);
            return {
                success: result.success,
                data: result.data,
                message: result.success
                    ? `Удалён город «${result.data.name}» с климатом «${climateLabel(climate)}»`
                    : result.data,
            };
        });
        if (data) {
            setConfirming(false);
            onChange();
        }
    };

    return (
        <Card title="Удалить город с климатом" centered className="form-card">
            <div className="grid-input">
                <Field label="Климат">
                    <Select value={climate} onChange={setClimate}>
                        {CLIMATES.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </Select>
                </Field>
                <div className="double">
                    <button type="button" className="exit-btn" disabled={busy} onClick={open}>
                        Удалить один город с таким климатом
                    </button>
                </div>
                <GoodMessage>{confirming ? '' : notice}</GoodMessage>
                <ErrorMessage>{confirming ? '' : error}</ErrorMessage>
            </div>
            <Modal
                open={confirming}
                title="Удаление города"
                text={`Удалить один город с климатом «${climateLabel(climate)}»? Действие нельзя отменить.`}
                confirmText="Удалить"
                busy={busy}
                error={error}
                onConfirm={confirm}
                onClose={() => setConfirming(false)}
            />
        </Card>
    );
};

/** Переселяет всё население источника в выбранный город, источник удаляется. */
const MoveOperation = ({ cities, loadError, onChange }) => {
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');
    const [confirming, setConfirming] = useState(false);
    const { busy, notice, error, run, reset, fail } = useAction();

    const sourceCity = cities.find((city) => String(city.id) === source);
    const targetCity = cities.find((city) => String(city.id) === target);

    const options = (exclude) =>
        cities
            .filter((city) => String(city.id) !== exclude)
            .map((city) => (
                <option key={city.id} value={city.id}>
                    #{city.id} — {city.name} ({formatNumber(city.population)})
                </option>
            ));

    const open = () => {
        reset();
        if (!source || !target) {
            fail('Выберите город-источник и город-получатель');
            return;
        }
        setConfirming(true);
    };

    const confirm = async () => {
        const data = await run(async () => {
            const result = await movePopulation(Number(source), Number(target));
            return {
                success: result.success,
                data: result.data,
                message: result.success
                    ? `Население переселено в «${result.data.name}» — теперь там ${formatNumber(result.data.population)}`
                    : result.data,
            };
        });
        if (data) {
            setConfirming(false);
            setSource('');
            setTarget('');
            onChange();
        }
    };

    return (
        <Card title="Переселить население" centered className="form-card">
            <div className="grid-input">
                <Field label="Источник">
                    <Select
                        value={source}
                        onChange={(value) => {
                            setSource(value);
                            if (value === target) {
                                setTarget('');
                            }
                        }}
                    >
                        <option value="">Выберите город</option>
                        {options('')}
                    </Select>
                </Field>
                <Field label="Получатель">
                    <Select value={target} onChange={setTarget}>
                        <option value="">Выберите город</option>
                        {options(source)}
                    </Select>
                </Field>
                <div className="double">
                    <button type="button" className="exit-btn" disabled={busy} onClick={open}>
                        Переселить население
                    </button>
                </div>
                <GoodMessage>{confirming ? '' : notice}</GoodMessage>
                <ErrorMessage>{loadError || (confirming ? '' : error)}</ErrorMessage>
            </div>
            <Modal
                open={confirming}
                title="Переселение населения"
                text={`Переселить всё население города «${sourceCity?.name}» в город «${targetCity?.name}»? Город-источник будет удалён.`}
                confirmText="Переселить"
                busy={busy}
                error={error}
                onConfirm={confirm}
                onClose={() => setConfirming(false)}
            />
        </Card>
    );
};

/** Переселяет всё население источника в наименее населённый город. */
const MoveToSmallestOperation = ({ cities, loadError, onChange }) => {
    const [source, setSource] = useState('');
    const [confirming, setConfirming] = useState(false);
    const { busy, notice, error, run, reset, fail } = useAction();

    const sourceCity = cities.find((city) => String(city.id) === source);

    const open = () => {
        reset();
        if (!source) {
            fail('Выберите город-источник');
            return;
        }
        setConfirming(true);
    };

    const confirm = async () => {
        const data = await run(async () => {
            const result = await movePopulationToSmallest(Number(source));
            return {
                success: result.success,
                data: result.data,
                message: result.success
                    ? `Население переселено в «${result.data.name}» — теперь там ${formatNumber(result.data.population)}`
                    : result.data,
            };
        });
        if (data) {
            setConfirming(false);
            setSource('');
            onChange();
        }
    };

    return (
        <Card title="Переселить в наименее населённый город" centered className="form-card">
            <div className="grid-input">
                <Field label="Источник">
                    <Select value={source} onChange={setSource}>
                        <option value="">Выберите город</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                #{city.id} — {city.name} ({formatNumber(city.population)})
                            </option>
                        ))}
                    </Select>
                </Field>
                <div className="double">
                    <button type="button" className="exit-btn" disabled={busy} onClick={open}>
                        Переселить население
                    </button>
                </div>
                <GoodMessage>{confirming ? '' : notice}</GoodMessage>
                <ErrorMessage>{loadError || (confirming ? '' : error)}</ErrorMessage>
            </div>
            <Modal
                open={confirming}
                title="Переселение населения"
                text={`Переселить всё население города «${sourceCity?.name}» в наименее населённый город? Город-источник будет удалён.`}
                confirmText="Переселить"
                busy={busy}
                error={error}
                onConfirm={confirm}
                onClose={() => setConfirming(false)}
            />
        </Card>
    );
};

/**
 * Спецоперации идут одной колонкой, каждая — в отдельной плашке.
 * Поиск и подсчёт доступны всем; удаление и переселение видит только администратор.
 */
const SpecialOperations = () => {
    const user = useSelector((state) => state.auth.user);
    const isAdmin = user?.level === 'ADMIN';
    const options = useCityOptions(isAdmin);

    return (
        <>
            <SearchOperation />
            <CountOperation />
            {isAdmin && (
                <>
                    <DeleteByClimateOperation onChange={options.load} />
                    <MoveOperation cities={options.cities} loadError={options.error} onChange={options.load} />
                    <MoveToSmallestOperation cities={options.cities} loadError={options.error} onChange={options.load} />
                </>
            )}
        </>
    );
};

export default SpecialOperations;
