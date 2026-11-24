import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card } from '../main/card';
import { GoodMessage, Messages } from '../main/message';
import Modal from '../main/modal';
import { remove } from '../../controllers/cities';
import { CITY_COLUMNS } from '../../utils/enums';
import { formatNumber } from '../../utils/format';
import useUpdates from '../../utils/useUpdates';
import { clearNotice, setNotice, setOffset, setQuery } from '../../store/slices/citiesSlice';

const COLUMNS = CITY_COLUMNS.length + 1;

const cell = (value) => {
    if (value === undefined || value === null || value === '') {
        return '—';
    }
    return typeof value === 'number' ? formatNumber(value) : value;
};

const CityTable = ({ error, notice, reload }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, totalCount, loading, query } = useSelector((state) => state.cities);
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const pages = Math.max(1, Math.ceil(totalCount / query.limit));
    const page = Math.floor(query.offset / query.limit) + 1;

    useUpdates(['cities'], reload);

    const sort = (field) => {
        const active = query.sortField === field;
        dispatch(clearNotice());
        dispatch(setQuery({ sortField: field, ascending: active ? !query.ascending : true }));
    };

    const turn = (direction) => {
        dispatch(clearNotice());
        dispatch(setOffset(Math.max(0, query.offset + direction * query.limit)));
    };

    const closeDelete = () => {
        setTarget(null);
        setDeleteError('');
    };

    const confirmDelete = async () => {
        setBusy(true);
        const result = await remove(target.id);
        setBusy(false);

        if (!result.success) {
            setDeleteError(result.data);
            return;
        }

        dispatch(setNotice(`Город «${target.name}» удалён`));
        closeDelete();

        if (items.length === 1 && query.offset > 0) {
            dispatch(setOffset(query.offset - query.limit));
        } else {
            reload();
        }
    };

    const edit = (city) => (event) => {
        event.stopPropagation();
        navigate(`/city/${city.id}`);
    };

    const openDelete = (city) => (event) => {
        event.stopPropagation();
        setDeleteError('');
        setTarget(city);
    };

    return (
        <Card title="Города" double>
            <GoodMessage>{notice}</GoodMessage>
            <Messages error={error} />
            <div className="table">
                <table className="data compact sticky-last">
                    <thead>
                        <tr>
                            {CITY_COLUMNS.map(({ field, title }) => {
                                const active = query.sortField === field;
                                return (
                                    <th
                                        key={field}
                                        aria-sort={active ? (query.ascending ? 'ascending' : 'descending') : undefined}
                                    >
                                        <button
                                            type="button"
                                            className={`sort-btn ${active ? 'active' : ''}`}
                                            title={`Сортировать по колонке «${title}»`}
                                            onClick={() => sort(field)}
                                        >
                                            {title}
                                            {active && <span className="arrow">{query.ascending ? '▲' : '▼'}</span>}
                                        </button>
                                    </th>
                                );
                            })}
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={COLUMNS}>
                                    <div className="cell empty">Загрузка…</div>
                                </td>
                            </tr>
                        )}
                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS}>
                                    <div className="cell empty">
                                        {query.filterValue ? 'По фильтру ничего не найдено' : 'Список городов пуст'}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && items.map((city) => (
                            <tr key={city.id} className="clickable" onClick={() => navigate(`/city/${city.id}`)}>
                                {CITY_COLUMNS.map(({ field, get, ellipsis }) => {
                                    const value = cell(get(city));
                                    return (
                                        <td key={field}>
                                            <div className={`cell ${ellipsis ? 'ellipsis' : ''}`} title={ellipsis ? value : undefined}>
                                                {value}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td>
                                    <div className="cell actions">
                                        <button type="button" className="small-btn" onClick={edit(city)}>
                                            Изменить
                                        </button>
                                        <button type="button" className="small-btn danger" onClick={openDelete(city)}>
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pager">
                <button type="button" className="pill-btn" disabled={query.offset === 0 || loading} onClick={() => turn(-1)}>
                    Назад
                </button>
                <span className="info">
                    Страница {page} из {pages}
                </span>
                <button
                    type="button"
                    className="pill-btn"
                    disabled={query.offset + query.limit >= totalCount || loading}
                    onClick={() => turn(1)}
                >
                    Вперёд
                </button>
            </div>
            <Modal
                open={Boolean(target)}
                title="Удаление города"
                text={target ? `Удалить город «${target.name}»? Действие нельзя отменить.` : ''}
                confirmText="Удалить"
                busy={busy}
                error={deleteError}
                onConfirm={confirmDelete}
                onClose={closeDelete}
            />
        </Card>
    );
};

export default CityTable;
