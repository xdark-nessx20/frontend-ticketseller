# Implementation Plan: Mantenimiento de Recinto – Frontend

**Date**: 09/05/2026  
**Specs**:

- [003-MantenimientoDeRecinto.md](/docs/plan/003-MantenimientoDeRecinto.md)

## Summary

El **Administrador** debe poder cambiar el estado de asientos individuales o en bulk desde la interfaz web: poner asientos en mantenimiento, anularlos, o devolverlos a disponible, con un motivo requerido para cada operación. También debe poder consultar el historial de cambios de estado de cualquier asiento.

La página de mantenimiento reutiliza el componente `SeatGrid` del plan 002, pero agrega un modo de selección para operaciones de mantenimiento. El administrador activa el modo "mantenimiento", selecciona celdas y elige el estado destino con un motivo. El store `seatSelectionStore` (Zustand) gestiona la selección múltiple de esta operación.

Este módulo depende del plan 002 completado (el mapa debe existir).

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
**Performance Goals**: Cambio masivo de 100 asientos en menos de 2s.  
**Constraints**: El motivo es obligatorio para todo cambio de estado. Los cambios masivos operan sobre el evento activo del recinto. El historial muestra los últimos 50 cambios por defecto.  
**Scale/Scope**: Feature operativo — depende de plan 002.

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
│   └── mantenimiento.types.ts    ← CambiarEstadoRequest, HistorialCambioResponse, etc.
├── services/
│   └── mantenimientoService.ts
├── stores/
│   └── seatSelectionStore.ts     ← Zustand: IDs seleccionados para operación masiva
├── hooks/
│   └── mantenimiento/
│       ├── useCambiarEstadoAsiento.ts
│       ├── useCambiarEstadoMasivo.ts
│       └── useHistorialAsiento.ts
├── pages/
│   └── mantenimiento/
│       ├── SeatMaintenancePage.tsx
│       └── SeatHistoryPage.tsx
└── components/
    └── mantenimiento/
        ├── StateChangeForm.tsx
        ├── BulkStateChangePanel.tsx
        ├── StateHistoryTable.tsx
        └── StateChangeBadge.tsx

src/__tests__/
└── mantenimiento/
    ├── StateChangeForm.test.tsx
    ├── BulkStateChangePanel.test.tsx
    └── StateHistoryTable.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `mantenimiento.types.ts`:
  - `CambiarEstadoRequest` (estadoDestino, motivo)
  - `CambiarEstadoMasivoRequest` (asientoIds, estadoDestino, motivo)
  - `CambiarEstadoMasivoResponse` (exitosos, fallidos)
  - `HistorialCambioResponse` (id, asientoId, estadoAnterior, estadoNuevo, motivo, usuario, fecha)
  - Importar `EstadoAsiento` de `asiento.types.ts`
- [ ] T002 Implementar `mantenimientoService.ts`:
  - `cambiarEstado(eventoId, asientoId, data)` — PATCH `/api/v1/eventos/{eventoId}/asientos/{asientoId}/estado`
  - `cambiarEstadoMasivo(eventoId, data)` — PATCH `/api/v1/eventos/{eventoId}/asientos/estado-masivo`
  - `getHistorial(eventoId, asientoId)` — GET `/api/v1/eventos/{eventoId}/asientos/{asientoId}/historial`
- [ ] T003 Implementar `seatSelectionStore.ts` con Zustand: `selectedIds: string[]`, acciones `toggle`, `selectAll`, `clear`, `setEstadoDestino`, `setMotivo`
- [ ] T004 Definir rutas: `/admin/eventos/:eventoId/mantenimiento`, `/admin/eventos/:eventoId/asientos/:asientoId/historial`

**Checkpoint**: Tipos, servicio y store compilando

---

## Phase 2: User Story 1 — Cambiar Estado de Asiento Individual (Priority: P2)

**Goal**: El administrador puede cambiar el estado de un asiento específico ingresando un motivo.

**Independent Test**: Hacer clic en un asiento en la página de mantenimiento abre un panel con el formulario de cambio de estado. Seleccionar "MANTENIMIENTO" con motivo "Silla rota" y confirmar actualiza el color de la celda. Sin motivo muestra error de validación.

### Tests para User Story 1

- [ ] T005 [P] [US1] Test: `StateChangeForm` valida que el motivo no esté vacío — `StateChangeForm.test.tsx`
- [ ] T006 [P] [US1] Test: `StateChangeForm` llama al servicio con estado y motivo correctos — `StateChangeForm.test.tsx`
- [ ] T007 [P] [US1] Test: el panel de cambio individual se abre al clicar en un asiento — test

### Implementación de User Story 1

