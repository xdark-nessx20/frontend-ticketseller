# Implementation Plan: Control de Recintos – Frontend

**Date**: 09/05/2026

## Summary

El **Administrador** debe poder registrar, editar, desactivar, configurar y catalogar recintos desde una interfaz web.
Este módulo expone las páginas de administración de recintos, incluyendo listado con filtros, formulario de
creación/edición, configuración de capacidad y categoría, gestión de zonas, gestión de compuertas y vista detallada de
la estructura del recinto.

La arquitectura frontend es una SPA React organizada por feature: cada feature agrupa sus propias páginas, componentes,
hooks y servicios. El estado del servidor se gestiona con TanStack Query (caché, loading, errores), mientras que el
estado de UI local (filtros activos, selección) se gestiona con Zustand.

Este módulo es prerequisito directo de los demás features administrativos — las páginas de eventos, checkout y acceso
dependen de que el recinto ya exista y esté configurado.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x — sin librería de componentes, todo construido desde cero
**Server State**: TanStack Query v5
**Client State**: Zustand
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Listado de recintos carga en menos de 2s con hasta 1,000 registros. Formulario de creación
responde en menos de 500ms.
**Constraints**: No se permite eliminar recintos — solo desactivar (soft delete). Cambios de capacidad bloqueados si hay
tickets vendidos. La vista de estructura requiere que existan zonas y compuertas ya creadas.
**Scale/Scope**: Módulo base del panel admin — bloquea el desarrollo de los demás features de administración.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type CategoriaRecinto = 'ESTADIO' | 'TEATRO' | 'AUDITORIO' | 'SALA_CONCIERTOS' | 'CENTRO_CONGRESOS' | 'OTRO';
type EstadoRecinto = 'ACTIVO' | 'INACTIVO';
type TipoZona = 'GENERAL' | 'VIP' | 'PLATEA' | 'PALCO';
```

### Interfaces de Respuesta

```typescript
interface RecintoResponse {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  capacidadMaxima: number;
  telefono: string;
  fechaCreacion: string;        // ISO 8601
  compuertasIngreso: number;
  activo: boolean;
  categoria: CategoriaRecinto | null;
}

interface ZonaResponse {
  id: string;
  recintoId: string;
  nombre: string;
  tipo: TipoZona;
  capacidad: number;
}

interface CompuertaResponse {
  id: string;
  recintoId: string;
  zonaId: string | null;
  nombre: string;
  esGeneral: boolean;
}

interface RecintoEstructuraResponse {
  recinto: RecintoResponse;
  zonas: ZonaResponse[];
  compuertas: CompuertaResponse[];
}
```

### Interfaces de Request

```typescript
interface CrearRecintoRequest {
  nombre: string;
  ciudad: string;
  direccion: string;
  capacidadMaxima: number;
  telefono: string;
  compuertasIngreso: number;
}

interface EditarRecintoRequest {
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  compuertasIngreso?: number;
}

interface ConfigurarCapacidadRequest {
  capacidadMaxima: number;      // min: 1
}

interface ConfigurarCategoriaRequest {
  categoria: CategoriaRecinto;
}

interface CrearZonaRequest {
  nombre: string;
  tipo: TipoZona;
  capacidad: number;
}

interface CrearCompuertaRequest {
  nombre: string;
  zonaId?: string;              // omitir → esGeneral: true
}

