import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../main/card';
import { Messages } from '../main/message';
import { history } from '../../controllers/operations';
import { OPERATION_STATUSES, OPERATION_TYPES } from '../../utils/enums';
import useUpdates from '../../utils/useUpdates';
import useCursorPager from '../../utils/useCursorPager';

const Cell = ({ children, className }) => (
    <td>
        <div className={`cell ${className ?? ''}`}>{children}</div>
    </td>
);

const PAGE_LIMIT = 10;

const HistoryTable = () => {
    const user = useSelector((state) => state.auth.user);
    const isAdmin = user?.level === 'ADMIN';
    const [operations, setOperations] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const { cursor, page, hasPrev, hasMore, applyPage, next, prev } = useCursorPager();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const result = await history({ cursor, limit: PAGE_LIMIT });
        setLoading(false);
        if (result.success) {
            setOperations(result.data.items);
            setTotalCount(result.data.totalCount);
            applyPage(result.data);
            setError('');
        } else {
            setError(result.data);
        }
    }, [cursor, applyPage]);

    useEffect(() => {
        load();
    }, [load]);

    useUpdates(['operations'], load);

    const columns = isAdmin ? 8 : 7;
    const pages = Math.max(1, Math.ceil(totalCount / PAGE_LIMIT));

    return (
        <Card
            title="История импорта"
            subtitle={isAdmin ? 'Операции всех пользователей' : undefined}
            double
        >
            <Messages error={error} />
            <div className="table">
                <table className="data compact">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата</th>
                            <th>Тип</th>
                            <th>Статус</th>
                            <th>Объектов</th>
                            <th>Файл</th>
                            <th>Причина ошибки</th>
                            {isAdmin && <th>Пользователь</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={columns}>
                                    <div className="cell empty">Загрузка…</div>
                                </td>
                            </tr>
                        )}
                        {!loading && operations.length === 0 && (
                            <tr>
                                <td colSpan={columns}>
                                    <div className="cell empty">Операций пока нет</div>
                                </td>
                            </tr>
                        )}
                        {!loading && operations.map((operation) => {
                            const failed = operation.status === 'FAILED';
                            return (
                                <tr key={operation.id}>
                                    <Cell>{operation.id}</Cell>
                                    <Cell>{operation.creationDate ?? '—'}</Cell>
                                    <Cell>{OPERATION_TYPES[operation.type] ?? operation.type}</Cell>
                                    <Cell className={failed ? 'miss' : 'hit'}>
                                        {OPERATION_STATUSES[operation.status] ?? operation.status}
                                    </Cell>
                                    <Cell>{failed ? '—' : operation.objectCount ?? '—'}</Cell>
                                    <Cell>{operation.fileName ?? '—'}</Cell>
                                    <Cell className="wrap">{failed ? operation.message ?? '—' : '—'}</Cell>
                                    {isAdmin && <Cell>{operation.userLogin}</Cell>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="pager">
                <button type="button" className="pill-btn" disabled={!hasPrev || loading} onClick={prev}>
                    Назад
                </button>
                <span className="info">
                    Страница {page} из {pages}
                </span>
                <button
                    type="button"
                    className="pill-btn"
                    disabled={!hasMore || loading}
                    onClick={next}
                >
                    Вперёд
                </button>
                <button type="button" className="pill-btn" disabled={loading} onClick={load}>
                    Обновить
                </button>
            </div>
        </Card>
    );
};

export default HistoryTable;
