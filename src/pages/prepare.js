import React from 'react';
import Page from '../components/main/page';
import Prepare from '../components/import/prepare';
import useRequireAuth from '../utils/useRequireAuth';

const PreparePage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/import' }} loading={!ready}>
            <Prepare />
        </Page>
    );
};

export default PreparePage;
