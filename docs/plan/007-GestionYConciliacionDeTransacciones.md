# Implementation Plan: Gestión y Conciliación de Transacciones – Frontend

**Date**: 09/05/2026  
**Specs**:

- [007-GestionYConciliacionDeTransacciones.md](/docs/plan/007-GestionYConciliacionDeTransacciones.md)

## Summary

El **Administrador** debe poder consultar el historial completo de transacciones con filtros, cambiar el estado de una venta con justificación, verificar pagos recibidos de la pasarela, confirmar transacciones y resolver discrepancias entre el sistema interno y la pasarela de pago.

Este módulo expone dos secciones: el gestor de transacciones (estados de ventas, historial de cambios) y el panel de conciliación (pagos pendientes de verificación, discrepancias por resolver). Ambas secciones son de uso exclusivo de administradores.

Depende del plan 004 completado (las ventas existen).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: React 18+ (Vite)  
**Styling**: Tailwind CSS 3.x  
**Server State**: TanStack Query v5  
**Client State**: Zustand  
**HTTP Client**: Axios  
**Router**: React Router v6  
**Testing**: Vitest + React Testing Library + MSW  
**Target Platform**: Admin Panel SPA  
**Performance Goals**: Listado de transacciones carga en menos de 2s con hasta 10,000 registros (paginación).  
**Constraints**: El cambio de estado de venta requiere justificación y actorId. La resolución de discrepancias requiere agente y justificación. Todos los cambios son irreversibles — mostrar confirmación explícita.  
**Scale/Scope**: Feature admin de operaciones financieras — depende de plan 004.

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
│   └── transaccion.types.ts
├── services/
│   ├── transaccionesService.ts
│   └── conciliacionService.ts
├── hooks/
│   └── transacciones/
│       ├── useTransacciones.ts
│       ├── useCambiarEstadoVenta.ts
│       ├── useHistorialVenta.ts
│       ├── useVerificarPago.ts
│       ├── useConfirmarPago.ts
│       ├── useDiscrepancias.ts
│       └── useResolverDiscrepancia.ts
├── pages/
│   └── transacciones/
│       ├── TransactionListPage.tsx
│       ├── TransactionDetailPage.tsx
│       ├── ReconciliationDashboard.tsx
│       └── DiscrepancyResolutionPage.tsx
└── components/
    └── transacciones/
        ├── TransactionTable.tsx
        ├── TransactionFilters.tsx
        ├── PaymentStatusBadge.tsx
        ├── SaleStatusBadge.tsx
        ├── StateChangeModal.tsx
        ├── HistoryTimeline.tsx
        ├── DiscrepancyCard.tsx
        └── ResolutionForm.tsx

src/__tests__/
└── transacciones/
    ├── TransactionTable.test.tsx
    ├── TransactionFilters.test.tsx
    ├── StateChangeModal.test.tsx
    ├── DiscrepancyCard.test.tsx
    └── ResolutionForm.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `transaccion.types.ts`:
  - `VentaResumenResponse` (id, compradorId, eventoId, estado, total, metodoPago, fechaCreacion)
  - `HistorialEstadoVentaResponse` (estadoAnterior, estadoNuevo, actor, justificacion, fecha)
  - `PagoResponse` (id, ventaId, montoPasarela, idExternoPasarela, estado, discrepancia)
  - `CambiarEstadoVentaRequest` (nuevoEstado, justificacion, actorId)
  - `VerificarPagoRequest` (ventaId, montoPasarela, idExternoPasarela)
  - `ConfirmarPagoRequest` (ventaId, idExternoPasarela, montoPasarela)
  - `ResolverDiscrepanciaRequest` (confirmar, agenteId, justificacion)
  - `TransaccionFiltros` (estado, fechaInicio, fechaFin, eventoId)
  - Enums: `EstadoVenta`, `EstadoConciliacion`
