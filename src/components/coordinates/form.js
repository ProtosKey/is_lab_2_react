import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Field } from '../main/card';
import { ErrorMessage } from '../main/message';
import Modal from '../main/modal';
import Select from '../main/select';
import * as api from '../../controllers/coordinates';
import { setCoordinates } from '../../store/slices/listSlices';
import useList from '../../utils/useList';
import useDeleteUsage from '../../utils/useDeleteUsage';
import { toInteger, validateCoordinates } from '../../utils/validate';

const EMPTY = { x: '', y: '' };

const CoordinatesForm = ({ id }) => {
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { items: allItems } = useList((state) => state.coordinates.items, setCoordinates, api.findAll);
    const [item, setItem] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(isEdit);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const del = useDeleteUsage(api.usage);

    useEffect(() => {
        setError('');
        setConfirming(false);
        setItem(null);
        setForm(EMPTY);

        if (!isEdit) {
            setLoading(false);
            return undefined;
        }

        let mounted = true;
        setLoading(true);
        api.findById(id).then((result) => {
            if (!mounted) {
                return;
            }
            setLoading(false);
            if (result.success) {
                setItem(result.data);
                setForm({ x: String(result.data.x ?? ''), y: String(result.data.y ?? '') });
            } else {
                setError(result.data);
            }
        });
        return () => {
            mounted = false;
        };
    }, [id, isEdit]);

    const set = (name) => (event) => {
        setError('');
        setForm((prev) => ({ ...prev, [name]: event.target.value }));
    };

    const submit = async (event) => {
        event.preventDefault();

        const problem = validateCoordinates(form);
        if (problem) {
            setError(problem);
            return;
        }

        const payload = { x: toInteger(form.x), y: toInteger(form.y) };
        setBusy(true);
        const result = isEdit ? await api.update(id, payload) : await api.create(payload);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }
        navigate('/coordinates');
    };

    const confirmDelete = async () => {
        setBusy(true);
        const result = await api.remove(id, del.replacement);
        setBusy(false);

        if (!result.success) {
            del.setDeleteError(result.data);
            return;
        }
        navigate('/coordinates');
    };

    if (loading) {
        return (
            <Card title="Координаты" centered className="form-card">
                <p className="info">Загрузка…</p>
            </Card>
        );
    }

    if (isEdit && !item) {
        return (
            <Card title={`Координаты №${id}`} centered className="form-card">
                <ErrorMessage>{error}</ErrorMessage>
            </Card>
        );
    }

    return (
        <Card
            title={isEdit ? `Координаты №${id}` : 'Новые координаты'}
            centered
            className="form-card"
        >
            <form className="grid-input" onSubmit={submit}>
                {isEdit && item && (
                    <Field label="ID">
                        <input
                            className="input-data no-add"
                            value={item.id}
                            readOnly
                            aria-readonly="true"
                            tabIndex={-1}
                        />
                    </Field>
                )}
                <Field label="Координата X">
                    <input
                        type="text"
                        inputMode="numeric"
                        className="input-data no-add"
                        value={form.x}
                        onChange={set('x')}
                        placeholder="Абсцисса не больше 974"
                    />
                </Field>
                <Field label="Координата Y">
                    <input
                        type="text"
                        inputMode="numeric"
                        className="input-data no-add"
                        value={form.y}
                        onChange={set('y')}
                        placeholder="Целое число"
                    />
                </Field>
                <div>
                    <button type="button" className="more-btn" onClick={() => navigate('/coordinates')}>
                        Отмена
                    </button>
                </div>
                <div>
                    <button type="submit" className="submit-btn" disabled={busy}>
                        {busy ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Создать координаты'}
                    </button>
                </div>
                {isEdit && (
                    <div className="double">
                        <button
                            type="button"
                            className="exit-btn"
                            onClick={() => {
                                setConfirming(true);
                                del.prepare(id);
                            }}
                        >
                            Удалить координаты
                        </button>
                    </div>
                )}
                <ErrorMessage>{error}</ErrorMessage>
            </form>
            <Modal
                open={confirming}
                title="Удаление координат"
                text={
                    del.needsReplacement
                        ? `Удалить координаты (${item?.x}, ${item?.y})? Связанные города будут переназначены на замену.`
                        : `Удалить координаты (${item?.x}, ${item?.y})?`
                }
                confirmText="Удалить"
                confirmDisabled={del.confirmDisabled}
                busy={busy}
                error={del.deleteError}
                onConfirm={confirmDelete}
                onClose={() => {
                    setConfirming(false);
                    del.reset();
                }}
            >
                {del.needsReplacement && (
                    <div className="grid-input">
                        <Field label="Замена">
                            <Select value={del.replacement} onChange={del.setReplacement}>
                                <option value="">Выберите замену</option>
                                {allItems
                                    .filter((entry) => String(entry.id) !== String(id))
                                    .map((entry) => (
                                        <option key={entry.id} value={entry.id}>
                                            #{entry.id} ({entry.x}, {entry.y})
                                        </option>
                                    ))}
                            </Select>
                        </Field>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default CoordinatesForm;
