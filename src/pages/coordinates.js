import React from 'react';
import Page from '../components/main/page';
import CoordinatesSection from '../components/coordinates/card';
import useRequireAuth from '../utils/useRequireAuth';

const CoordinatesPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться в начало', to: '/', exact: true }} loading={!ready}>
            <CoordinatesSection />
        </Page>
    );
};

export default CoordinatesPage;
