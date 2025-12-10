import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import MonedasPage from './pages/MonedasPage';
import OperacionesPage from './pages/OperacionesPage';
import ClientesPage from './pages/ClientesPage';
import TiposMovimientoPage from './pages/TiposMovimientoPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import ParametroList from './components/parametros/ParametroList';
import PlanillaList from './components/planillas/PlanillaList';
import PlanillaForm from './components/planillas/PlanillaForm';
import CtaCtePorCliente from './components/ctacte/CtaCtePorCliente';
import { ConfirmProvider } from './context/ConfirmContext';
import { NotificationProvider } from './context/NotificationContext';
import { ParametrosProvider } from './context/ParametrosContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  const GOOGLE_CLIENT_ID = "172467646216-rk7ag0drki2bdj5vsbfjsp9b504qag07.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <ParametrosProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="monedas" element={<MonedasPage />} />
                      <Route path="operaciones" element={<OperacionesPage />} />
                      <Route path="clientes" element={<ClientesPage />} />
                      <Route path="tipos-movimiento" element={<TiposMovimientoPage />} />
                      <Route path="planillas" element={<PlanillaList />} />
                      <Route path="planillas/nuevo" element={<PlanillaForm />} />
                      <Route path="planillas/editar/:id" element={<PlanillaForm />} />
                      <Route path="configuracion" element={<ConfiguracionPage />} />
                      <Route path="parametros" element={<ParametroList />} />
                      <Route path="ctacte/cliente" element={<CtaCtePorCliente />} />
                      <Route path="*" element={<DashboardHome />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </ConfirmProvider>
          </ParametrosProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
