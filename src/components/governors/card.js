import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from '../main/select';
import { Card, Field } from '../main/card';
import { GoodMessage, Messages } from '../main/message';
import Modal from '../main/modal';
import * as api from '../../controllers/governors';
import { setGovernors } from '../../store/slices/listSlices';
import useList from '../../utils/useList';
import useDeleteUsage from '../../utils/useDeleteUsage';
import useUpdates from '../../utils/useUpdates';
import useCursorPager from '../../utils/useCursorPager';
import { plural } from '../../utils/format';

const PAGE_LIMIT = 10;

const GovernorsSection = () => {
    const navigate = useNavigate();
    const { items: allItems, load: loadAll } = useList((state) => state.governors.items, setGovernors, api.findAll);
    const [pageItems, setPageItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const { cursor, page, hasPrev, hasMore, applyPage, next, prev } = useCursorPager();
    const [pageLoading, setPageLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);
    const del = useDeleteUsage(api.usage);

    const loadPage = useCallback(async (nextCursor = cursor) => {
        setPageLoading(true);
        const result = await api.findPage({ cursor: nextCursor, limit: PAGE_LIMIT });
        setPageLoading(false);
        if (result.success) {
            setPageItems(result.data.items);
            setTotalCount(result.data.totalCount);
            applyPage(result.data);
            setLoadError('');
        } else {
            setLoadError(result.data);
        }
    }, [cursor, applyPage]);

    useEffect(() => {
        loadPage(cursor);
    }, [cursor, loadPage]);

    useUpdates(['governors'], () => {
        loadPage(cursor);
        loadAll();
    });

    const closeDelete = () => {
        setTarget(null);
        del.reset();
    };

    const openDelete = (item) => {
        setTarget(item);
        del.prepare(item.id);
    };

    const confirmDelete = async () => {
        setBusy(true);
        const result = await api.remove(target.id, del.replacement);
        setBusy(false);

        if (!result.success) {
            del.setDeleteError(result.data);
            return;
        }
        setNotice(`Губернатор ${target.name} удалён`);
        closeDelete();
        if (pageItems.length <= 1 && hasPrev) {
            prev();
        } else {
            await loadPage(cursor);
        }
        await loadAll();
    };

    const pages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

    return (
        <>
            <Card centered className="form-card">
                <button type="button" className="submit-btn green" onClick={() => navigate('/governor')}>
                    Добавить губернатора
                </button>
            </Card>
            <Card
                title="Губернаторы"
                subtitle={`${totalCount} ${plural(totalCount, 'запись', 'записи', 'записей')}`}
                centered
                className="form-card"
            >
                <GoodMessage>{notice}</GoodMessage>
                <Messages error={loadError} />
                <div className="table">
                    <table className="data compact">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Возраст</th>
                                <th>День рождения</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="cell empty">{pageLoading ? 'Загрузка…' : 'Записей пока нет'}</div>
                                    </td>
                                </tr>
                            )}
                            {pageItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="clickable"
                                    onClick={() => navigate(`/governor/${item.id}`)}
                                >
                                    <td>
                                        <div className="cell">{item.id}</div>
                                    </td>
                                    <td>
                                        <div className="cell ellipsis" title={item.name}>{item.name}</div>
                                    </td>
                                    <td>
                                        <div className="cell">{item.age}</div>
                                    </td>
                                    <td>
                                        <div className="cell">{item.birthday ?? '—'}</div>
                                    </td>
                                    <td>
                                        <div className="cell actions">
                                            <button
                                                type="button"
                                                className="small-btn"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/governor/${item.id}`);
                                                }}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                type="button"
                                                className="small-btn danger"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openDelete(item);
                                                }}
                                            >
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
                    <button type="button" className="pill-btn" disabled={!hasPrev || pageLoading} onClick={prev}>
                        Назад
                    </button>
                    <span className="info">
                        Страница {page} из {pages}
                    </span>
                    <button
                        type="button"
                        className="pill-btn"
                        disabled={!hasMore || pageLoading}
                        onClick={next}
                    >
                        Вперёд
                    </button>
                </div>
            </Card>
            <Modal
                open={Boolean(target)}
                title="Удаление губернатора"
                text={
                    del.needsReplacement
                        ? `Удалить губернатора ${target?.name}? Связанные города будут переданы замене.`
                        : `Удалить губернатора ${target?.name}?`
                }
                confirmText="Удалить"
                confirmDisabled={del.confirmDisabled}
                busy={busy}
                error={del.deleteError}
                onConfirm={confirmDelete}
                onClose={closeDelete}
            >
                {del.needsReplacement && (
                    <div className="grid-input">
                        <Field label="Замена">
                            <Select value={del.replacement} onChange={del.setReplacement}>
                                <option value="">Выберите замену</option>
                                {allItems
                                    .filter((item) => item.id !== target?.id)
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>
                                            #{item.id} {item.name}
                                        </option>
                                    ))}
                            </Select>
                        </Field>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default GovernorsSection;
