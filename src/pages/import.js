import React from 'react';
import Page from '../components/main/page';
import ImportForm from '../components/import/form';
import useRequireAuth from '../utils/useRequireAuth';

const ImportPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <ImportForm />
        </Page>
    );
};

export default ImportPage;
