import { Routes, Route, Navigate } from 'react-router-dom';
import { VenueListPage } from './pages/recintos/VenueListPage';
import { VenueDetailPage } from './pages/recintos/VenueDetailPage';
import { CreateVenuePage } from './pages/recintos/CreateVenuePage';
import { EditVenuePage } from './pages/recintos/EditVenuePage';

function App() {
  return (
    <Routes>
      <Route path="/admin/recintos" element={<VenueListPage />} />
      <Route path="/admin/recintos/nuevo" element={<CreateVenuePage />} />
      <Route path="/admin/recintos/:id" element={<VenueDetailPage />} />
      <Route path="/admin/recintos/:id/editar" element={<EditVenuePage />} />
      <Route path="*" element={<Navigate to="/admin/recintos" replace />} />
    </Routes>
  );
}

export default App;
