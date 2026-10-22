import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearApiAccessToken, setApiUnauthorizedHandler } from '../services/api';
import { useAppDispatch } from '../store';
import { logout } from '../store/authSlice';

const SESSION_EXPIRED_MESSAGE = 'Session Expired! Kindly login Again.';

export default function ApiUnauthorizedHandler() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isHandlingRef = useRef(false);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      if (isHandlingRef.current) {
        return;
      }

      isHandlingRef.current = true;
      window.sessionStorage.setItem('auth:signinError', SESSION_EXPIRED_MESSAGE);
      clearApiAccessToken();
      dispatch(logout());
      navigate('/auth/admin', { replace: true });
    });

    return () => {
      setApiUnauthorizedHandler(null);
    };
  }, [dispatch, navigate]);

  return null;
}
