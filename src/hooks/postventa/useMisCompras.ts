import { useQuery } from '@tanstack/react-query';
import { postVentaService } from '../../services/postVentaService';

// UUID hardcodeado hasta que exista módulo de autenticación
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

export function useMisCompras() {
  return useQuery({
    queryKey: ['misTickets', TEMP_USER_ID],
    queryFn: () => postVentaService.getMisTickets(TEMP_USER_ID),
  });
}
