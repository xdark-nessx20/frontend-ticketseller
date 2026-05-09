# Implementation Plan: Liquidación y Dispersión de Fondos – Frontend

**Date**: 09/05/2026  
**Specs**:

- [011-LiquidacionYDispercionDeFondos.md](/docs/plan/011-LiquidacionYDispercionDeFondos.md)

## Summary

El **Administrador** debe poder consultar y configurar el modelo de negocio de cada recinto (porcentaje o monto fijo de comisión), ver el snapshot de liquidación de un evento finalizado y consultar el recaudo incremental de un evento en curso para seguimiento financiero en tiempo real.

Este módulo es de lectura casi exclusiva — la única escritura es la configuración del modelo de negocio del recinto. Las vistas de snapshot y recaudo incremental son dashboards de métricas financieras.

Depende del plan 001 (recintos con modelo de negocio) y del plan 004 (ventas y tickets que generan el recaudo).

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
**Performance Goals**: Dashboard de liquidación carga en menos de 2s.  
**Constraints**: El modelo de negocio solo puede cambiarse antes de que el recinto tenga eventos con ventas. El snapshot es inmutable una vez generado. El recaudo incremental se actualiza con polling.  
**Scale/Scope**: Feature financiero — depende de planes 001 y 004.

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
│   └── liquidacion.types.ts
├── services/
│   └── liquidacionService.ts
├── hooks/
│   └── liquidacion/
│       ├── useModeloNegocio.ts
│       ├── useConfigurarModeloNegocio.ts
│       ├── useSnapshotLiquidacion.ts
│       └── useRecaudoIncremental.ts
├── pages/
│   └── liquidacion/
│       ├── LiquidationDashboardPage.tsx
│       ├── EventRevenuePage.tsx
│       └── BusinessModelConfigPage.tsx
└── components/
    └── liquidacion/
        ├── SnapshotSummaryCard.tsx
        ├── RevenueMetricsTable.tsx
        ├── BusinessModelForm.tsx
        ├── IncrementalRevenueDisplay.tsx
        └── CommissionBreakdown.tsx

src/__tests__/
└── liquidacion/
    ├── SnapshotSummaryCard.test.tsx
    ├── BusinessModelForm.test.tsx
    └── IncrementalRevenueDisplay.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `liquidacion.types.ts`:
  - `ModeloNegocioResponse` (recintoId, modelo, montoFijo, porcentaje, fechaConfiguracion)
  - `SnapshotLiquidacionResponse` (eventoId, fechaSnapshot, totalVendido, totalRecaudado, totalReembolsado, comisionRecinto, comisionPlataforma, neto)
  - `RecaudoIncrementalResponse` (eventoId, ventasCompletadas, ventasPendientes, recaudoActual, proyeccionFinal)
  - `ConfigurarModeloNegocioRequest` (modelo, montoFijo)
  - Enum: `ModeloNegocio` (PORCENTAJE, MONTO_FIJO)
- [ ] T002 Implementar `liquidacionService.ts`:
  - `getModeloNegocio(recintoId)` — GET `/api/v1/recintos/{id}/modelo-negocio`
  - `configurarModeloNegocio(recintoId, data)` — PATCH `/api/v1/recintos/{id}/modelo-negocio`
  - `getSnapshot(eventoId)` — GET `/api/v1/eventos/{id}/snapshot`
  - `getRecaudoIncremental(eventoId)` — GET `/api/v1/eventos/{id}/recaudo`
- [ ] T003 Definir rutas: `/admin/recintos/:recintoId/modelo-negocio`, `/admin/eventos/:eventoId/liquidacion`, `/admin/eventos/:eventoId/recaudo`

**Checkpoint**: Tipos y servicio compilando

---

## Phase 2: User Story 1 — Configurar Modelo de Negocio (Priority: P1)

**Goal**: El administrador puede ver y configurar el modelo de negocio de un recinto (porcentaje o monto fijo).

**Independent Test**: Navegar a `/admin/recintos/:id/modelo-negocio` muestra el modelo actual. Cambiar a MONTO_FIJO con valor 50000 y guardar actualiza el modelo. El campo de monto fijo solo es visible cuando el modelo es MONTO_FIJO.

### Tests para User Story 1

