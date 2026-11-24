import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Field } from '../main/card';
import DateInput from '../main/date';
import { ErrorMessage } from '../main/message';
import Modal from '../main/modal';
import Select from '../main/select';
import * as api from '../../controllers/governors';
import { setGovernors } from '../../store/slices/listSlices';
import useList from '../../utils/useList';
import useDeleteUsage from '../../utils/useDeleteUsage';
import { governorPayload, validateGovernor } from '../../utils/validate';

const EMPTY = { name: '', age: '', birthday: '' };

const GovernorForm = ({ id }) => {
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { items: allItems } = useList((state) => state.governors.items, setGovernors, api.findAll);
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
                setForm({
                    name: result.data.name ?? '',
                    age: String(result.data.age ?? ''),
                    birthday: result.data.birthday ?? '',
                });
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

        const problem = validateGovernor(form);
        if (problem) {
            setError(problem);
            return;
        }

        const payload = governorPayload(form);
        setBusy(true);
        const result = isEdit ? await api.update(id, payload) : await api.create(payload);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }
        navigate('/governors');
    };

    const confirmDelete = async () => {
        setBusy(true);
        const result = await api.remove(id, del.replacement);
        setBusy(false);

        if (!result.success) {
            del.setDeleteError(result.data);
            return;
        }
        navigate('/governors');
    };

    if (loading) {
        return (
            <Card title="Губернатор" centered className="form-card">
                <p className="info">Загрузка…</p>
            </Card>
        );
    }

    if (isEdit && !item) {
        return (
            <Card title={`Губернатор №${id}`} centered className="form-card">
                <ErrorMessage>{error}</ErrorMessage>
            </Card>
        );
    }

    return (
        <Card
            title={isEdit ? `Губернатор №${id}` : 'Новый губернатор'}
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
                <Field label="Имя">
                    <input
                        className="input-data no-add"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Уникальное имя"
                    />
                </Field>
                <Field label="Возраст">
                    <input
                        type="text"
                        inputMode="numeric"
                        className="input-data no-add"
                        value={form.age}
                        onChange={set('age')}
                        placeholder="Полных лет"
                    />
                </Field>
                <Field label="День рождения">
                    <DateInput
                        value={form.birthday}
                        onChange={(value) => {
                            setError('');
                            setForm((prev) => ({ ...prev, birthday: value }));
                        }}
                    />
                </Field>
                <div>
                    <button type="button" className="more-btn" onClick={() => navigate('/governors')}>
                        Отмена
                    </button>
                </div>
                <div>
                    <button type="submit" className="submit-btn" disabled={busy}>
                        {busy ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Создать губернатора'}
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
                            Удалить губернатора
                        </button>
                    </div>
                )}
                <ErrorMessage>{error}</ErrorMessage>
            </form>
            <Modal
                open={confirming}
                title="Удаление губернатора"
                text={
                    del.needsReplacement
                        ? `Удалить губернатора «${item?.name}»? Связанные города будут переданы замене.`
                        : `Удалить губернатора «${item?.name}»?`
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
                                            #{entry.id} — {entry.name}
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

export default GovernorForm;
