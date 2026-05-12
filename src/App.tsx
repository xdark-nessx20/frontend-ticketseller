import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sileo';
import { VenueListPage } from './pages/recintos/VenueListPage';
import { VenueDetailPage } from './pages/recintos/VenueDetailPage';
import { CreateVenuePage } from './pages/recintos/CreateVenuePage';
import { EditVenuePage } from './pages/recintos/EditVenuePage';
import { EventosPage } from './pages/eventos/EventosPage';
import { EventoDetallePage } from './pages/eventos/EventoDetallePage';
import { MapaAsientosPage } from './pages/asientos/MapaAsientosPage';
import { PromocionesPage } from './pages/promociones/PromocionesPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" offset={{ top: 48 }} options={{fill: "#f6f3ea"}}/>
      <header className="bg-[#413383] px-6 py-3">
        <span className="text-lg font-bold text-white">TicketSeller</span>
      </header>
      <main>
        <Routes>
          <Route path="/admin/recintos" element={<VenueListPage />} />
          <Route path="/admin/recintos/nuevo" element={<CreateVenuePage />} />
          <Route path="/admin/recintos/:id" element={<VenueDetailPage />} />
          <Route path="/admin/recintos/:id/editar" element={<EditVenuePage />} />
          <Route path="/admin/recintos/:id/mapa" element={<MapaAsientosPage />} />
          <Route path="/admin/eventos" element={<EventosPage />} />
          <Route path="/admin/eventos/:id" element={<EventoDetallePage />} />
          <Route path="/admin/eventos/:eventoId/promociones" element={<PromocionesPage />} />
          <Route path="*" element={<Navigate to="/admin/recintos" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
