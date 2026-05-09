# Implementation Plan: Catálogo de Asientos – Frontend

**Date**: 09/05/2026  
**Specs**:

- [002-CatalogoDeAsientos.md](/docs/plan/002-CatalogoDeAsientos.md)
- [003-MapaDeAsientos.md](/docs/spec/003-MapaDeAsientos.md)

## Summary

El **Administrador** debe poder configurar el inventario de asientos de un recinto: crear el mapa NxM de asientos, definir tipos de asiento, crear zonas y asignarles asientos y tipos. Este módulo expone las páginas de configuración del catálogo de asientos con su mapa visual interactivo, el panel de administración de zonas y el gestor de tipos de asiento.

La pieza central del módulo es el mapa de asientos: una grilla visual NxM donde el administrador puede seleccionar celdas para asignarlas a zonas, marcarlas como espacio vacío (pasillos, escenario) y ver el estado actual de cada asiento según su zona asignada. La selección múltiple es manejada por un store Zustand compartido entre los controles del mapa y el panel lateral de zonas.

Este módulo bloquea el feature de Mantenimiento de Recinto y es prerequisito del feature de Checkout (los asientos configurados aquí son los que se venden).

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
**Performance Goals**: El mapa de asientos con 1,000 asientos debe renderizarse sin bloquear el hilo principal (virtualización si es necesario).  
**Constraints**: El mapa NxM solo se puede crear una vez por recinto. Los asientos marcados como espacio vacío no pueden asignarse a zona. La suma de asientos por zona no puede exceder la capacidad máxima del recinto.  
**Scale/Scope**: Feature de configuración base — bloquea Mantenimiento y Checkout.

## Coding Standards

> **⚠️ ADVERTENCIA — Reglas obligatorias de estilo de código:**
>
> 1. **NO crear comentarios innecesarios.**
> 2. **Clean Code**: nombres descriptivos, componentes pequeños.
> 3. **`interface`** para objetos y props, **`type`** para uniones.
> 4. Solo componentes funcionales.
> 5. Lógica en custom hooks.
> 6. Solo clases Tailwind.

## Project Structure

```text
src/
├── types/
│   └── asiento.types.ts          ← AsientoResponse, ZonaResponse, TipoAsientoResponse, etc.
├── services/
│   ├── asientosService.ts        ← mapa, asignar a zona, marcar vacío
│   ├── zonasService.ts           ← crear zona, listar zonas
│   └── tiposAsientoService.ts    ← CRUD tipos de asiento, asignar a zona
├── stores/
│   └── seatMapStore.ts           ← Zustand: celdas seleccionadas, modo selección
├── hooks/
│   └── asientos/
│       ├── useAsientos.ts
│       ├── useCreateMapa.ts
│       ├── useAsignarAsientosZona.ts
│       ├── useMarcarEspacioVacio.ts
│       ├── useZonas.ts
│       ├── useCreateZona.ts
│       ├── useTiposAsiento.ts
│       ├── useCreateTipoAsiento.ts
│       ├── useEditTipoAsiento.ts
│       └── useAsignarTipoAsientoZona.ts
├── pages/
│   └── asientos/
│       ├── SeatMapPage.tsx
│       ├── ZoneManagementPage.tsx
│       └── SeatTypeManagementPage.tsx
└── components/
    └── asientos/
        ├── SeatGrid.tsx
        ├── SeatCell.tsx
        ├── SeatMapToolbar.tsx
        ├── CreateMapModal.tsx
        ├── ZonePanel.tsx
        ├── ZoneForm.tsx
        ├── AssignZoneModal.tsx
        ├── TipoAsientoTable.tsx
        ├── TipoAsientoForm.tsx
        └── AssignSeatTypeModal.tsx

src/__tests__/
└── asientos/
    ├── SeatGrid.test.tsx
    ├── SeatCell.test.tsx
    ├── AssignZoneModal.test.tsx
    ├── TipoAsientoForm.test.tsx
    └── seatMapStore.test.ts
```

---

## Phase 1: Foundational (Blocking Prerequisites)

- [ ] T001 Definir interfaces en `asiento.types.ts`:
  - `AsientoResponse` (id, recintoId, zonaId, fila, columna, estado, tipoAsiento)
  - `ZonaResponse` (id, recintoId, nombre, tipoZona, descripcion, activo)
  - `TipoAsientoResponse` (id, nombre, descripcion, estado)
  - `CrearMapaAsientosRequest` (filas, columnasPorFila)
  - `AsignarAsientosAZonaRequest` (asientoIds)
  - `CrearZonaRequest`, `AsignarTipoAsientoRequest`
  - Enums: `EstadoAsiento`, `TipoZona`, `EstadoTipoAsiento`
