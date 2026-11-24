import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../main/card';
import { ErrorMessage, GoodMessage } from '../main/message';
import { importBatch } from '../../controllers/importApi';
import { formatFileSize } from '../../utils/format';

const ImportForm = () => {
    const navigate = useNavigate();
    const input = useRef(null);
    const [file, setFile] = useState(null);
    const [over, setOver] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const pick = (chosen) => {
        setNotice('');
        if (!chosen) {
            return;
        }
        if (!chosen.name.toLowerCase().endsWith('.json')) {
            setFile(null);
            setError('Выберите файл с расширением .json');
            return;
        }
        setFile(chosen);
        setError('');
    };

    const submit = async (event) => {
        event.preventDefault();
        setNotice('');

        if (!file) {
            setError('Выберите JSON-файл с объектами');
            return;
        }

        let batch;
        try {
            batch = JSON.parse(await file.text());
        } catch {
            setError('Файл не является корректным JSON');
            return;
        }

        setBusy(true);
        const result = await importBatch(batch, file.name);
        setBusy(false);

        if (!result.success) {
            setError(`${result.data}. Ни один объект не был создан.`);
            return;
        }
        if (input.current) {
            input.current.value = '';
        }
        setFile(null);
        setError('');
        setNotice(`Импортировано объектов: ${result.data.imported}`);
    };

    const openPicker = () => input.current?.click();

    return (
        <Card
            title="Импорт объектов из файла"
            centered
            className="form-card"
        >
            <form onSubmit={submit}>
                <div
                    className={`dropzone ${over ? 'over' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={openPicker}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openPicker();
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setOver(true);
                    }}
                    onDragLeave={() => setOver(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setOver(false);
                        pick(event.dataTransfer.files[0]);
                    }}
                >
                    <span className="file-name">
                        {file ? file.name : 'Перетащите JSON-файл сюда'}
                    </span>
                    <span className="info">
                        {file
                            ? `${formatFileSize(file.size)} · нажмите, чтобы выбрать другой`
                            : 'или нажмите, чтобы выбрать файл'}
                    </span>
                </div>
                <input
                    ref={input}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(event) => pick(event.target.files[0])}
                />
                <div className="button-row spaced">
                    <button type="submit" className="submit-btn" disabled={busy || !file}>
                        {busy ? 'Импорт…' : 'Импортировать'}
                    </button>
                </div>
                <GoodMessage>{notice}</GoodMessage>
                <ErrorMessage>{error}</ErrorMessage>
                <div className="links">
                    <button type="button" className="more-btn" onClick={() => navigate('/prepare')}>
                        Собрать файл на сайте
                    </button>
                    <button type="button" className="more-btn" onClick={() => navigate('/history')}>
                        История импорта
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default ImportForm;
