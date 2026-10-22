import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthBootstrap from './components/AuthBootstrap';
import SessionSecurityManager from './components/SessionSecurityManager';
import ApiUnauthorizedHandler from './components/ApiUnauthorizedHandler';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSignIn from './pages/auth/AdminSignIn';
import SigninCallBackPage from './pages/auth/signinCallBackPage';
import LogoutCallback from './pages/auth/LogoutCallback';
import SilentRenew from './pages/auth/SilentRenew';
import Dashboard from './pages/Dashboard';
import NotFoundPage from './pages/NotFound.tsx';

import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004987'
    }
  },
  typography: {
    fontFamily: 'Avenir, sans-serif',
    h1: {
      fontFamily: 'Merriweather, serif'
    },
    h2: {
      fontFamily: 'Merriweather, serif'
    },
    h3: {
      fontFamily: 'Merriweather, serif'
    },
    h4: {
      fontFamily: 'Merriweather, serif'
    },
    h5: {
      fontFamily: 'Merriweather, serif'
    },
    h6: {
      fontFamily: 'Merriweather, serif'
    }
  }
});
export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <AuthBootstrap />
          <SessionSecurityManager />
          <ApiUnauthorizedHandler />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AdminSignIn/>} />
            <Route path="/auth/admin" element={<AdminSignIn/>} />
            <Route path="/callback" element={<SigninCallBackPage/>} />
            <Route path="/logout" element={<LogoutCallback />} />
            <Route path="/silent-renew" element={<SilentRenew />} />

            {/* Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
              <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/testing" element={
              <NotFoundPage/>
              } />
          </Routes>
           {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>);

}