interface RecintoFiltros {
  nombre?: string;
  ciudad?: string;
  categoria?: CategoriaRecinto;
  estado?: EstadoRecinto;
  page?: number;
  size?: number;
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
│   └── recinto.types.ts
├── services/
│   └── recintosService.ts
├── stores/
│   └── recintosStore.ts
├── hooks/
│   └── recintos/
│       ├── useRecintos.ts
│       ├── useRecinto.ts
│       ├── useRecintoEstructura.ts
│       ├── useCreateRecinto.ts
│       ├── useEditRecinto.ts
│       ├── useDesactivarRecinto.ts
│       ├── useReactivarRecinto.ts
│       ├── useConfigurarCapacidad.ts
│       ├── useConfigurarCategoria.ts
│       ├── useZonas.ts
│       ├── useCreateZona.ts
│       ├── useCompuertas.ts
│       └── useCreateCompuerta.ts
├── pages/
│   └── recintos/
│       ├── VenueListPage.tsx
│       ├── VenueDetailPage.tsx
│       ├── CreateVenuePage.tsx
│       └── EditVenuePage.tsx
└── components/
    └── recintos/
        ├── VenueTable.tsx
        ├── VenueFilters.tsx
        ├── VenueForm.tsx
        ├── VenueStructureView.tsx
        ├── CapacityConfigModal.tsx
        ├── CategoryConfigModal.tsx
        ├── ZonePanel.tsx
        ├── ZoneForm.tsx
        ├── GatePanel.tsx
        ├── GateForm.tsx
        └── StatusBadge.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript, servicio Axios, store Zustand — base que todas las user stories necesitan.

**⚠️ CRITICAL**: Ninguna user story puede comenzar hasta que esta fase esté completa.

- [ ] T001 Definir interfaces en `recinto.types.ts`:
    - `RecintoResponse`, `RecintoEstructuraResponse`, `ZonaResponse`, `CompuertaResponse`
    - `CrearRecintoRequest`, `EditarRecintoRequest`, `ConfigurarCapacidadRequest`, `ConfigurarCategoriaRequest`
    - `CrearZonaRequest`, `CrearCompuertaRequest`
    - `RecintoFiltros` (nombre, ciudad, categoria, estado, page, size)
    - Enums: `CategoriaRecinto`, `EstadoRecinto`, `TipoZona`
- [ ] T002 Implementar `recintosService.ts` con funciones tipadas:
    - `getRecintos(filtros)`, `getRecinto(id)`, `getEstructura(id)`
    - `createRecinto(data)`, `editRecinto(id, data)`
    - `desactivarRecinto(id)`, `reactivarRecinto(id)`
    - `configurarCapacidad(id, data)`, `configurarCategoria(id, data)`
    - `createZona(recintoId, data)`, `getZonas(recintoId)`
    - `createCompuerta(recintoId, data)`, `getCompuertas(recintoId)`
- [ ] T003 Implementar `recintosStore.ts` con Zustand: estado de filtros activos (nombre, ciudad, categoría, estado,
  página), acciones `setFiltro`, `resetFiltros`, `setPage`
- [ ] T004 Definir rutas en el router de la app: `/admin/recintos`, `/admin/recintos/nuevo`, `/admin/recintos/:id`,
  `/admin/recintos/:id/editar`

**Checkpoint**: Tipos definidos, servicio compilando, store funcionando, rutas registradas

---

## Phase 2: User Story 1 — Listar y Crear Recintos (Priority: P1)

**Goal**: El administrador puede ver la lista de recintos activos y registrar uno nuevo con los datos obligatorios.

**Independent Test**: Navegar a `/admin/recintos` muestra tabla con recintos. Hacer clic en "Nuevo Recinto" abre el
formulario. Completar y enviar el formulario crea el recinto y redirige al listado. Enviar sin campos obligatorios
muestra errores de validación.

- [ ] T005 [US1] Implementar `useRecintos.ts` con `useQuery` de TanStack Query: clave `['recintos', filtros]`, llama a
  `recintosService.getRecintos(filtros)` — retorna `{ data, isLoading, error }`
- [ ] T006 [US1] Implementar `useCreateRecinto.ts` con `useMutation`: llama a `recintosService.createRecinto`, invalida
  `['recintos']` en `onSuccess`
- [ ] T007 [US1] Implementar `StatusBadge.tsx`: componente que recibe `activo: boolean` y renderiza badge verde/gris con
  Tailwind
- [ ] T008 [US1] Implementar `VenueTable.tsx`: tabla con columnas nombre, ciudad, categoría, capacidad, estado (
  StatusBadge), acciones (ver, editar, desactivar)
- [ ] T009 [US1] Implementar `VenueForm.tsx`: formulario con campos nombre, ciudad, dirección, capacidadMaxima,
  teléfono, compuertasIngreso — validación con React Hook Form + Zod
- [ ] T010 [US1] Implementar `VenueListPage.tsx`: usa `useRecintos`, `useRecintosStore` para filtros, renderiza
  `VenueTable` y botón "Nuevo Recinto"
- [ ] T011 [US1] Implementar `CreateVenuePage.tsx`: renderiza `VenueForm`, en `onSuccess` redirige a `/admin/recintos`

**Checkpoint**: Listado y creación de recintos funcionales e independientemente verificables

---

## Phase 3: User Story 2 — Editar Recinto (Priority: P2)

**Goal**: El administrador puede editar los datos descriptivos de un recinto existente desde su página de detalle.

**Independent Test**: Navegar a `/admin/recintos/:id/editar` precarga los datos del recinto en el formulario. Modificar
la dirección y guardar muestra los datos actualizados en la página de detalle.

- [ ] T012 [US2] Implementar `useRecinto.ts` con `useQuery`: clave `['recintos', id]`, llama a
  `recintosService.getRecinto(id)`
- [ ] T013 [US2] Implementar `useEditRecinto.ts` con `useMutation`: llama a `recintosService.editRecinto`, invalida
  `['recintos']` y `['recintos', id]`
- [ ] T014 [US2] Implementar `EditVenuePage.tsx`: usa `useRecinto(id)` para precargar datos, renderiza `VenueForm` con
  `defaultValues`, en `onSuccess` redirige a `/admin/recintos/:id`
- [ ] T015 [US2] Actualizar `VenueForm.tsx` para soportar modo edición (prop `defaultValues` + distinción POST/PUT)

**Checkpoint**: Edición de recintos funcional con precarga de datos

---

## Phase 4: User Story 3 — Desactivar / Reactivar Recinto (Priority: P3)

**Goal**: El administrador puede desactivar o reactivar un recinto desde la tabla o la página de detalle.

**Independent Test**: Hacer clic en "Desactivar" en la tabla muestra modal de confirmación. Confirmar cambia el estado
del recinto y actualiza el badge sin recargar la página. Si el recinto tiene eventos activos, se muestra mensaje de
error.

- [ ] T016 [US3] Implementar `useDesactivarRecinto.ts` y `useReactivarRecinto.ts` con `useMutation`
- [ ] T017 [US3] Implementar modal de confirmación dentro de `VenueTable.tsx` (estado local `isConfirmOpen`)
- [ ] T018 [US3] Manejar error 409 en el handler `onError` de la mutation: mostrar toast o inline error con el mensaje
  del backend

**Checkpoint**: Activación/desactivación funcional con confirmación y manejo de errores

---

## Phase 5: User Story 4 — Configurar Capacidad (Priority: P1)

**Goal**: El administrador puede cambiar la capacidad máxima del recinto desde un modal en la página de detalle.

**Independent Test**: Hacer clic en "Configurar Capacidad" abre modal con campo numérico. Ingresar 500 y confirmar
actualiza la capacidad mostrada. Ingresar 0 muestra error de validación.

- [ ] T019 [US4] Implementar `useConfigurarCapacidad.ts` con `useMutation`
- [ ] T020 [US4] Implementar `CapacityConfigModal.tsx`: input numérico con validación Zod `min(1)`, botones
  cancelar/guardar
- [ ] T021 [US4] Integrar modal en `VenueDetailPage.tsx`

**Checkpoint**: Configuración de capacidad funcional con validación

---

## Phase 6: User Story 5 — Categorizar Recinto (Priority: P2)

**Goal**: El administrador puede asignar una categoría al recinto desde un modal en la página de detalle.

**Independent Test**: Modal muestra dropdown con valores del enum `CategoriaRecinto`. Seleccionar "TEATRO" y guardar
actualiza el badge de categoría.

- [ ] T022 [US5] Implementar `useConfigurarCategoria.ts` con `useMutation`
- [ ] T023 [US5] Implementar `CategoryConfigModal.tsx`: select con opciones del enum `CategoriaRecinto`
- [ ] T024 [US5] Integrar modal en `VenueDetailPage.tsx`

**Checkpoint**: Categorización funcional

---

## Phase 7: User Story 6 — Configurar Zonas (Priority: P2)

**Goal**: El administrador puede crear zonas dentro de un recinto y verlas en la vista de estructura.

**Independent Test**: El formulario de zona valida que la capacidad no exceda la disponible. Crear una zona la muestra
en la lista con su capacidad.

- [ ] T025 [US6] Implementar `useZonas.ts` y `useCreateZona.ts`
- [ ] T026 [US6] Implementar `ZoneForm.tsx`: campos nombre, tipo (TipoZona select), capacidad
- [ ] T027 [US6] Implementar `ZonePanel.tsx`: lista de zonas del recinto con botón "Agregar Zona"
- [ ] T028 [US6] Integrar `ZonePanel` en `VenueDetailPage.tsx`

**Checkpoint**: Gestión de zonas funcional

---

## Phase 8: User Story 7 — Configurar Compuertas (Priority: P1)

**Goal**: El administrador puede crear compuertas de entrada y asignarlas a zonas o dejarlas como generales.

**Independent Test**: Crear compuerta sin zona la marca como "General". Asignar zona la relaciona con esa zona en la
vista de estructura.

- [ ] T029 [US7] Implementar `useCompuertas.ts` y `useCreateCompuerta.ts`
- [ ] T030 [US7] Implementar `GateForm.tsx`: campos nombre, zona (select opcional con opciones de `useZonas`)
- [ ] T031 [US7] Implementar `GatePanel.tsx`: lista de compuertas con badge "General" o nombre de zona asignada
- [ ] T032 [US7] Integrar `GatePanel` en `VenueDetailPage.tsx`

**Checkpoint**: Gestión de compuertas funcional

---

## Phase 9: User Story 8 — Catálogo con Búsqueda y Filtros (Priority: P1/P2)

**Goal**: El administrador puede buscar y filtrar recintos por nombre, ciudad, categoría y estado con paginación.

**Independent Test**: Escribir en el campo de búsqueda filtra la tabla en tiempo real (debounce). Seleccionar
categoría "TEATRO" muestra solo teatros. La paginación navega por páginas de 25 elementos.

- [ ] T033 [US8] Implementar `VenueFilters.tsx`: inputs de nombre (debounce 300ms), ciudad, select de categoría, select
  de estado — lee y escribe en `recintosStore`
- [ ] T034 [US8] Implementar paginación en `VenueListPage.tsx`: botones anterior/siguiente, indicador de página actual
- [ ] T035 [US8] Implementar `VenueStructureView.tsx`: vista combinada de zonas y compuertas del recinto usando
  `useRecintoEstructura`

**Checkpoint**: Catálogo con búsqueda, filtros y paginación funcional

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T036 Revisar responsive: tabla colapsa correctamente en mobile (mostrar cards en lugar de tabla)
- [ ] T037 Agregar `aria-label` en todos los botones de acción (desactivar, editar, ver)
- [ ] T038 Implementar manejo global de errores en el cliente Axios (interceptor para 401, 403, 500)
- [ ] T039 Verificar que todos los tipos TypeScript estén alineados con la respuesta real del Swagger del backend
- [ ] T040 Revisar que no haya estados de carga sin feedback visual (skeleton o spinner)
- [ ] T041 Agregar navegación breadcrumb: Recintos > [Nombre] > Editar

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Sin dependencias — comienza de inmediato
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational y de `useRecinto` de US1
- **US3 (Phase 4)**: Depende de Foundational y de `VenueTable` de US1
- **US4 (Phase 5)**: Depende de Foundational y de `VenueDetailPage` (necesita la página de detalle)
- **US5 (Phase 6)**: Depende de Foundational y de `VenueDetailPage`
- **US6 (Phase 7)**: Depende de Foundational y de `VenueDetailPage`
- **US7 (Phase 8)**: Depende de US6 (necesita zonas para el select de la compuerta)
- **US8 (Phase 9)**: Depende de US1 (`VenueListPage` base ya construida)
- **Polish (Phase 10)**: Depende de todas las user stories completadas

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **MSW**: Los mocks de desarrollo usan Mock Service Worker para interceptar llamadas Axios sin tocar código de producción
- **TanStack Query**: la clave de cache `['recintos', filtros]` es un objeto serializable — Zustand guarda los filtros
  para que TanStack Query los use como dependencia reactiva
- **Formularios**: React Hook Form + Zod para validación declarativa — evita lógica de validación manual en el componente
- **Rutas protegidas**: las rutas `/admin/*` deben estar detrás de un guard de autenticación — implementar en la
  configuración del router
- **Debounce en búsqueda**: usar `useDebouncedValue` con 300ms para el campo de nombre antes de disparar la query
- **Paginación**: el backend retorna `Page<RecintoResponse>` — mapear `content`, `totalPages`, `number` del response de
  Spring
- Este módulo es prerequisito del panel de eventos, checkout y acceso — completar antes de comenzar esos features
