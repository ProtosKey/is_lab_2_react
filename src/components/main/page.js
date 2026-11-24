import React from 'react';
import Header from './header';
import BackButton from './button';

const Page = ({ back, loading = false, children }) => (
    <div className="body-content">
        <div className="grid-container">
            <Header />
            {loading ? (
                <div className="container centered">
                    <div className="container-content">
                        <p className="info">Загрузка…</p>
                    </div>
                </div>
            ) : (
                children
            )}
            {back && <BackButton value={back.value} to={back.to} exact={back.exact} onClick={back.onClick} />}
        </div>
    </div>
);

export default Page;
