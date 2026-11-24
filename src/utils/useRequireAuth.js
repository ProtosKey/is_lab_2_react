import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { me } from '../controllers/auth';
import { setUser } from '../store/slices/authSlice';

export const useSession = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [checked, setChecked] = useState(Boolean(user));

    useEffect(() => {
        if (user) {
            return undefined;
        }
        let mounted = true;
        me().then((result) => {
            if (!mounted) {
                return;
            }
            if (result.success) {
                dispatch(setUser(result.data));
            }
            setChecked(true);
        });
        return () => {
            mounted = false;
        };
    }, [dispatch, user]);

    return { user, checked };
};

const useRequireAuth = () => {
    const navigate = useNavigate();
    const { user, checked } = useSession();

    useEffect(() => {
        if (checked && !user) {
            navigate('/login', { replace: true });
        }
    }, [checked, user, navigate]);

    return Boolean(user);
};

export default useRequireAuth;
