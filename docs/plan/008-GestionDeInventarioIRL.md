# Implementation Plan: Gestión de Inventario IRL – Frontend

**Date**: 09/05/2026  
**Specs**:

- [008-GestionDeInventarioIRL.md](/docs/plan/008-GestionDeInventarioIRL.md)

## Summary

El **Administrador** debe poder consultar la disponibilidad en tiempo real de asientos individuales, marcarlos como ocupados tras confirmación de pago fuera del sistema normal, y liberar holds que fallen o venzan. Este módulo expone un dashboard de inventario en tiempo real con mapa de disponibilidad por zonas y controles de ocupación/liberación manual.

El dashboard es principalmente de lectura — el flujo normal de ocupación lo maneja el checkout automáticamente. Las operaciones manuales (ocupar, liberar) son para casos excepcionales donde el operador necesita corregir el estado sin pasar por el flujo de checkout.

Depende del plan 002 completado (el mapa de asientos debe existir).

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
**Performance Goals**: Dashboard de disponibilidad actualizable en menos de 1s con polling cada 30s.  
**Constraints**: La ocupación manual solo debe usarse como corrección de emergencia. La liberación de un hold ACTIVO lo cambia a LIBERADO. El backend valida la transición de estado.  
**Scale/Scope**: Feature operativo de inventario — depende de plan 002.

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
│   └── inventario.types.ts       ← DisponibilidadResponse, EstadoHold enum
├── services/
│   └── inventarioService.ts
├── hooks/
│   └── inventario/
│       ├── useDisponibilidad.ts
│       ├── useOcuparAsiento.ts
│       └── useLiberarHold.ts
├── pages/
│   └── inventario/
│       └── InventoryDashboardPage.tsx
└── components/
    └── inventario/
        ├── SeatAvailabilityMap.tsx
        ├── ZoneAvailabilityRow.tsx
        ├── InventoryStatCard.tsx
        ├── SeatStatusDot.tsx
        └── OccupyReleaseControls.tsx

src/__tests__/
└── inventario/
    ├── InventoryStatCard.test.tsx
    ├── ZoneAvailabilityRow.test.tsx
    └── OccupyReleaseControls.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `inventario.types.ts`:
  - `DisponibilidadResponse` (asientoId, estadoActual, holdActivo, fechaExpiracionHold)
  - `InventarioZona` (zonaId, nombre, totalAsientos, disponibles, reservados, vendidos, bloqueados)
  - Enum: `EstadoHold` (ACTIVO, EXPIRADO, LIBERADO, CONFIRMADO)
- [ ] T002 Implementar `inventarioService.ts`:
  - `getDisponibilidad(asientoId)` — GET `/api/v1/inventario/asientos/{id}/disponibilidad`
  - `ocuparAsiento(asientoId)` — PATCH `/api/v1/inventario/asientos/{id}/ocupar`
  - `liberarHold(asientoId)` — PATCH `/api/v1/inventario/asientos/{id}/liberar`
- [ ] T003 Definir ruta: `/admin/inventario/:eventoId`

**Checkpoint**: Tipos y servicio compilando

---

## Phase 2: User Story 1 — Dashboard de Disponibilidad (Priority: P1)

**Goal**: El administrador puede ver un resumen de disponibilidad por zonas y por asiento individual.

**Independent Test**: Navegar a `/admin/inventario/:eventoId` muestra cards por zona con contadores disponibles/reservados/vendidos. Hacer clic en un asiento del mapa muestra el detalle de su hold activo si existe.

### Tests para User Story 1

- [ ] T004 [P] [US1] Test: `InventoryStatCard` muestra contadores correctos — `InventoryStatCard.test.tsx`
- [ ] T005 [P] [US1] Test: `ZoneAvailabilityRow` renderiza barra de progreso proporcional — `ZoneAvailabilityRow.test.tsx`
- [ ] T006 [P] [US1] Test: `useDisponibilidad` re-ejecuta cada 30 segundos (refetchInterval)

### Implementación de User Story 1

- [ ] T007 [US1] Implementar `useDisponibilidad.ts`: `useQuery` con `refetchInterval: 30000`
- [ ] T008 [US1] Implementar `SeatStatusDot.tsx`: punto de color según `EstadoAsiento` (verde/amarillo/rojo/gris)
- [ ] T009 [US1] Implementar `InventoryStatCard.tsx`: card con título zona, barra de progreso, contadores numéricos
- [ ] T010 [US1] Implementar `ZoneAvailabilityRow.tsx`: fila con nombre zona, barra proporcional y números
- [ ] T011 [US1] Implementar `SeatAvailabilityMap.tsx`: versión readonly del mapa del plan 002 con `SeatStatusDot` como celda — clic en celda abre panel de detalle
- [ ] T012 [US1] Implementar `InventoryDashboardPage.tsx`: grid de `InventoryStatCard` arriba + `SeatAvailabilityMap` abajo + botón "Actualizar"

**Checkpoint**: Dashboard de disponibilidad funcional con polling automático

---

## Phase 3: User Story 2 — Ocupar / Liberar Hold (Priority: P2)

**Goal**: El administrador puede marcar un asiento como ocupado o liberar su hold desde el panel de detalle.

**Independent Test**: Hacer clic en asiento RESERVADO abre panel con su hold activo y tiempo restante. Clic en "Liberar" cambia el estado a DISPONIBLE con confirmación. Clic en "Ocupar" marca como VENDIDO.

### Tests para User Story 2

- [ ] T013 [P] [US2] Test: `OccupyReleaseControls` muestra botones según estado del asiento — `OccupyReleaseControls.test.tsx`
- [ ] T014 [P] [US2] Test: confirmar "Ocupar" llama a `ocuparAsiento` — `OccupyReleaseControls.test.tsx`

### Implementación de User Story 2

- [ ] T015 [US2] Implementar `useOcuparAsiento.ts` y `useLiberarHold.ts` con `useMutation`
- [ ] T016 [US2] Implementar `OccupyReleaseControls.tsx`: panel con estado del hold, tiempo restante, botones ocupar/liberar con confirmación inline
- [ ] T017 [US2] Integrar controles en `InventoryDashboardPage.tsx` como panel lateral deslizante

**Checkpoint**: Ocupación y liberación manual funcional

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T018 Indicador visual de "última actualización: hace Xs" junto al botón Actualizar
- [ ] T019 Advertencia visual antes de "Ocupar" (acción excepcional)
- [ ] T020 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de plan 002 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1
- **Polish (Phase 4)**: Depende de todo

---

## Notes

- **Polling vs WebSocket**: el backend actual es REST — usar `refetchInterval` de TanStack Query para polling cada 30s. Si en el futuro se agrega WebSocket, solo cambia el hook sin tocar los componentes
- **Reutilización de SeatGrid**: el `SeatAvailabilityMap` reutiliza el componente base del plan 002 en modo readonly — implementar prop `mode: 'readonly'` que deshabilita selección