- [ ] T002 Implementar `transaccionesService.ts`:
  - `getTransacciones(filtros)` — GET `/api/v1/admin/ventas`
  - `cambiarEstadoVenta(ventaId, data)` — PATCH `/api/v1/admin/ventas/{id}/estado`
  - `getHistorialVenta(ventaId)` — GET `/api/v1/admin/ventas/{id}/historial`
- [ ] T003 Implementar `conciliacionService.ts`:
  - `verificarPago(data)` — POST `/api/v1/pagos/verificar`
  - `confirmarPago(data)` — POST `/api/v1/pagos/confirmar`
  - `getDiscrepancias()` — GET `/api/v1/admin/conciliacion/discrepancias`
  - `resolverDiscrepancia(pagoId, data)` — PATCH `/api/v1/admin/conciliacion/discrepancias/{id}/resolver`
- [ ] T004 Definir rutas: `/admin/transacciones`, `/admin/transacciones/:ventaId`, `/admin/conciliacion`, `/admin/conciliacion/discrepancias/:pagoId`

**Checkpoint**: Tipos y servicios compilando

---

## Phase 2: User Story 1 — Listar y Filtrar Transacciones (Priority: P1)

**Goal**: El administrador puede ver todas las transacciones con filtros por estado, evento y fechas.

**Independent Test**: Navegar a `/admin/transacciones` muestra tabla paginada. Filtrar por estado COMPLETADA muestra solo esas ventas. Filtrar por evento reduce la lista.

### Tests para User Story 1

- [ ] T005 [P] [US1] Test: `TransactionTable` renderiza filas con datos MSW — `TransactionTable.test.tsx`
- [ ] T006 [P] [US1] Test: `TransactionFilters` actualiza filtros y re-ejecuta la query — `TransactionFilters.test.tsx`
- [ ] T007 [P] [US1] Test: `useTransacciones` pasa los filtros correctamente al servicio

### Implementación de User Story 1

- [ ] T008 [US1] Implementar `useTransacciones.ts` con `useQuery`, clave `['transacciones', filtros]`
- [ ] T009 [US1] Implementar `SaleStatusBadge.tsx` y `PaymentStatusBadge.tsx`
- [ ] T010 [US1] Implementar `TransactionFilters.tsx`: select de estado, date pickers de rango, select de evento
- [ ] T011 [US1] Implementar `TransactionTable.tsx`: columnas id (truncado), comprador, evento, estado (badge), total, fecha, acciones
- [ ] T012 [US1] Implementar `TransactionListPage.tsx`: filtros + tabla con paginación

**Checkpoint**: Listado y filtrado de transacciones funcional

---

## Phase 3: User Story 2 — Cambiar Estado de Venta (Priority: P1)

**Goal**: El administrador puede cambiar el estado de una venta con justificación.

**Independent Test**: Clic en "Cambiar Estado" abre modal con select de estado válido, textarea de justificación y campo de actorId. Confirmar actualiza el badge de estado en la tabla.

### Tests para User Story 2

- [ ] T013 [P] [US2] Test: `StateChangeModal` valida justificación no vacía — `StateChangeModal.test.tsx`
- [ ] T014 [P] [US2] Test: `useCambiarEstadoVenta` invalida `['transacciones']` en `onSuccess`

### Implementación de User Story 2

- [ ] T015 [US2] Implementar `useCambiarEstadoVenta.ts` con `useMutation`
- [ ] T016 [US2] Implementar `StateChangeModal.tsx`: select de estado destino, textarea justificación (required), input actorId (required)
- [ ] T017 [US2] Integrar modal en `TransactionTable.tsx`

**Checkpoint**: Cambio de estado funcional

---

## Phase 4: User Story 3 — Historial de Venta (Priority: P2)

**Goal**: El administrador puede ver el historial completo de cambios de estado de una venta específica.

**Independent Test**: Navegar a `/admin/transacciones/:ventaId` muestra timeline con todos los cambios de estado en orden cronológico.

### Tests para User Story 3

- [ ] T018 [P] [US3] Test: `HistoryTimeline` renderiza los items en orden cronológico — test
- [ ] T019 [P] [US3] Test: `TransactionDetailPage` muestra datos de la venta + timeline