- [ ] T008 [US1] Implementar `useCambiarEstadoAsiento.ts` con `useMutation`: invalida `['asientos', eventoId]`
- [ ] T009 [US1] Implementar `StateChangeBadge.tsx`: badge de color para cada `EstadoAsiento`
- [ ] T010 [US1] Implementar `StateChangeForm.tsx`: select de estado destino (solo estados válidos), textarea motivo obligatorio, validación Zod
- [ ] T011 [US1] Implementar `SeatMaintenancePage.tsx`: renderiza `SeatGrid` del plan 002 en modo mantenimiento; al clicar celda abre panel deslizante con `StateChangeForm`

**Checkpoint**: Cambio individual de estado funcional

---

## Phase 3: User Story 2 — Cambio Masivo de Estado (Priority: P1)

**Goal**: El administrador puede seleccionar múltiples asientos y cambiar su estado en una sola operación.

**Independent Test**: Activar modo "Selección masiva", hacer clic en 5 celdas las resalta con un contador. El panel lateral muestra "5 asientos seleccionados", select de estado y campo de motivo. Confirmar procesa todos y muestra un resumen de éxitos/fallos.

### Tests para User Story 2

- [ ] T012 [P] [US2] Test: seleccionar 3 celdas actualiza el contador en `BulkStateChangePanel` — `BulkStateChangePanel.test.tsx`
- [ ] T013 [P] [US2] Test: confirmar cambio masivo muestra resumen con exitosos y fallidos — `BulkStateChangePanel.test.tsx`
- [ ] T014 [P] [US2] Test: `useCambiarEstadoMasivo` invalida la query del mapa en `onSuccess`

### Implementación de User Story 2

- [ ] T015 [US2] Implementar `useCambiarEstadoMasivo.ts` con `useMutation`
- [ ] T016 [US2] Implementar `BulkStateChangePanel.tsx`: muestra contador de seleccionados, select de estado, textarea de motivo, botón confirmar, resultados en tabla inline (exitosos en verde, fallidos en rojo)
- [ ] T017 [US2] Integrar `BulkStateChangePanel` en `SeatMaintenancePage.tsx` — panel derecho visible cuando `selectedIds.length > 0`

**Checkpoint**: Cambio masivo funcional con resumen de resultados

---

## Phase 4: User Story 3 — Historial de Cambios (Priority: P2)

**Goal**: El administrador puede ver el historial completo de cambios de estado de un asiento.

**Independent Test**: Navegar a `/admin/eventos/:eventoId/asientos/:asientoId/historial` muestra tabla cronológica con estado anterior, estado nuevo, motivo, usuario y fecha de cada cambio.

### Tests para User Story 3

- [ ] T018 [P] [US3] Test: `StateHistoryTable` renderiza filas con datos mockeados — `StateHistoryTable.test.tsx`
- [ ] T019 [P] [US3] Test: tabla muestra mensaje vacío si no hay historial — `StateHistoryTable.test.tsx`

### Implementación de User Story 3

- [ ] T020 [US3] Implementar `useHistorialAsiento.ts` con `useQuery`: clave `['historial', eventoId, asientoId]`
- [ ] T021 [US3] Implementar `StateHistoryTable.tsx`: columnas estadoAnterior (`StateChangeBadge`), estadoNuevo (`StateChangeBadge`), motivo, usuario, fecha formateada
- [ ] T022 [US3] Implementar `SeatHistoryPage.tsx`: usa `useHistorialAsiento`, renderiza `StateHistoryTable`

**Checkpoint**: Historial de cambios funcional

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T023 Agregar confirmación antes de procesar cambio masivo (modal: "¿Cambiar N asientos a X?")
- [ ] T024 Limpiar `seatSelectionStore` al desmontar `SeatMaintenancePage`
- [ ] T025 Revisar accesibilidad del panel deslizante (focus trap, aria-dialog)
- [ ] T026 Verificar tipos alineados con respuestas del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Sin dependencias
- **US1 (Phase 2)**: Depende de Foundational; reutiliza `SeatGrid` del plan 002
- **US2 (Phase 3)**: Depende de US1 y de `seatSelectionStore`
- **US3 (Phase 4)**: Depende de Foundational — independiente de US1/US2
- **Polish (Phase 5)**: Depende de todo

---

## Notes

- **SeatGrid reutilizado**: el componente `SeatGrid` del plan 002 se extiende con una prop `mode: 'view' | 'maintenance' | 'assignment'` para controlar el comportamiento de clic
- **Estados válidos de destino**: el select de estado destino no muestra VENDIDO ni OCUPADO — esos los gestiona el checkout; solo DISPONIBLE, BLOQUEADO, MANTENIMIENTO, ANULADO
- **seatSelectionStore**: compartido con `seatMapStore` del plan 002 si se unifica, o instancia separada si el scope es diferente — preferir separación para evitar conflictos