- [ ] T004 [P] [US1] Test: `BusinessModelForm` muestra campo `montoFijo` solo cuando modelo es MONTO_FIJO — `BusinessModelForm.test.tsx`
- [ ] T005 [P] [US1] Test: `useConfigurarModeloNegocio` invalida `['modelo-negocio', recintoId]` en `onSuccess`

### Implementación de User Story 1

- [ ] T006 [US1] Implementar `useModeloNegocio.ts` y `useConfigurarModeloNegocio.ts`
- [ ] T007 [US1] Implementar `BusinessModelForm.tsx`: radio/select PORCENTAJE vs MONTO_FIJO, input condicional `montoFijo` (con validación `min(1)`), botón guardar
- [ ] T008 [US1] Implementar `BusinessModelConfigPage.tsx`: carga el modelo actual como `defaultValues`, renderiza `BusinessModelForm`

**Checkpoint**: Configuración de modelo de negocio funcional

---

## Phase 3: User Story 2 — Snapshot de Liquidación (Priority: P1)

**Goal**: El administrador puede ver el snapshot de liquidación de un evento finalizado.

**Independent Test**: Navegar a `/admin/eventos/:eventoId/liquidacion` muestra cards con totales: vendido, recaudado, reembolsado, comisiones y neto.

### Tests para User Story 2

- [ ] T009 [P] [US2] Test: `SnapshotSummaryCard` formatea montos como moneda colombiana — `SnapshotSummaryCard.test.tsx`
- [ ] T010 [P] [US2] Test: `LiquidationDashboardPage` muestra estado de carga — test

### Implementación de User Story 2

- [ ] T011 [US2] Implementar `useSnapshotLiquidacion.ts`
- [ ] T012 [US2] Implementar `SnapshotSummaryCard.tsx`: card con ícono, título, monto formateado en COP
- [ ] T013 [US2] Implementar `CommissionBreakdown.tsx`: desglose de comisión recinto vs plataforma en tabla o card secundaria
- [ ] T014 [US2] Implementar `RevenueMetricsTable.tsx`: tabla con filas totalVendido, totalRecaudado, totalReembolsado, comisiones, neto
- [ ] T015 [US2] Implementar `LiquidationDashboardPage.tsx`: grid de `SnapshotSummaryCard` + `CommissionBreakdown`

**Checkpoint**: Dashboard de snapshot funcional

---

## Phase 4: User Story 3 — Recaudo Incremental (Priority: P2)

**Goal**: El administrador puede ver el recaudo incremental de un evento activo o en progreso con actualización automática.

**Independent Test**: Navegar a `/admin/eventos/:eventoId/recaudo` muestra ventas completadas, pendientes, recaudo actual y proyección. Los datos se actualizan cada 30 segundos.

### Tests para User Story 3

- [ ] T016 [P] [US3] Test: `IncrementalRevenueDisplay` muestra barra de progreso hacia la proyección — `IncrementalRevenueDisplay.test.tsx`
- [ ] T017 [P] [US3] Test: `useRecaudoIncremental` tiene `refetchInterval: 30000`

### Implementación de User Story 3

- [ ] T018 [US3] Implementar `useRecaudoIncremental.ts` con `refetchInterval: 30000`
- [ ] T019 [US3] Implementar `IncrementalRevenueDisplay.tsx`: barra de progreso (recaudo actual / proyección), ventas completadas vs pendientes
- [ ] T020 [US3] Implementar `EventRevenuePage.tsx`: `IncrementalRevenueDisplay` + timestamp de última actualización

**Checkpoint**: Recaudo incremental funcional con polling

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T021 Formateo de moneda: usar `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })` en toda la capa de presentación
- [ ] T022 Mensaje claro si el evento aún no tiene snapshot (no finalizado)
- [ ] T023 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de planes 001 y 004
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational
- **US3 (Phase 4)**: Depende de Foundational
- **Polish (Phase 5)**: Depende de todo

---

## Notes

- **Formato de moneda**: usar `Intl.NumberFormat` nativo del browser — no agregar librería de formateo
- **Snapshot inmutable**: el endpoint GET retorna el snapshot ya calculado — el frontend no puede regenerarlo; solo mostrarlo
- **Comisión por categoría**: la comisión del recinto varía según `CategoriaRecinto` (ESTADIO vs TEATRO tienen tasas diferentes según la lógica del backend) — el snapshot ya viene con los valores calculados