- [ ] T002 Implementar `asientosService.ts`: `getMapaAsientos(recintoId, page, size)`, `createMapa(recintoId, data)`, `marcarEspacioVacio(recintoId, asientoId)`, `asignarAsientosZona(recintoId, zonaId, data)`
- [ ] T003 Implementar `zonasService.ts`: `getZonas(recintoId)`, `createZona(recintoId, data)`
- [ ] T004 Implementar `tiposAsientoService.ts`: `getTiposAsiento(estado?)`, `createTipoAsiento(data)`, `editTipoAsiento(id, data)`, `desactivarTipoAsiento(id)`, `asignarTipoAsientoZona(recintoId, zonaId, data)`
- [ ] T005 Implementar `seatMapStore.ts` con Zustand: `selectedIds: Set<string>`, `selectionMode: 'zona' | 'vacio' | null`, acciones `toggleSeat`, `selectAll`, `clearSelection`, `setMode`
- [ ] T006 Definir rutas: `/admin/recintos/:recintoId/mapa`, `/admin/recintos/:recintoId/zonas`, `/admin/tipos-asiento`

**Checkpoint**: Tipos, servicios y store compilando; rutas registradas

---

## Phase 2: User Story 1 — Gestión de Tipos de Asiento (Priority: P1)

**Goal**: El administrador puede crear, editar y desactivar tipos de asiento globales.

**Independent Test**: Navegar a `/admin/tipos-asiento` muestra tabla. Crear "VIP" lo añade a la tabla. Editar cambia el nombre. Desactivar oculta el tipo en la lista activa.

### Tests para User Story 1

- [ ] T007 [P] [US1] Test: `TipoAsientoTable` renderiza filas con datos MSW — `TipoAsientoForm.test.tsx`
- [ ] T008 [P] [US1] Test: `TipoAsientoForm` muestra error si nombre está vacío — `TipoAsientoForm.test.tsx`
- [ ] T009 [P] [US1] Test: `useCreateTipoAsiento` invalida `['tipos-asiento']` en `onSuccess` — unit test

### Implementación de User Story 1

- [ ] T010 [US1] Implementar `useTiposAsiento.ts`, `useCreateTipoAsiento.ts`, `useEditTipoAsiento.ts`
- [ ] T011 [US1] Implementar `TipoAsientoForm.tsx`: campos nombre, descripción; validación Zod
- [ ] T012 [US1] Implementar `TipoAsientoTable.tsx`: columnas nombre, descripción, estado, acciones
- [ ] T013 [US1] Implementar `SeatTypeManagementPage.tsx`: usa tabla + modal con formulario

**Checkpoint**: CRUD de tipos de asiento funcional

---

## Phase 3: User Story 2 — Crear Mapa NxM (Priority: P1)

**Goal**: El administrador puede crear el mapa de asientos de un recinto especificando filas y columnas.

**Independent Test**: Abrir `/admin/recintos/:id/mapa` sin mapa creado muestra botón "Crear Mapa". Ingresar 10 filas × 20 columnas crea 200 asientos y renderiza la grilla.

### Tests para User Story 2

- [ ] T014 [P] [US2] Test: `CreateMapModal` valida que filas y columnas sean positivos — test
- [ ] T015 [P] [US2] Test: `SeatGrid` renderiza NxM celdas con los datos mockeados — `SeatGrid.test.tsx`
- [ ] T016 [P] [US2] Test: `useCreateMapa` invalida `['asientos', recintoId]` en `onSuccess`

### Implementación de User Story 2

- [ ] T017 [US2] Implementar `useAsientos.ts` con `useInfiniteQuery` o paginación, clave `['asientos', recintoId, page]`
- [ ] T018 [US2] Implementar `useCreateMapa.ts` con `useMutation`
- [ ] T019 [US2] Implementar `SeatCell.tsx`: celda con color por zona/estado, cursor pointer si seleccionable
- [ ] T020 [US2] Implementar `SeatGrid.tsx`: grilla CSS grid dinámica basada en columnasPorFila; renderiza `SeatCell` por asiento
- [ ] T021 [US2] Implementar `CreateMapModal.tsx`: inputs filas/columnas con validación Zod `min(1)`
- [ ] T022 [US2] Implementar `SeatMapPage.tsx`: muestra `CreateMapModal` si no hay asientos, muestra `SeatGrid` + `SeatMapToolbar` si ya existe el mapa

