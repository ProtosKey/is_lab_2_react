import React from 'react';
import Page from '../components/main/page';
import GovernorsSection from '../components/governors/card';
import useRequireAuth from '../utils/useRequireAuth';

const GovernorsPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться в начало', to: '/', exact: true }} loading={!ready}>
            <GovernorsSection />
        </Page>
    );
};

export default GovernorsPage;
