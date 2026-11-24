import React from 'react';
import { useParams } from 'react-router-dom';
import Page from '../components/main/page';
import CoordinatesForm from '../components/coordinates/form';
import useRequireAuth from '../utils/useRequireAuth';

const CoordinatePage = () => {
    const ready = useRequireAuth();
    const { id } = useParams();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/coordinates' }} loading={!ready}>
            <CoordinatesForm id={id} />
        </Page>
    );
};

export default CoordinatePage;
