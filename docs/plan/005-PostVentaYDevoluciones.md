# Implementation Plan: Post-Venta y Devoluciones – Frontend

**Date**: 09/05/2026  
**Specs**:

- [005-PostVentaYDevoluciones.md](/docs/plan/005-PostVentaYDevoluciones.md)

## Summary

El **Comprador** debe poder consultar sus tickets, cancelar entradas individuales o en grupo, y hacer seguimiento del estado de sus reembolsos. El **Administrador** debe poder procesar reembolsos manuales, cambiar el estado de tickets individuales y disparar el procesamiento de la cola de reembolsos pendientes.

Este módulo expone dos secciones: el portal del comprador ("Mis Tickets") y el panel de administración de post-venta. El portal del comprador es de lectura/acción limitada; el panel admin tiene controles completos de estado y reembolsos.

Depende del plan 004 completado (los tickets existen porque se compraron).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: React 18+ (Vite)  
**Styling**: Tailwind CSS 3.x  
**Server State**: TanStack Query v5  
**Client State**: Zustand  
**HTTP Client**: Axios  
**Router**: React Router v6  
**Testing**: Vitest + React Testing Library + MSW  
**Target Platform**: Customer Portal + Admin Panel SPA  
**Performance Goals**: Listado de mis tickets carga en menos de 1s.  
**Constraints**: Un ticket VENDIDO solo puede cancelarse si el evento no está EN_PROGRESO o FINALIZADO. Los reembolsos automáticos los procesa el backend — el frontend solo muestra el estado. El reembolso manual requiere monto y agente.  
**Scale/Scope**: Feature post-compra — depende de plan 004.

## Coding Standards

> **⚠️ ADVERTENCIA — Reglas obligatorias de estilo de código:**
>
> 1. **NO crear comentarios innecesarios.**
> 2. **Clean Code**: nombres descriptivos, componentes pequeños.
> 3. **`interface`** para objetos, **`type`** para uniones.
> 4. Solo componentes funcionales.
> 5. Lógica en custom hooks.
> 6. Solo clases Tailwind.

## Project Structure

