import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ConfirmProvider } from './context/ConfirmContext';
import { NotificationProvider } from './context/NotificationContext';
import { ParametrosProvider } from './context/ParametrosContext';

function App() {
  return (
    <NotificationProvider>
      <ParametrosProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
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
                {/* Add more routes here later */}
                <Route path="*" element={<DashboardHome />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ParametrosProvider>
    </NotificationProvider>
  );
}

export default App;
