# Implementation Plan: Bloqueos y Cortesías – Frontend

**Date**: 09/05/2026  
**Specs**:

- [009-BloqueosYCortesias.md](/docs/plan/009-BloqueosYCortesias.md)

## Summary

El **Administrador** debe poder bloquear asientos para patrocinadores con destinatario y fecha de expiración, consultar el panel de bloqueos y cortesías por evento, editar el destinatario de un bloqueo, liberar bloqueos y generar tickets de cortesía tanto con asiento asignado como generales (sin asiento fijo).

Este módulo expone dos secciones en el panel admin: el gestor de bloqueos y el gestor de cortesías, ambos accesibles por evento. El panel consolidado (bloqueos + cortesías juntos) usa la API de `PanelItemResponse` que retorna ambos tipos.

Depende del plan 002 completado (asientos y zonas existen) y del plan 012 (eventos existen).

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
**Performance Goals**: Panel de bloqueos carga en menos de 1s.  
**Constraints**: Un asiento BLOQUEADO no puede venderse hasta ser liberado. La cortesía general no tiene asiento fijo — solo zona. La edición solo puede cambiar el destinatario, no los asientos.  
**Scale/Scope**: Feature admin — depende de planes 002 y 012.

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
│   └── bloqueo.types.ts
├── services/
│   ├── bloqueosService.ts
│   └── cortesiasService.ts
├── hooks/
│   └── bloqueos/
│       ├── useBloqueos.ts
│       ├── useBloquearAsientos.ts
│       ├── useLiberarBloqueo.ts
│       ├── useEditarDestinatario.ts
│       ├── usePanelBloqueos.ts
│       ├── useCrearCortesia.ts
│       └── useCrearCortesiaGeneral.ts
├── pages/
│   └── bloqueos/
│       ├── BlockManagementPage.tsx
│       ├── CourtesyManagementPage.tsx
│       └── BlockPanelPage.tsx
└── components/
    └── bloqueos/
        ├── SeatBlockForm.tsx
        ├── SeatSelectorModal.tsx
        ├── EditRecipientModal.tsx
        ├── BlockPanelTable.tsx
        ├── PanelItemBadge.tsx
        ├── CourtesyForm.tsx
        └── CourtesyGeneralForm.tsx

src/__tests__/
└── bloqueos/
    ├── SeatBlockForm.test.tsx
    ├── BlockPanelTable.test.tsx
    ├── CourtesyForm.test.tsx
    └── EditRecipientModal.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `bloqueo.types.ts`:
  - `BloqueoResponse` (id, eventoId, asientoIds, destinatario, estado, fechaExpiracion)
  - `CortesiaResponse` (id, eventoId, asientoId, zonaId, destinatario, categoria, estado)
  - `PanelItemResponse` (tipo: 'BLOQUEO' | 'CORTESIA', id, destinatario, estado, detalle)
  - `BloquearAsientosRequest` (asientoIds, destinatario, fechaExpiracion)
  - `EditarBloqueoRequest` (destinatario)
  - `CrearCortesiaRequest` (destinatario, categoria, asientoId)
  - `CrearCortesiaGeneralRequest` (destinatario, categoria, zonaId)
  - Enums: `EstadoBloqueo`, `EstadoCortesia`, `CategoriaCortesia`, `TipoPanelItem`
- [ ] T002 Implementar `bloqueosService.ts`:
  - `bloquearAsientos(eventoId, data)` — POST `/api/v1/admin/eventos/{eventoId}/bloqueos`
  - `getPanelBloqueos(eventoId, tipo?)` — GET `/api/v1/admin/eventos/{eventoId}/bloqueos`
  - `editarDestinatario(bloqueoId, data)` — PATCH `/api/v1/admin/bloqueos/{bloqueoId}`
  - `liberarBloqueo(bloqueoId)` — DELETE `/api/v1/admin/bloqueos/{bloqueoId}/liberar`
- [ ] T003 Implementar `cortesiasService.ts`:
  - `crearCortesia(eventoId, data)` — POST `/api/v1/admin/eventos/{eventoId}/cortesias/con-asiento`
  - `crearCortesiaGeneral(eventoId, data)` — POST `/api/v1/admin/eventos/{eventoId}/cortesias/general`
- [ ] T004 Definir rutas: `/admin/eventos/:eventoId/bloqueos`, `/admin/eventos/:eventoId/cortesias`, `/admin/eventos/:eventoId/panel`

**Checkpoint**: Tipos y servicios compilando

---

## Phase 2: User Story 1 — Bloquear Asientos para Patrocinador (Priority: P1)

**Goal**: El administrador puede seleccionar asientos del mapa y bloquearlos para un destinatario con fecha de expiración.

**Independent Test**: Abrir formulario de bloqueo, abrir el modal de selección de asientos, seleccionar 3 asientos disponibles, ingresar destinatario "Patrocinador X" y fecha, confirmar — los asientos aparecen bloqueados en el panel.

### Tests para User Story 1

- [ ] T005 [P] [US1] Test: `SeatBlockForm` valida destinatario no vacío y fecha futura — `SeatBlockForm.test.tsx`
- [ ] T006 [P] [US1] Test: `SeatSelectorModal` muestra solo asientos disponibles — test
- [ ] T007 [P] [US1] Test: `useBloquearAsientos` invalida `['panel', eventoId]` en `onSuccess`

