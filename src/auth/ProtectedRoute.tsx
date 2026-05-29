import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface Props {
  rolesPermitidos?: string[];
}

export function ProtectedRoute({ rolesPermitidos }: Props) {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
