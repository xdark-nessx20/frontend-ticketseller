# Implementation Plan: Catálogo de Asientos – Frontend

**Date**: 09/05/2026

## Summary

El **Administrador** debe poder crear y gestionar tipos de asiento (VIP, Platea, General, etc.), asignarlos a zonas de
un recinto y, opcionalmente, definir un mapa numerado de asientos para recintos con ubicaciones específicas (teatros,
cines). Un tipo activo puede asignarse a una zona; no puede desactivarse si está vinculado a eventos futuros.

La arquitectura es la misma SPA React organizada por feature del módulo de recintos. Este feature extiende la página de
detalle del recinto con una pestaña de tipos de asiento, y agrega una vista de mapa de asientos con interacción celda
a celda.

Depende del módulo de recintos (`001`) y sus zonas — el recinto y sus zonas deben existir antes de poder asignar tipos
de asiento.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Generación y renderizado de mapa de hasta 5,000 asientos en menos de 3s.
**Constraints**: No se puede asignar un tipo inactivo a una zona. No se puede desactivar un tipo con eventos futuros.
Un recinto tiene mapa de asientos O zonas planas — no ambos.
**Scale/Scope**: Extiende el feature 001 — recinto y zonas deben existir.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoTipoAsiento = 'ACTIVO' | 'INACTIVO';
type EstadoAsiento = 'DISPONIBLE' | 'BLOQUEADO' | 'RESERVADO' | 'VENDIDO' | 'MANTENIMIENTO' | 'ANULADO';
```

### Interfaces de Respuesta

```typescript
interface TipoAsientoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoTipoAsiento;
  enUso: boolean;
}

interface AsientoResponse {
  id: string;
  fila: number;
  columna: number;
  numero: string;
  zonaId: string;
  estado: EstadoAsiento;
  existente: boolean;
}

interface AsientoMapaResponse {
  id: string;
  fila: number;
  columna: number;
  numero: string;
  existente: boolean;
  estado: EstadoAsiento;
}
```

### Interfaces de Request

```typescript
interface CrearTipoAsientoRequest {
  nombre: string;
  descripcion?: string;
}

interface EditarTipoAsientoRequest {
  nombre?: string;
  descripcion?: string;
}

interface AsignarTipoAsientoRequest {
  tipoAsientoId: string;
}

interface CambiarEstadoTipoAsientoRequest {
  estado: EstadoTipoAsiento;
}

interface CrearMapaAsientosRequest {
  filas: number;            // min: 1
  columnasPorFila: number;  // min: 1
}

interface MarcarEspacioVacioRequest {
  existente: boolean;
}