### Implementación de User Story 1

- [ ] T008 [US1] Implementar `useBloquearAsientos.ts` con `useMutation`
- [ ] T009 [US1] Implementar `SeatSelectorModal.tsx`: versión simplificada del mapa del plan 002, solo muestra DISPONIBLES, selección múltiple, botón confirmar selección
- [ ] T010 [US1] Implementar `SeatBlockForm.tsx`: campo destinatario, campo fechaExpiracion, lista de asientos seleccionados con botón "Seleccionar Asientos" que abre `SeatSelectorModal`
- [ ] T011 [US1] Implementar `BlockManagementPage.tsx`: `SeatBlockForm` + tabla de bloqueos activos del evento

**Checkpoint**: Bloqueo de asientos funcional

---

## Phase 3: User Story 2 — Panel de Bloqueos (Priority: P1)

**Goal**: El administrador puede ver en un panel unificado todos los bloqueos y cortesías de un evento.

**Independent Test**: Navegar a `/admin/eventos/:eventoId/panel` muestra tabla con bloqueos y cortesías mezclados. Filtrar por tipo BLOQUEO muestra solo bloqueos. Clic en "Liberar" en un bloqueo activo lo elimina de la tabla.

### Tests para User Story 2

- [ ] T012 [P] [US2] Test: `BlockPanelTable` renderiza bloqueos y cortesías con badge de tipo — `BlockPanelTable.test.tsx`
- [ ] T013 [P] [US2] Test: filtro de tipo actualiza los resultados — `BlockPanelTable.test.tsx`
- [ ] T014 [P] [US2] Test: clic en "Liberar" y confirmar llama a `liberarBloqueo`

### Implementación de User Story 2

- [ ] T015 [US2] Implementar `usePanelBloqueos.ts` con `useQuery`, clave `['panel', eventoId, tipo]`
- [ ] T016 [US2] Implementar `useLiberarBloqueo.ts` con `useMutation`
- [ ] T017 [US2] Implementar `PanelItemBadge.tsx`: badge "BLOQUEO" azul o "CORTESÍA" verde
- [ ] T018 [US2] Implementar `BlockPanelTable.tsx`: columnas tipo (badge), destinatario, asientos, estado, expiración, acciones (editar destinatario, liberar)
- [ ] T019 [US2] Implementar `BlockPanelPage.tsx`: filtro de tipo + `BlockPanelTable`

**Checkpoint**: Panel unificado funcional

---

## Phase 4: User Story 3 — Editar Destinatario (Priority: P2)

**Goal**: El administrador puede cambiar el nombre del destinatario de un bloqueo activo.

**Independent Test**: Clic en editar abre modal con campo pre-cargado. Modificar y guardar actualiza el destinatario en la tabla sin recargar la página.

### Tests para User Story 3

- [ ] T020 [P] [US3] Test: `EditRecipientModal` precarga el destinatario actual — `EditRecipientModal.test.tsx`

### Implementación de User Story 3

- [ ] T021 [US3] Implementar `useEditarDestinatario.ts`
- [ ] T022 [US3] Implementar `EditRecipientModal.tsx`: input de destinatario pre-cargado, botones cancelar/guardar
- [ ] T023 [US3] Integrar modal en `BlockPanelTable.tsx`

**Checkpoint**: Edición de destinatario funcional

---

## Phase 5: User Story 4 — Crear Cortesías (Priority: P1)

**Goal**: El administrador puede crear tickets de cortesía con asiento específico o generales por zona.

**Independent Test**: En `/admin/eventos/:eventoId/cortesias`, formulario "Con Asiento" permite seleccionar asiento + categoría. Formulario "General" permite elegir zona + categoría. Ambos crean cortesías visibles en el panel.

### Tests para User Story 4

- [ ] T024 [P] [US4] Test: `CourtesyForm` valida destinatario, categoría y asiento — `CourtesyForm.test.tsx`
- [ ] T025 [P] [US4] Test: `CourtesyGeneralForm` valida destinatario, categoría y zona — test

### Implementación de User Story 4

- [ ] T026 [US4] Implementar `useCrearCortesia.ts` y `useCrearCortesiaGeneral.ts`
- [ ] T027 [US4] Implementar `CourtesyForm.tsx`: campos destinatario, select de categoría, selector de asiento (abre `SeatSelectorModal`)
- [ ] T028 [US4] Implementar `CourtesyGeneralForm.tsx`: campos destinatario, select de categoría, select de zona
- [ ] T029 [US4] Implementar `CourtesyManagementPage.tsx`: tabs "Con Asiento" / "General" con los formularios respectivos

**Checkpoint**: Generación de cortesías funcional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T030 Confirmación antes de liberar bloqueo con información del destinatario
- [ ] T031 Mostrar asientos bloqueados en el mapa con color diferenciado (gris oscuro)
- [ ] T032 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de planes 002 y 012
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational
- **US3 (Phase 4)**: Depende de US2 (`BlockPanelTable` necesita modal)
- **US4 (Phase 5)**: Depende de Foundational
- **Polish (Phase 6)**: Depende de todo

---

## Notes

- **SeatSelectorModal reutilizado**: el mismo modal de selección del plan 002 se reutiliza aquí para bloqueos y cortesías con asiento
- **CategoriaCortesia**: VIP, PRENSA, ORGANIZA, SEGURIDAD, OTRA — usar select enum en el formulario

