import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import MonedasPage from './pages/MonedasPage';
import OperacionesPage from './pages/OperacionesPage';
import ClientesPage from './pages/ClientesPage';
import TiposMovimientoPage from './pages/TiposMovimientoPage';
import { ConfirmProvider } from './context/ConfirmContext';

function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="monedas" element={<MonedasPage />} />
            <Route path="operaciones" element={<OperacionesPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="tipos-movimiento" element={<TiposMovimientoPage />} />
            {/* Add more routes here later */}
            <Route path="*" element={<DashboardHome />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;