interface TipoAsientoFiltros {
  estado?: EstadoTipoAsiento;
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
│   └── asiento.types.ts
├── services/
│   └── tiposAsientoService.ts
├── hooks/
│   └── asientos/
│       ├── useTiposAsiento.ts
│       ├── useTipoAsiento.ts
│       ├── useCreateTipoAsiento.ts
│       ├── useEditTipoAsiento.ts
│       ├── useDesactivarTipoAsiento.ts
│       ├── useAsignarTipoAsiento.ts
│       ├── useMapaAsientos.ts
│       └── useCrearMapaAsientos.ts
├── pages/
│   └── asientos/
│       └── MapaAsientosPage.tsx
└── components/
    └── asientos/
        ├── TipoAsientoPanel.tsx
        ├── TipoAsientoForm.tsx
        ├── TipoAsientoTable.tsx
        ├── AsignarTipoAsientoModal.tsx
        ├── MapaAsientosGrid.tsx
        ├── MapaAsientosCell.tsx
        └── CrearMapaModal.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio Axios — base compartida por todas las user stories.

**⚠️ CRITICAL**: Depende de que el feature 001 esté implementado — el recinto y sus zonas deben existir.

- [ ] T001 Definir interfaces en `asiento.types.ts`:
    - `TipoAsientoResponse`, `AsientoResponse`, `AsientoMapaResponse`
    - `CrearTipoAsientoRequest`, `EditarTipoAsientoRequest`, `AsignarTipoAsientoRequest`
    - `CambiarEstadoTipoAsientoRequest`, `CrearMapaAsientosRequest`, `MarcarEspacioVacioRequest`
    - Enums: `EstadoTipoAsiento`, `EstadoAsiento`
- [ ] T002 Implementar `tiposAsientoService.ts` con funciones tipadas:
    - `getTiposAsiento(filtros?)`, `getTipoAsiento(id)`
    - `createTipoAsiento(data)`, `editTipoAsiento(id, data)`
    - `cambiarEstado(id, data)`, `asignarAZona(recintoId, zonaId, data)`
    - `getMapaAsientos(recintoId)`, `crearMapaAsientos(recintoId, data)`
    - `marcarEspacioVacio(recintoId, asientoId, data)`
- [ ] T003 Agregar rutas en el router: `/admin/recintos/:id/mapa`

**Checkpoint**: Tipos definidos, servicio compilando, rutas registradas

---

## Phase 2: User Story 1 — Registrar y Listar Tipos de Asiento (Priority: P1)

**Goal**: El administrador puede crear nuevos tipos de asiento con nombre obligatorio y verlos en la lista del panel.
Los nombres duplicados generan advertencia pero no bloquean.

**Independent Test**: El panel de tipos de asiento en el detalle del recinto muestra la tabla. El formulario inline
valida que el nombre no esté vacío. Crear un tipo lo añade inmediatamente a la tabla.

- [ ] T004 [US1] Implementar `useTiposAsiento.ts` con `useQuery`
- [ ] T005 [US1] Implementar `useCreateTipoAsiento.ts` con `useMutation`: invalida `['tiposAsiento']` en `onSuccess`
- [ ] T006 [US1] Implementar `TipoAsientoForm.tsx`: campo nombre obligatorio + descripción opcional, validación Zod
- [ ] T007 [US1] Implementar `TipoAsientoTable.tsx`: columnas nombre, descripción, estado (badge), acciones (editar,
  desactivar, asignar)
- [ ] T008 [US1] Implementar `TipoAsientoPanel.tsx`: integra tabla + formulario de creación inline; se monta en la
  pestaña "Tipos de Asiento" de `VenueDetailPage`

**Checkpoint**: Listado y creación de tipos de asiento funcionales

---

## Phase 3: User Story 2 — Editar Tipo de Asiento (Priority: P2)

**Goal**: El administrador puede editar nombre y descripción de un tipo de asiento existente desde un modal.

**Independent Test**: Hacer clic en "Editar" abre modal con datos precargados. Guardar cambios actualiza la tabla sin
recargar la página.

- [ ] T009 [US2] Implementar `useTipoAsiento.ts` con `useQuery`
- [ ] T010 [US2] Implementar `useEditTipoAsiento.ts` con `useMutation`
- [ ] T011 [US2] Actualizar `TipoAsientoTable.tsx`: botón editar abre `TipoAsientoForm` en modo edición dentro de un
  modal, precargado con `defaultValues`

**Checkpoint**: Edición funcional con precarga de datos

---

## Phase 4: User Story 3 — Asignar Tipo de Asiento a una Zona (Priority: P2)

**Goal**: El administrador puede asignar un tipo activo a una zona. Los tipos inactivos son rechazados. Si la zona ya
tiene un tipo asignado, se muestra advertencia y permite reemplazarlo.

**Independent Test**: Hacer clic en "Asignar" abre modal con las zonas del recinto como opciones. Intentar asignar
un tipo inactivo muestra error.

- [ ] T012 [US3] Implementar `useAsignarTipoAsiento.ts` con `useMutation`
- [ ] T013 [US3] Implementar `AsignarTipoAsientoModal.tsx`: select de zonas disponibles del recinto, muestra
  advertencia si la zona ya tiene tipo asignado
- [ ] T014 [US3] Integrar modal en `TipoAsientoTable.tsx`

**Checkpoint**: Asignación funcional con validación de estado activo

---

## Phase 5: User Story 4 — Desactivar Tipo de Asiento (Priority: P3)

**Goal**: El administrador puede desactivar un tipo que ya no se usará. El tipo desaparece de las listas de selección
activas. La desactivación se bloquea si tiene eventos futuros.

**Independent Test**: Hacer clic en "Desactivar" muestra modal de confirmación. Confirmar en tipo sin eventos futuros
cambia el badge a "Inactivo". Confirmar en tipo con eventos retorna error 409 con mensaje descriptivo.

- [ ] T015 [US4] Implementar `useDesactivarTipoAsiento.ts` con `useMutation`
- [ ] T016 [US4] Agregar modal de confirmación en `TipoAsientoTable.tsx`
- [ ] T017 [US4] Manejar error 409: mostrar mensaje del backend en el modal
- [ ] T018 [US4] Agregar filtro "Solo activos" en `TipoAsientoPanel.tsx` usando `TipoAsientoFiltros`

**Checkpoint**: Desactivación funcional con bloqueo ante eventos futuros

---

## Phase 6: User Story 5 — Configurar Mapa de Asientos (Priority: P3)

**Goal**: El administrador puede definir un mapa numerado NxM de asientos para recintos con ubicaciones específicas.
Las celdas pueden marcarse como "espacio vacío" para excluirlas del aforo.

**Independent Test**: Navegar a `/admin/recintos/:id/mapa` muestra el grid. Crear mapa 10×20 genera 200 celdas.
Hacer clic en una celda alterna su estado entre existente y vacío.

- [ ] T019 [US5] Implementar `useMapaAsientos.ts` y `useCrearMapaAsientos.ts`
- [ ] T020 [US5] Implementar `CrearMapaModal.tsx`: inputs `filas` y `columnasPorFila` con validación `min(1)`
- [ ] T021 [US5] Implementar `MapaAsientosCell.tsx`: celda individual con estados visual (existente/vacío/ocupado),
  toggle al hacer clic cuando la celda es editable
- [ ] T022 [US5] Implementar `MapaAsientosGrid.tsx`: renderiza grid NxM usando virtualización para mapas grandes;
  muestra número de asiento en cada celda
- [ ] T023 [US5] Implementar `MapaAsientosPage.tsx`: carga el mapa del recinto, muestra `CrearMapaModal` si no existe
  mapa, renderiza `MapaAsientosGrid`

**Checkpoint**: Mapa de asientos funcional con generación y edición de celdas

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T024 Virtualizar el grid de asientos con `@tanstack/react-virtual` para matrices grandes (>1,000 celdas)
- [ ] T025 Verificar que el `TipoAsientoPanel` se integra correctamente en `VenueDetailPage` como pestaña
- [ ] T026 Asegurar que el selector de zonas en `AsignarTipoAsientoModal` reutiliza los datos ya cacheados de `useZonas`
  (no hace una nueva petición si ya están en caché)
- [ ] T027 Verificar alineación de todos los tipos con el Swagger del backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende del feature 001 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1
- **US3 (Phase 4)**: Depende de US1 — requiere la lista de zonas del recinto
- **US4 (Phase 5)**: Depende de US1 — puede ejecutarse en paralelo con US2 y US3
- **US5 (Phase 6)**: Depende de Foundational — puede ejecutarse en paralelo con US1–US4
- **Polish (Phase 7)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Mutua exclusión mapa/zonas**: si el recinto ya tiene zonas activas, ocultar el botón "Crear Mapa" y mostrar un
  aviso — el backend retorna 409 en ese caso de todas formas
- **Virtualización**: para mapas grandes usar `@tanstack/react-virtual` — renderizar 5,000 celdas sin virtualización
  congela el navegador
- **Estado del tipo `enUso`**: el campo `enUso` viene del backend calculado — no derivarlo en el frontend
- **Asignar a zona**: el endpoint es `POST /api/recintos/{recintoId}/zonas/{zonaId}/tipo-asiento` — el servicio
  debe construir la URL con ambos IDs