### Implementación de User Story 3

- [ ] T020 [US3] Implementar `useHistorialVenta.ts`
- [ ] T021 [US3] Implementar `HistoryTimeline.tsx`: línea vertical con puntos, cada punto = un cambio de estado con badge, actor, justificación y fecha
- [ ] T022 [US3] Implementar `TransactionDetailPage.tsx`: header con resumen de venta + `HistoryTimeline`

**Checkpoint**: Historial de transacciones funcional

---

## Phase 5: User Story 4 — Verificar y Confirmar Pagos (Priority: P1)

**Goal**: El administrador puede verificar pagos pendientes de la pasarela y confirmarlos.

**Independent Test**: En `/admin/conciliacion`, formulario de verificación con ventaId y datos de pasarela. Verificar exitoso muestra el pago como VERIFICADO. Confirmar lo cambia a CONFIRMADO.

### Tests para User Story 4

- [ ] T023 [P] [US4] Test: formulario de verificación valida campos requeridos — test
- [ ] T024 [P] [US4] Test: `useVerificarPago` invalida discrepancias en `onSuccess`

### Implementación de User Story 4

- [ ] T025 [US4] Implementar `useVerificarPago.ts` y `useConfirmarPago.ts`
- [ ] T026 [US4] Implementar `ReconciliationDashboard.tsx`: sección de verificación manual + lista de discrepancias

**Checkpoint**: Verificación y confirmación de pagos funcional

---

## Phase 6: User Story 5 — Resolver Discrepancias (Priority: P1)

**Goal**: El administrador puede ver los pagos en estado DISCREPANCIA y resolverlos (confirmar o rechazar).

**Independent Test**: En `/admin/conciliacion/discrepancias/:pagoId`, ver detalle del pago discrepante. Ingresar agente y justificación, elegir confirmar/rechazar — estado pasa a RESUELTO.

### Tests para User Story 5

- [ ] T027 [P] [US5] Test: `DiscrepancyCard` muestra montos del sistema vs pasarela — `DiscrepancyCard.test.tsx`
- [ ] T028 [P] [US5] Test: `ResolutionForm` valida agenteId y justificación — `ResolutionForm.test.tsx`

### Implementación de User Story 5

- [ ] T029 [US5] Implementar `useDiscrepancias.ts` y `useResolverDiscrepancia.ts`
- [ ] T030 [US5] Implementar `DiscrepancyCard.tsx`: dos columnas (sistema vs pasarela), diferencia destacada en rojo
- [ ] T031 [US5] Implementar `ResolutionForm.tsx`: radio confirmar/rechazar, input agenteId, textarea justificación
- [ ] T032 [US5] Implementar `DiscrepancyResolutionPage.tsx`: `DiscrepancyCard` + `ResolutionForm`

**Checkpoint**: Resolución de discrepancias funcional

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T033 Confirmación explícita antes de resolver discrepancias ("Esta acción es irreversible")
- [ ] T034 Exportar tabla de transacciones a CSV (// TODO: implementar con `Papa.unparse`)
- [ ] T035 Revisar paginación de la tabla para datasets grandes
- [ ] T036 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de plan 004
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 (necesita la tabla)
- **US3 (Phase 4)**: Depende de Foundational — independiente de US1/US2
- **US4 (Phase 5)**: Depende de Foundational
- **US5 (Phase 6)**: Depende de US4
- **Polish (Phase 7)**: Depende de todo

---

## Notes

- **Discrepancias**: cuando montoPasarela ≠ monto del sistema, el backend las marca como DISCREPANCIA — el `DiscrepancyCard` debe comparar visualmente ambos valores
- **Idempotencia**: `confirmarPago` es idempotente — si se llama dos veces con los mismos datos no duplica la confirmación
- **Filtro de fechas**: usar `input[type=date]` nativo de HTML + Tailwind para evitar dependencia de una librería de datepicker