**Checkpoint**: Creación y visualización del mapa funcional

---

## Phase 4: User Story 3 — Asignar Asientos a Zona (Priority: P1)

**Goal**: El administrador puede seleccionar asientos en el mapa y asignarlos a una zona.

**Independent Test**: Activar modo "Asignar Zona", hacer clic en celdas las resalta. El panel lateral muestra las zonas disponibles. Seleccionar zona y confirmar pinta las celdas con el color de esa zona.

### Tests para User Story 3

- [ ] T023 [P] [US3] Test: clic en celda en modo "zona" la añade a `selectedIds` del store — `SeatCell.test.tsx`
- [ ] T024 [P] [US3] Test: `AssignZoneModal` muestra las zonas disponibles del recinto — `AssignZoneModal.test.tsx`
- [ ] T025 [P] [US3] Test: confirmar asignación invalida la query del mapa — `AssignZoneModal.test.tsx`

### Implementación de User Story 3

- [ ] T026 [US3] Implementar `useZonas.ts` y `useAsignarAsientosZona.ts`
- [ ] T027 [US3] Actualizar `SeatCell.tsx`: si `selectionMode === 'zona'` y `isSelected`, aplicar clase de resaltado
- [ ] T028 [US3] Implementar `AssignZoneModal.tsx`: lista de zonas con radio button, botones cancelar/asignar
- [ ] T029 [US3] Implementar `SeatMapToolbar.tsx`: botones "Asignar Zona", "Marcar Vacío", "Limpiar Selección" que escriben en `seatMapStore`
- [ ] T030 [US3] Integrar toolbar y modal en `SeatMapPage.tsx`

**Checkpoint**: Asignación de asientos a zona funcional con feedback visual

---

## Phase 5: User Story 4 — Marcar Espacio Vacío y Asignar Tipo (Priority: P2)

**Goal**: El administrador puede marcar celdas como espacio vacío (pasillo, escenario) y asignar tipos de asiento a zonas.

**Independent Test**: Activar modo "Marcar Vacío" y clic en celdas las convierte en espacios grises sin asiento. El modal de asignación de tipo de asiento muestra los tipos activos y asigna al confirmar.

### Tests para User Story 4

- [ ] T031 [P] [US4] Test: celda marcada como vacía cambia su apariencia visual — `SeatCell.test.tsx`
- [ ] T032 [P] [US4] Test: `AssignSeatTypeModal` muestra tipos activos — test

### Implementación de User Story 4

- [ ] T033 [US4] Implementar `useMarcarEspacioVacio.ts` y `useAsignarTipoAsientoZona.ts`
- [ ] T034 [US4] Actualizar `SeatCell.tsx`: renderizar diferente si `estado === 'INACTIVO'` (celda vacía)
- [ ] T035 [US4] Implementar `AssignSeatTypeModal.tsx`: select de tipo de asiento, lista de zonas destino
- [ ] T036 [US4] Integrar en `SeatMapToolbar.tsx`

**Checkpoint**: Marcado de espacios vacíos y asignación de tipos funcional

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T037 Virtualización del mapa si supera 500 asientos (usar `react-virtual` o CSS grid con overflow scroll)
- [ ] T038 Tooltip en `SeatCell`: mostrar fila, columna, zona y tipo al hover
- [ ] T039 Leyenda de colores en `SeatMapPage`: qué color corresponde a qué zona
- [ ] T040 Revisar accesibilidad: celdas del mapa con `role="checkbox"` y `aria-checked`
- [ ] T041 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Sin dependencias
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational
- **US3 (Phase 4)**: Depende de US2 (necesita el mapa) y US1 de 001 (necesita zonas)
- **US4 (Phase 5)**: Depende de US3 y US1 (tipos de asiento)
- **Polish (Phase 6)**: Depende de todas las US

---

## Notes

- **CSS Grid dinámico**: el mapa usa `grid-template-columns: repeat(N, minmax(0, 1fr))` donde N es `columnasPorFila`
- **Color por zona**: cada zona recibe un color dinámico de una paleta predefinida de Tailwind (bg-blue-200, bg-green-200, etc.)
- **Performance**: si hay más de 500 asientos, cargar el mapa con paginación o scroll infinito para no bloquear el render
- **seatMapStore**: el store se limpia al salir de `SeatMapPage` para no dejar selecciones obsoletas
- **Dependencia con 001**: la lista de zonas disponibles viene de los endpoints de `ZonaController` del backend — reutilizar `useZonas` definido en el plan 001

