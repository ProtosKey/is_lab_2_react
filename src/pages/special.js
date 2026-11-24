import React from 'react';
import Page from '../components/main/page';
import SpecialOperations from '../components/special/operations';
import useRequireAuth from '../utils/useRequireAuth';

const SpecialPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <SpecialOperations />
        </Page>
    );
};

export default SpecialPage;
