import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ value, to, exact = false, onClick }) => {
    const navigate = useNavigate();

    const click = onClick ?? (() => {
        if (!exact && window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(to ?? '/main');
        }
    });

    return (
        <div className="container centered">
            <div className="container-content">
                <button className="submit-btn green" onClick={click}>
                    {value}
                </button>
            </div>
        </div>
    );
};

export default BackButton;
