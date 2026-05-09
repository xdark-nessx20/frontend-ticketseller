# Implementation Plan: Post-Venta y Devoluciones – Frontend

**Date**: 09/05/2026

## Summary

El sistema debe permitir a los **Compradores** cancelar tickets de forma individual o parcial desde su sección "Mis
Compras" y consultar el estado de sus reembolsos. Los **Agentes de Ventas** disponen de un panel administrativo para
gestionar estados de tickets manualmente y procesar reembolsos totales o parciales con trazabilidad completa.

Este módulo tiene dos audiencias distintas: la vista del comprador (portal público) y el panel del agente (admin).
Ambas vistas comparten los mismos tipos y servicio pero difieren en páginas y permisos. Depende del feature 004
(tickets y ventas deben existir).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (selección de tickets para cancelación parcial)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Buyer Portal SPA + Admin Panel SPA
**Performance Goals**: Cancelación procesada y reflejada en UI en menos de 2s.
**Constraints**: No cancelar tickets ya usados. No cancelar si el evento ya ocurrió (salvo override del agente). 0
tickets cancelados que luego sean usados.
**Scale/Scope**: Extiende el feature 004 — `Ticket`, `Venta` y pasarela de pagos deben existir.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoReembolso = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO';
type TipoReembolso = 'TOTAL' | 'PARCIAL';
// EstadoTicket se importa desde checkout.types.ts (feature 004)
```

### Interfaces de Respuesta

```typescript
interface ReembolsoResponse {
  reembolsoId: string;
  estado: EstadoReembolso;
  monto: number;
  agenteId: string | null;
  fechaCompletado: string | null;   // ISO 8601
}

interface CancelacionResponse {
  ticketsCancelados: number;
  reembolsoId: string;
  montoPendiente: number;
}

interface TicketConReembolsoResponse {
  id: string;
  ventaId: string;
  eventoId: string;
  zonaId: string;
  estado: string;                   // EstadoTicket
  precio: number;
  esCortesia: boolean;
  estadoReembolso: EstadoReembolso | null;
  detalleReembolso: ReembolsoResponse | null;
}
```

### Interfaces de Request

```typescript
interface CancelarTicketRequest {
  ticketIds: string[];              // min 1
}

interface CambiarEstadoTicketRequest {
  estado: string;                   // EstadoTicket
  justificacion: string;            // obligatorio
}

interface ReembolsoManualRequest {
  tipo: TipoReembolso;
  monto?: number;                   // requerido si tipo = PARCIAL
}
```

## Coding Standards

> **⚠️ ADVERTENCIA — Reglas obligatorias de estilo de código:**
>
> 1. **NO crear comentarios innecesarios.** El código debe ser autoexplicativo. Solo se permiten comentarios cuando
>    aportan contexto que el código solo no puede expresar.
> 2. **Se DEBEN respetar los principios del Clean Code.** Nombres descriptivos, componentes pequeños de responsabilidad
>    única, sin código muerto, sin duplicación.
> 3. **Para tipos, usar `interface` para objetos y props, `type` para uniones y primitivas.**
> 4. **Solo componentes funcionales** — sin class components.
> 5. **Lógica de negocio en custom hooks** — los componentes solo renderizan.
> 6. **Sin estilos inline** — solo clases Tailwind.

## Project Structure

### Archivos nuevos que agrega este feature

```text
src/
├── types/
│   └── postventa.types.ts
├── services/
│   └── postVentaService.ts
├── hooks/
│   └── postventa/
│       ├── useMisCompras.ts
│       ├── useCancelarTicket.ts
│       ├── useEstadoReembolso.ts
│       ├── useCambiarEstadoTicketAdmin.ts
│       └── useProcesarReembolsoManual.ts
├── pages/
│   └── postventa/
│       ├── MisComprasPage.tsx
│       └── AdminReembolsosPage.tsx
└── components/
    └── postventa/
        ├── TicketCompraCard.tsx
        ├── ReembolsoBadge.tsx
        ├── CancelarTicketModal.tsx
        ├── CambiarEstadoTicketModal.tsx
        └── ReembolsoManualModal.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base compartida por las vistas del comprador y del agente.

**⚠️ CRITICAL**: Depende del feature 004 completado — `Ticket` y `Venta` deben existir.

- [ ] T001 Definir interfaces en `postventa.types.ts`:
    - `ReembolsoResponse`, `CancelacionResponse`, `TicketConReembolsoResponse`
    - `CancelarTicketRequest`, `CambiarEstadoTicketRequest`, `ReembolsoManualRequest`
    - Enums: `EstadoReembolso`, `TipoReembolso`
- [ ] T002 Implementar `postVentaService.ts`:
    - `getMisCompras()` → `GET /api/compras/mis-compras`
    - `cancelarTickets(data)` → `POST /api/tickets/cancelar-parcial`
    - `getEstadoReembolso(ticketId)` → lectura desde `TicketConReembolsoResponse`
    - `cambiarEstadoTicket(ticketId, data)` → `PATCH /api/admin/tickets/{id}/estado`
    - `procesarReembolso(ticketId, data)` → `POST /api/admin/tickets/{id}/reembolso`
- [ ] T003 Definir rutas: `/mis-compras`, `/admin/reembolsos`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 1 — Cancelación de Ticket por el Comprador (Priority: P1)

**Goal**: El comprador puede ver sus tickets en "Mis Compras" y cancelar uno o varios seleccionados. Tickets ya
usados o de eventos pasados no pueden cancelarse. Al cancelar, se crea un reembolso en cola.

**Independent Test**: Navegar a `/mis-compras` muestra los tickets agrupados por evento. Seleccionar 2 tickets y
hacer clic en "Cancelar seleccionados" muestra modal de confirmación. Confirmar cambia el estado a "CANCELADO" y
muestra el monto de reembolso pendiente.

