import React from 'react';
import Page from '../components/main/page';
import HistoryTable from '../components/history/table';
import useRequireAuth from '../utils/useRequireAuth';

const HistoryPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <HistoryTable />
        </Page>
    );
};

export default HistoryPage;
