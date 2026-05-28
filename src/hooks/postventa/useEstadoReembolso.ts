import { useMemo } from 'react';
import type { TicketConReembolsoResponse } from '../../types/postventa.types';

export function useEstadoReembolso(ticket: TicketConReembolsoResponse) {
  return useMemo(
    () => ({
      tieneReembolso: ticket.estadoReembolso !== null,
      estadoReembolso: ticket.estadoReembolso,
      detalleReembolso: ticket.detalleReembolso,
    }),
    [ticket.estadoReembolso, ticket.detalleReembolso],
  );
}
