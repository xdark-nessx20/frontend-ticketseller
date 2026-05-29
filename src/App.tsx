import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sileo';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ForbiddenPage from './pages/auth/ForbiddenPage';
import RegisterPage from './pages/auth/RegisterPage';
import { VenueListPage } from './pages/recintos/VenueListPage';
import { VenueDetailPage } from './pages/recintos/VenueDetailPage';
import { CreateVenuePage } from './pages/recintos/CreateVenuePage';
import { EditVenuePage } from './pages/recintos/EditVenuePage';
import { EventosPage } from './pages/eventos/EventosPage';
import { EventoDetallePage } from './pages/eventos/EventoDetallePage';
import { MapaAsientosPage } from './pages/asientos/MapaAsientosPage';
import { PromocionesPage } from './pages/promociones/PromocionesPage';
import { EventoAsientosPage } from './pages/checkout/EventoAsientosPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { ConfirmacionPage } from './pages/checkout/ConfirmacionPage';
import { PanelBloqueosPage } from './pages/bloqueos/PanelBloqueosPage';
import { InventarioEventoPage } from './pages/inventario/InventarioEventoPage';
import { MisComprasPage } from './pages/postventa/MisComprasPage';
import { AdminReembolsosPage } from './pages/postventa/AdminReembolsosPage';
import { TransaccionesPage } from './pages/transacciones/TransaccionesPage';

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPRADOR: 'COMPRADOR',
  AGENTE_VENTAS: 'AGENTE_VENTAS',
  PROMOTOR_EVENTOS: 'PROMOTOR_EVENTOS',
  ADMIN_RECINTO: 'ADMINISTRADOR_RECINTO',
  GESTOR_INVENTARIO: 'GESTOR_INVENTARIO',
  COORD_PATROCINIOS: 'COORDINADOR_PATROCINIOS',
  CONTROLADOR_ACCESOS: 'CONTROLADOR_ACCESOS',
  ADMIN_FINANCIERO: 'ADMINISTRADOR_FINANCIERO',
} as const;

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" offset={{ top: 48 }} options={{fill: "#f6f3ea"}}/>
      <header className="bg-[#413383] px-6 py-3">
        <span className="text-lg font-bold text-white">TicketSeller</span>
      </header>
      <main>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Administrador de recinto */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.ADMIN_RECINTO]} />}>
            <Route path="/admin/recintos" element={<VenueListPage />} />
            <Route path="/admin/recintos/nuevo" element={<CreateVenuePage />} />
            <Route path="/admin/recintos/:id" element={<VenueDetailPage />} />
            <Route path="/admin/recintos/:id/editar" element={<EditVenuePage />} />
          </Route>

          {/* Mapa de asientos: Admin recinto + Gestor inventario */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.ADMIN_RECINTO, ROLES.GESTOR_INVENTARIO]} />}>
            <Route path="/admin/recintos/:id/mapa" element={<MapaAsientosPage />} />
          </Route>

          {/* Promotor de eventos */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.PROMOTOR_EVENTOS]} />}>
            <Route path="/admin/eventos" element={<EventosPage />} />
            <Route path="/admin/eventos/:id" element={<EventoDetallePage />} />
            <Route path="/admin/eventos/:eventoId/promociones" element={<PromocionesPage />} />
          </Route>

          {/* Coordinador de patrocinios */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.COORD_PATROCINIOS]} />}>
            <Route path="/admin/eventos/:id/bloqueos" element={<PanelBloqueosPage />} />
          </Route>

          {/* Gestor de inventario */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.GESTOR_INVENTARIO]} />}>
            <Route path="/admin/eventos/:id/inventario" element={<InventarioEventoPage />} />
          </Route>

          {/* Comprador y agente de ventas */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.COMPRADOR, ROLES.AGENTE_VENTAS]} />}>
            <Route path="/eventos/:id/asientos" element={<EventoAsientosPage />} />
            <Route path="/checkout/:ventaId" element={<CheckoutPage />} />
            <Route path="/checkout/:ventaId/confirmacion" element={<ConfirmacionPage />} />
          </Route>

          {/* Solo comprador */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.COMPRADOR]} />}>
            <Route path="/mis-compras" element={<MisComprasPage />} />
          </Route>

          {/* Agente de ventas y administrador financiero */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.AGENTE_VENTAS, ROLES.ADMIN_FINANCIERO]} />}>
            <Route path="/admin/reembolsos" element={<AdminReembolsosPage />} />
          </Route>

          {/* Agente de ventas */}
          <Route element={<ProtectedRoute rolesPermitidos={[ROLES.SUPER_ADMIN, ROLES.AGENTE_VENTAS]} />}>
            <Route path="/admin/transacciones" element={<TransaccionesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