- [ ] T004 [US1] Implementar `useMisCompras.ts` con `useQuery`
- [ ] T005 [US1] Implementar `useCancelarTicket.ts` con `useMutation`: invalida `['misCompras']` en `onSuccess`
- [ ] T006 [US1] Implementar `ReembolsoBadge.tsx`: badge de color según `EstadoReembolso`
- [ ] T007 [US1] Implementar `TicketCompraCard.tsx`: muestra datos del ticket, badge de estado, badge de reembolso
  si aplica, checkbox para selección múltiple
- [ ] T008 [US1] Implementar `CancelarTicketModal.tsx`: lista los tickets seleccionados con sus precios, muestra
  total a reembolsar, botones cancelar/confirmar
- [ ] T009 [US1] Implementar `MisComprasPage.tsx`: usa `useMisCompras`, agrupa tickets por evento, botón "Cancelar
  seleccionados" visible solo cuando hay selección activa

**Checkpoint**: Vista de mis compras funcional con cancelación individual y parcial

---

## Phase 3: User Story 5 — Consulta de Estado de Reembolso (Priority: P2)

**Goal**: El comprador puede ver el estado de su reembolso en "Mis Compras". Al completarse, el badge cambia a
"COMPLETADO".

**Independent Test**: Un ticket cancelado muestra `ReembolsoBadge` con estado "PENDIENTE". Tras procesarse, el badge
cambia a "COMPLETADO" al recargar la página.

- [ ] T010 [US5] Implementar `useEstadoReembolso.ts`: lee el estado desde el campo `detalleReembolso` del
  `TicketConReembolsoResponse` ya cargado por `useMisCompras` — no requiere llamada adicional
- [ ] T011 [US5] Actualizar `TicketCompraCard.tsx`: mostrar `detalleReembolso.estado` y `detalleReembolso.monto`
  cuando `estadoReembolso` no es null

**Checkpoint**: Estado de reembolso visible al comprador

---

## Phase 4: User Story 3 — Cambio Manual de Estado de Ticket por el Agente (Priority: P2)

**Goal**: El Agente de Ventas puede cambiar el estado de un ticket con justificación obligatoria. El cambio queda
registrado en historial de auditoría.

**Independent Test**: Desde el panel de admin, buscar un ticket y hacer clic en "Cambiar Estado". Seleccionar "ANULADO"
requiere ingresar justificación. Confirmar actualiza el badge del ticket.

- [ ] T012 [US3] Implementar `useCambiarEstadoTicketAdmin.ts` con `useMutation`
- [ ] T013 [US3] Implementar `CambiarEstadoTicketModal.tsx`: select de estado destino, campo justificación
  obligatorio (Zod `min(1)`), botones cancelar/confirmar
- [ ] T014 [US3] Integrar el modal en la vista de detalle de ticket del panel de admin

**Checkpoint**: Cambio manual de estado funcional con justificación obligatoria

---

## Phase 5: User Story 4 — Gestión de Reembolsos por Soporte (Priority: P2)

**Goal**: El Agente de Ventas puede procesar reembolsos manuales totales o parciales y ver la cola de reembolsos
pendientes.

**Independent Test**: Desde `/admin/reembolsos`, ver la lista de reembolsos PENDIENTES. Hacer clic en "Procesar
Total" sobre uno muestra confirmación. Confirmar cambia el estado a "COMPLETADO".

- [ ] T015 [US4] Implementar `useProcesarReembolsoManual.ts` con `useMutation`
- [ ] T016 [US4] Implementar `ReembolsoManualModal.tsx`: radio buttons TOTAL/PARCIAL, input de monto visible solo
  si PARCIAL (validación `min(0.01)`), botón confirmar
- [ ] T017 [US4] Implementar `AdminReembolsosPage.tsx`: tabla con reembolsos PENDIENTES, columnas ticket, monto,
  fecha solicitud, botón "Procesar" abre `ReembolsoManualModal`

**Checkpoint**: Panel de reembolsos funcional con procesamiento manual

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 Agregar estado vacío en `MisComprasPage` cuando el comprador no tiene compras
- [ ] T019 Deshabilitar checkbox de cancelación para tickets en estados no cancelables (USADO, ANULADO)
- [ ] T020 Mostrar aviso en `CancelarTicketModal` cuando el evento ya ocurrió (error 422 del backend)
- [ ] T021 Verificar que `ReembolsoBadge` es visualmente consistente con los demás badges del sistema

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende del feature 004 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US5 (Phase 3)**: Depende de US1 (datos de reembolso vienen con `useMisCompras`)
- **US3 (Phase 4)**: Depende de Foundational — puede ejecutarse en paralelo con US1
- **US4 (Phase 5)**: Depende de US1 — necesita reembolsos en PENDIENTE para procesarlos
- **Polish (Phase 6)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que páginas y componentes
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Separación de vistas**: las rutas `/mis-compras` son del portal del comprador; `/admin/reembolsos` y
  `/admin/tickets/:id` son del panel del agente — proteger con guards de rol correspondientes
- **Cancelación parcial**: `CancelarTicketRequest.ticketIds` puede tener un solo elemento (cancelación individual)
  o varios (cancelación parcial) — usar el mismo endpoint en ambos casos
- **Estado ya calculado**: `TicketConReembolsoResponse` incluye `estadoReembolso` y `detalleReembolso` directamente
  — no hacer una segunda llamada para obtener el reembolso
- **Reembolso masivo por evento cancelado**: lo dispara el backend automáticamente cuando se cancela un evento —
  el frontend solo necesita reflejar los cambios de estado en la siguiente carga