```text
src/
├── types/
│   └── postVenta.types.ts
├── services/
│   ├── misComprasService.ts
│   ├── cancelacionService.ts
│   └── reembolsoAdminService.ts
├── hooks/
│   └── postVenta/
│       ├── useMisTickets.ts
│       ├── useMisCompras.ts
│       ├── useCancelarTicket.ts
│       ├── useCancelarVarios.ts
│       ├── useReembolsoManual.ts
│       ├── useProcesarColaReembolsos.ts
│       └── useCambiarEstadoTicket.ts
├── pages/
│   └── postVenta/
│       ├── MyTicketsPage.tsx
│       ├── TicketDetailPage.tsx
│       ├── AdminRefundPage.tsx
│       └── AdminTicketManagePage.tsx
└── components/
    └── postVenta/
        ├── TicketCard.tsx
        ├── QRCodeDisplay.tsx
        ├── CancellationModal.tsx
        ├── RefundStatusBadge.tsx
        ├── AdminRefundForm.tsx
        └── TicketStateChangeModal.tsx

src/__tests__/
└── postVenta/
    ├── TicketCard.test.tsx
    ├── CancellationModal.test.tsx
    ├── AdminRefundForm.test.tsx
    └── QRCodeDisplay.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `postVenta.types.ts`:
  - `TicketResponse` (id, ventaId, asientoId, numeroTicket, codigoQr, estado, tipoCategoria, precio)
  - `TicketConReembolsoResponse` (ticket + reembolso asociado)
  - `CancelacionResponse` (ticketId, estado, montoReembolso, estimadoFecha)
  - `ReembolsoResponse` (id, ticketId, tipo, monto, estado, motivo)
  - `ReembolsoManualRequest` (tipo, monto, agenteId)
  - `CambiarEstadoTicketRequest` (estado, justificacion, agenteId)
  - Enums: `EstadoTicket`, `EstadoReembolso`, `TipoReembolso`
- [ ] T002 Implementar `misComprasService.ts`:
  - `getMisTickets(compradorId)` — GET `/api/v1/compras/mis-tickets`
  - `getMisCompras(compradorId)` — GET `/api/v1/compras/mis-compras`
- [ ] T003 Implementar `cancelacionService.ts`:
  - `cancelarTicket(ticketId)` — DELETE `/api/v1/tickets/{id}/cancelar`
  - `cancelarVarios(ticketIds)` — DELETE `/api/v1/tickets/cancelar-varios`
- [ ] T004 Implementar `reembolsoAdminService.ts`:
  - `reembolsoManual(ticketId, data)` — POST `/api/v1/admin/tickets/{id}/reembolso`
  - `procesarColaReembolsos()` — POST `/api/v1/admin/reembolsos/procesar-cola`
  - `cambiarEstadoTicket(ticketId, data)` — PATCH `/api/v1/admin/tickets/{id}/estado`
- [ ] T005 Definir rutas: `/mis-tickets`, `/mis-tickets/:ticketId`, `/admin/reembolsos`, `/admin/tickets`

**Checkpoint**: Tipos y servicios compilando

---

## Phase 2: User Story 1 — Mis Tickets (Priority: P1)

**Goal**: El comprador puede ver todos sus tickets con su estado y acceder al detalle con el código QR.

**Independent Test**: Navegar a `/mis-tickets` muestra grid de tickets. Hacer clic en uno abre el detalle con QR, nombre del evento, zona, fila/columna y estado.

### Tests para User Story 2

- [ ] T006 [P] [US1] Test: `TicketCard` renderiza nombre evento, zona y estado badge — `TicketCard.test.tsx`
- [ ] T007 [P] [US1] Test: `QRCodeDisplay` renderiza imagen cuando recibe base64 — `QRCodeDisplay.test.tsx`
- [ ] T008 [P] [US1] Test: `MyTicketsPage` muestra mensaje vacío sin tickets — test

### Implementación de User Story 1

- [ ] T009 [US1] Implementar `useMisTickets.ts` con `useQuery`: usa `compradorId` del `cartStore`
- [ ] T010 [US1] Implementar `TicketCard.tsx`: imagen placeholder, evento, zona, estado (`RefundStatusBadge`), botón "Ver"
- [ ] T011 [US1] Implementar `QRCodeDisplay.tsx`: renderiza `<img>` con `codigoQr` base64; botón "Descargar"
- [ ] T012 [US1] Implementar `MyTicketsPage.tsx` y `TicketDetailPage.tsx`

**Checkpoint**: Vista de mis tickets y detalle funcional

---

## Phase 3: User Story 2 — Cancelar Tickets (Priority: P2)

**Goal**: El comprador puede cancelar tickets individuales o múltiples desde su lista.

**Independent Test**: Clic en "Cancelar" en un ticket abre modal de confirmación. Confirmar cambia el estado del ticket a CANCELADO y muestra el monto de reembolso estimado. Si el evento está en progreso, el botón cancelar está deshabilitado.

### Tests para User Story 3

- [ ] T013 [P] [US2] Test: `CancellationModal` muestra monto estimado de reembolso — `CancellationModal.test.tsx`
- [ ] T014 [P] [US2] Test: botón cancelar está deshabilitado si `evento.estado === 'EN_PROGRESO'` — `TicketCard.test.tsx`
- [ ] T015 [P] [US2] Test: `useCancelarTicket` invalida `['mis-tickets']` en `onSuccess`

### Implementación de User Story 2

- [ ] T016 [US2] Implementar `useCancelarTicket.ts` y `useCancelarVarios.ts`
- [ ] T017 [US2] Implementar `CancellationModal.tsx`: aviso de política de reembolso, monto estimado, botones cancelar/confirmar
- [ ] T018 [US2] Integrar modal y lógica de deshabilitado en `TicketCard.tsx` y `MyTicketsPage.tsx`

**Checkpoint**: Cancelación de tickets funcional

---

## Phase 4: User Story 3 — Seguimiento de Reembolso (Priority: P2)

**Goal**: El comprador puede ver el estado actual de sus reembolsos desde la lista de mis compras.

**Independent Test**: Navegar a `/mis-tickets` en tab "Cancelados/Reembolsados" muestra tickets con `RefundStatusBadge` (PENDIENTE/EN_PROCESO/COMPLETADO). Cada ticket muestra el monto y la fecha estimada.

### Tests para User Story 4

- [ ] T019 [P] [US3] Test: `RefundStatusBadge` renderiza color correcto por estado — test
- [ ] T020 [P] [US3] Test: `useMisCompras` retorna tickets con reembolso — test

### Implementación de User Story 3

- [ ] T021 [US3] Implementar `useMisCompras.ts`
- [ ] T022 [US3] Implementar `RefundStatusBadge.tsx`: badge colorido PENDIENTE/EN_PROCESO/COMPLETADO/RECHAZADO
- [ ] T023 [US3] Agregar tab "Cancelados" en `MyTicketsPage.tsx` que usa `useMisCompras`

**Checkpoint**: Seguimiento de reembolsos funcional para el comprador

---

## Phase 5: User Story 4 — Admin: Reembolso Manual (Priority: P1)

**Goal**: El administrador puede procesar un reembolso manual para un ticket específico.

**Independent Test**: En `/admin/reembolsos`, buscar un ticket por ID, ingresar monto, tipo y ID del agente, confirmar — el estado del ticket cambia a REEMBOLSO_PENDIENTE.

### Tests para User Story 5

- [ ] T024 [P] [US4] Test: `AdminRefundForm` valida monto positivo y agente no vacío — `AdminRefundForm.test.tsx`
- [ ] T025 [P] [US4] Test: `useReembolsoManual` invalida queries correctas en `onSuccess`

### Implementación de User Story 4

- [ ] T026 [US4] Implementar `useReembolsoManual.ts` y `useProcesarColaReembolsos.ts`
- [ ] T027 [US4] Implementar `AdminRefundForm.tsx`: select de tipo, input de monto, input de agenteId, validación Zod
- [ ] T028 [US4] Implementar `AdminRefundPage.tsx`: búsqueda de ticket + formulario de reembolso + botón "Procesar Cola"

**Checkpoint**: Reembolso manual admin funcional

---

## Phase 6: User Story 5 — Admin: Cambiar Estado de Ticket (Priority: P1)

**Goal**: El administrador puede cambiar manualmente el estado de un ticket con justificación.

**Independent Test**: Abrir modal de cambio de estado, seleccionar ANULADO, ingresar justificación y agente, confirmar — ticket actualizado en la lista.

### Tests para User Story 6

- [ ] T029 [P] [US5] Test: `TicketStateChangeModal` valida justificación no vacía — test
- [ ] T030 [P] [US5] Test: `useCambiarEstadoTicket` invalida queries en `onSuccess`

### Implementación de User Story 5

- [ ] T031 [US5] Implementar `useCambiarEstadoTicket.ts`
- [ ] T032 [US5] Implementar `TicketStateChangeModal.tsx`: select de estado (todos), textarea justificación, input agenteId
- [ ] T033 [US5] Implementar `AdminTicketManagePage.tsx`: tabla de tickets con filtros + modal de cambio de estado

**Checkpoint**: Gestión admin de tickets funcional

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T034 Agregar toast de éxito/error después de cancelación y reembolso
- [ ] T035 Botón "Descargar todos mis tickets como PDF" en `MyTicketsPage` (// TODO: librería PDF)
- [ ] T036 Revisar accesibilidad de modales (focus trap, esc para cerrar)
- [ ] T037 Verificar tipos contra OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de plan 004 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 (`TicketCard`)
- **US3 (Phase 4)**: Depende de Foundational — independiente de US2
- **US4 (Phase 5)**: Depende de Foundational — panel admin independiente
- **US5 (Phase 6)**: Depende de Foundational
- **Polish (Phase 7)**: Depende de todo

---

## Notes

- **compradorId**: igual que plan 004, se obtiene del `cartStore` o de la sesión del usuario
- **Tabs en MyTicketsPage**: usar query param `?tab=activos|cancelados` para que los tabs sean bookmarkeables
- **Descarga de QR**: `window.open(imgSrc)` o crear un `<a download>` temporal con el base64

