import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from '../main/select';
import { Card, Field } from '../main/card';
import { GoodMessage, Messages } from '../main/message';
import Modal from '../main/modal';
import * as api from '../../controllers/coordinates';
import { setCoordinates } from '../../store/slices/listSlices';
import useList from '../../utils/useList';
import useDeleteUsage from '../../utils/useDeleteUsage';
import { plural } from '../../utils/format';

const PAGE_LIMIT = 10;

const CoordinatesSection = () => {
    const navigate = useNavigate();
    const { items: allItems, load: loadAll } = useList((state) => state.coordinates.items, setCoordinates, api.findAll);
    const [pageItems, setPageItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [pageLoading, setPageLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);
    const del = useDeleteUsage(api.usage);

    const loadPage = useCallback(async (nextOffset = offset) => {
        setPageLoading(true);
        const result = await api.findPage({ offset: nextOffset, limit: PAGE_LIMIT });
        setPageLoading(false);
        if (result.success) {
            setPageItems(result.data.items);
            setTotalCount(result.data.totalCount);
            setLoadError('');
        } else {
            setLoadError(result.data);
        }
    }, [offset]);

    useEffect(() => {
        loadPage(offset);
    }, [offset, loadPage]);

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
        setNotice(`Координаты (${target.x}, ${target.y}) удалены`);
        closeDelete();
        const nextOffset = pageItems.length <= 1 && offset > 0 ? Math.max(0, offset - PAGE_LIMIT) : offset;
        if (nextOffset !== offset) {
            setOffset(nextOffset);
        } else {
            await loadPage(nextOffset);
        }
        await loadAll();
    };

    const pages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));
    const page = Math.floor(offset / PAGE_LIMIT) + 1;
    const turn = (delta) => setOffset((prev) => Math.max(0, prev + delta * PAGE_LIMIT));

    return (
        <>
            <Card centered className="form-card">
                <button type="button" className="submit-btn green" onClick={() => navigate('/coordinate')}>
                    Добавить координаты
                </button>
            </Card>
            <Card
                title="Координаты"
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
                                <th>X</th>
                                <th>Y</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length === 0 && (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="cell empty">{pageLoading ? 'Загрузка…' : 'Записей пока нет'}</div>
                                    </td>
                                </tr>
                            )}
                            {pageItems.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="cell">{item.id}</div>
                                    </td>
                                    <td>
                                        <div className="cell">{item.x}</div>
                                    </td>
                                    <td>
                                        <div className="cell">{item.y}</div>
                                    </td>
                                    <td>
                                        <div className="cell actions">
                                            <button type="button" className="small-btn" onClick={() => navigate(`/coordinate/${item.id}`)}>
                                                Изменить
                                            </button>
                                            <button type="button" className="small-btn danger" onClick={() => openDelete(item)}>
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
                    <button type="button" className="pill-btn" disabled={offset === 0 || pageLoading} onClick={() => turn(-1)}>
                        Назад
                    </button>
                    <span className="info">
                        Страница {page} из {pages}
                    </span>
                    <button
                        type="button"
                        className="pill-btn"
                        disabled={offset + PAGE_LIMIT >= totalCount || pageLoading}
                        onClick={() => turn(1)}
                    >
                        Вперёд
                    </button>
                </div>
            </Card>
            <Modal
                open={Boolean(target)}
                title="Удаление координат"
                text={
                    del.needsReplacement
                        ? `Удалить координаты (${target?.x}, ${target?.y})? Связанные города будут переназначены на замену.`
                        : `Удалить координаты (${target?.x}, ${target?.y})?`
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
                                            #{item.id} — ({item.x}, {item.y})
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

export default CoordinatesSection;
