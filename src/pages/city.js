import React from 'react';
import { useParams } from 'react-router-dom';
import Page from '../components/main/page';
import CityForm from '../components/city/form';
import useRequireAuth from '../utils/useRequireAuth';

const CityPage = () => {
    const { id } = useParams();
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <CityForm id={id} />
        </Page>
    );
};

export default CityPage;
