# Implementation Plan: Gestión de Eventos – Frontend

**Date**: 09/05/2026  
**Specs**:

- [012-GestionDeEventos.md](/docs/plan/012-GestionDeEventos.md)

## Summary

El **Administrador** debe poder registrar nuevos eventos asociados a recintos existentes, listar y filtrar eventos por estado, editar sus datos, gestionar su ciclo de vida (activar → iniciar → finalizar / cancelar), configurar precios por zona, y ver el listado de reembolsos generados por la cancelación de un evento.

Este módulo es el núcleo de la operación de eventos. Es prerequisito del plan 004 (checkout) y del plan 010 (campañas), ya que los eventos necesitan existir y tener precios configurados antes de que los compradores puedan adquirir tickets.

Depende del plan 001 completado (recintos y zonas existen para asociar el evento).

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
**Performance Goals**: Listado de eventos carga en menos de 1s. Formulario de creación responde en menos de 500ms.  
**Constraints**: No se puede editar un evento CANCELADO o FINALIZADO. Los precios deben configurarse antes de que el evento sea visible para compradores. La cancelación requiere motivo obligatorio. El evento no puede iniciarse si no tiene precios configurados.  
**Scale/Scope**: Módulo central del sistema — prerequisito de checkout y campañas.

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
│   └── evento.types.ts           ← EventoResponse, CrearEventoRequest, PrecioZonaResponse, etc.
├── services/
│   ├── eventosService.ts         ← CRUD eventos, ciclo de vida, reembolsos
│   └── preciosService.ts         ← configurar y listar precios de evento
├── stores/
│   └── eventosStore.ts           ← Zustand: filtros activos del listado
├── hooks/
│   └── eventos/
│       ├── useEventos.ts
│       ├── useEvento.ts
│       ├── useCreateEvento.ts
│       ├── useEditEvento.ts
│       ├── useCancelarEvento.ts
│       ├── useIniciarEvento.ts
│       ├── useFinalizarEvento.ts
│       ├── usePreciosEvento.ts
│       ├── useConfigurarPrecios.ts
│       └── useReembolsosEvento.ts
├── pages/
│   └── eventos/
│       ├── EventListPage.tsx
│       ├── EventDetailPage.tsx
│       ├── CreateEventPage.tsx
│       ├── EditEventPage.tsx
│       ├── PriceConfigurationPage.tsx
│       └── EventRefundsPage.tsx
└── components/
    └── eventos/
        ├── EventTable.tsx
        ├── EventCard.tsx
        ├── EventFilters.tsx
        ├── EventForm.tsx
        ├── EventStatusBadge.tsx
        ├── EventLifecycleActions.tsx
        ├── CancelEventModal.tsx
        ├── PriceTable.tsx
        └── ZonePriceRow.tsx

src/__tests__/
└── eventos/
    ├── EventTable.test.tsx
    ├── EventForm.test.tsx
    ├── EventFilters.test.tsx
    ├── EventLifecycleActions.test.tsx
    ├── CancelEventModal.test.tsx
    ├── PriceTable.test.tsx
    └── useEventos.test.ts
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Depende del plan 001 completado — recintos y zonas deben existir.

- [ ] T001 Definir interfaces en `evento.types.ts`:
  - `EventoResponse` (id, recintoId, nombre, descripcion, fechaInicio, fechaFin, tipoEvento, estado, metadatos)
  - `CrearEventoRequest` (recintoId, nombre, descripcion, fechaInicio, fechaFin, tipoEvento)
  - `EditarEventoRequest` (nombre, descripcion, fechaInicio, fechaFin)
  - `CancelarEventoRequest` (motivo)
  - `PrecioZonaResponse` (id, eventoId, zonaId, nombreZona, precio)
  - `ConfigurarPreciosRequest` (precios: { zonaId, precio }[])
  - `ReembolsoResponse` (id, ticketId, monto, estado, motivo)
  - `EventoFiltros` (estado, fechaInicio, fechaFin)
  - Enums: `EstadoEvento`, `TipoEvento`
- [ ] T002 Implementar `eventosService.ts`:
  - `getEventos(filtros?)` — GET `/api/v1/eventos?estado=`
  - `getEvento(id)` — GET `/api/v1/eventos/{id}`
  - `createEvento(data)` — POST `/api/v1/eventos`
  - `editEvento(id, data)` — PUT `/api/v1/eventos/{id}`
  - `cancelarEvento(id, data)` — DELETE `/api/v1/eventos/{id}/cancelar`
  - `iniciarEvento(id)` — PATCH `/api/v1/eventos/{id}/iniciar`
  - `finalizarEvento(id)` — PATCH `/api/v1/eventos/{id}/finalizar`
  - `getReembolsos(eventoId, page, size)` — GET `/api/v1/eventos/{id}/reembolsos`
- [ ] T003 Implementar `preciosService.ts`:
  - `getPrecios(eventoId)` — GET `/api/v1/eventos/{eventoId}/precios`
  - `configurarPrecios(eventoId, data)` — POST `/api/v1/eventos/{eventoId}/precios`
- [ ] T004 Implementar `eventosStore.ts` con Zustand: estado de filtros (estado, fechaInicio, fechaFin), acciones `setFiltro`, `resetFiltros`
- [ ] T005 Definir rutas: `/admin/eventos`, `/admin/eventos/nuevo`, `/admin/eventos/:id`, `/admin/eventos/:id/editar`, `/admin/eventos/:id/precios`, `/admin/eventos/:id/reembolsos`

**Checkpoint**: Tipos, servicios y store compilando; rutas registradas

---

## Phase 2: User Story 1 — Crear y Listar Eventos (Priority: P1)

**Goal**: El administrador puede registrar un nuevo evento y verlo en el listado.

**Independent Test**: Navegar a `/admin/eventos` muestra tabla de eventos. Clic en "Nuevo Evento" abre el formulario. Completar datos (recinto, nombre, fechas, tipo) y enviar crea el evento en estado ACTIVO.

### Tests para User Story 1

- [ ] T006 [P] [US1] Test: `EventTable` renderiza filas con badge de estado — `EventTable.test.tsx`
- [ ] T007 [P] [US1] Test: `EventForm` valida que fechaFin sea posterior a fechaInicio — `EventForm.test.tsx`
- [ ] T008 [P] [US1] Test: `EventForm` valida recinto seleccionado — `EventForm.test.tsx`
- [ ] T009 [P] [US1] Test: `useCreateEvento` invalida `['eventos']` en `onSuccess` — `useEventos.test.ts`

### Implementación de User Story 1

- [ ] T010 [US1] Implementar `useEventos.ts` con `useQuery`, clave `['eventos', filtros]`
- [ ] T011 [US1] Implementar `useCreateEvento.ts` con `useMutation`
- [ ] T012 [US1] Implementar `EventStatusBadge.tsx`: badge ACTIVO (azul), EN_PROGRESO (naranja), FINALIZADO (verde), CANCELADO (rojo)
- [ ] T013 [US1] Implementar `EventForm.tsx`: select de recinto (usa `useRecintos` del plan 001), campos nombre/descripción, date-time pickers fechaInicio/fechaFin, select de tipo; validación Zod
- [ ] T014 [US1] Implementar `EventTable.tsx`: columnas nombre, recinto, tipo, fechaInicio, estado (badge), acciones
- [ ] T015 [US1] Implementar `EventListPage.tsx`: `EventFilters` + `EventTable` + botón "Nuevo Evento"
- [ ] T016 [US1] Implementar `CreateEventPage.tsx`: renderiza `EventForm`, redirige a `/admin/eventos/:id/precios` en `onSuccess`

**Checkpoint**: Creación y listado de eventos funcional

---

## Phase 3: User Story 2 — Filtrar Eventos (Priority: P2)

**Goal**: El administrador puede filtrar eventos por estado y rango de fechas.

**Independent Test**: Seleccionar estado "EN_PROGRESO" filtra la tabla. Establecer fechaInicio y fechaFin reduce los resultados al rango.

### Tests para User Story 2

- [ ] T017 [P] [US2] Test: `EventFilters` actualiza el store al cambiar el select de estado — `EventFilters.test.tsx`
- [ ] T018 [P] [US2] Test: `useEventos` pasa `estado` al servicio cuando está en el store

### Implementación de User Story 2

- [ ] T019 [US2] Implementar `EventFilters.tsx`: select de estado, date inputs de rango — escribe en `eventosStore`
- [ ] T020 [US2] Actualizar `useEventos.ts` para leer filtros del store

**Checkpoint**: Filtrado de eventos funcional

---

## Phase 4: User Story 3 — Editar Evento (Priority: P2)

**Goal**: El administrador puede editar los datos de un evento ACTIVO.

**Independent Test**: Navegar a `/admin/eventos/:id/editar` precarga el formulario. Cambiar el nombre y guardar actualiza el evento. Si el evento está CANCELADO, la página muestra "No se puede editar" en lugar del formulario.

### Tests para User Story 3

- [ ] T021 [P] [US3] Test: `EditEventPage` precarga datos del evento — test
- [ ] T022 [P] [US3] Test: formulario en modo edición está deshabilitado si estado ≠ ACTIVO

### Implementación de User Story 3

- [ ] T023 [US3] Implementar `useEvento.ts` y `useEditEvento.ts`
- [ ] T024 [US3] Implementar `EditEventPage.tsx`: precarga con `useEvento`, renderiza `EventForm` con `defaultValues`; guarda estado previo para deshabilitar form si no es ACTIVO

**Checkpoint**: Edición de eventos funcional

---

## Phase 5: User Story 4 — Ciclo de Vida del Evento (Priority: P1)

**Goal**: El administrador puede cancelar, iniciar y finalizar un evento desde la página de detalle.

**Independent Test**: En el detalle de un evento ACTIVO: "Cancelar" abre modal con campo de motivo obligatorio. "Iniciar" cambia estado a EN_PROGRESO (solo disponible si tiene precios). "Finalizar" cambia a FINALIZADO (solo desde EN_PROGRESO).

### Tests para User Story 4

- [ ] T025 [P] [US4] Test: `CancelEventModal` valida que el motivo no esté vacío — `CancelEventModal.test.tsx`
- [ ] T026 [P] [US4] Test: `EventLifecycleActions` solo muestra "Iniciar" si el estado es ACTIVO — `EventLifecycleActions.test.tsx`
- [ ] T027 [P] [US4] Test: `EventLifecycleActions` solo muestra "Finalizar" si el estado es EN_PROGRESO — `EventLifecycleActions.test.tsx`

### Implementación de User Story 4

- [ ] T028 [US4] Implementar `useCancelarEvento.ts`, `useIniciarEvento.ts`, `useFinalizarEvento.ts`
- [ ] T029 [US4] Implementar `CancelEventModal.tsx`: textarea de motivo (required), botones cancelar/confirmar
- [ ] T030 [US4] Implementar `EventLifecycleActions.tsx`: renderiza condicionalmente los botones según el `estado` del evento — lógica: ACTIVO → [Iniciar, Cancelar]; EN_PROGRESO → [Finalizar, Cancelar]; demás → ningún botón
- [ ] T031 [US4] Implementar `EventDetailPage.tsx`: header con datos del evento, `EventStatusBadge`, `EventLifecycleActions`, tabs para navegar a precios/reembolsos

**Checkpoint**: Ciclo de vida completo funcional

---

## Phase 6: User Story 5 — Configurar Precios (Priority: P1)

**Goal**: El administrador puede configurar el precio por zona para un evento antes de que salga a la venta.

**Independent Test**: Navegar a `/admin/eventos/:id/precios` muestra tabla con las zonas del recinto. Ingresar precio por zona y guardar configura los precios. Una zona sin precio muestra "No configurado".

### Tests para User Story 5

- [ ] T032 [P] [US5] Test: `PriceTable` renderiza una fila por zona del recinto — `PriceTable.test.tsx`
- [ ] T033 [P] [US5] Test: `ZonePriceRow` valida precio positivo antes de guardar — `PriceTable.test.tsx`
- [ ] T034 [P] [US5] Test: `useConfigurarPrecios` invalida `['precios', eventoId]` en `onSuccess`

### Implementación de User Story 5

- [ ] T035 [US5] Implementar `usePreciosEvento.ts` y `useConfigurarPrecios.ts`
- [ ] T036 [US5] Implementar `ZonePriceRow.tsx`: fila con nombre zona, input de precio editable inline, badge "Configurado" / "Sin precio"
- [ ] T037 [US5] Implementar `PriceTable.tsx`: tabla de zonas con `ZonePriceRow` + botón "Guardar Todos" que llama a `configurarPrecios` con el array de precios
- [ ] T038 [US5] Implementar `PriceConfigurationPage.tsx`: carga zonas del evento + `PriceTable`

**Checkpoint**: Configuración de precios funcional

---

## Phase 7: User Story 6 — Reembolsos por Cancelación (Priority: P2)

**Goal**: El administrador puede ver el listado paginado de reembolsos generados al cancelar un evento.

**Independent Test**: Navegar a `/admin/eventos/:id/reembolsos` muestra tabla con todos los reembolsos del evento cancelado. Paginar navega correctamente.

### Tests para User Story 6

- [ ] T039 [P] [US6] Test: `EventRefundsPage` muestra tabla de reembolsos mockeados — test
- [ ] T040 [P] [US6] Test: paginación de reembolsos funciona correctamente

### Implementación de User Story 6

- [ ] T041 [US6] Implementar `useReembolsosEvento.ts` con `useQuery` paginada
- [ ] T042 [US6] Implementar `EventRefundsPage.tsx`: tabla de reembolsos (ticketId, monto, estado, motivo) con paginación

**Checkpoint**: Listado de reembolsos por evento funcional

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T043 Breadcrumb: Eventos > [Nombre] > Precios | Reembolsos
- [ ] T044 Mensaje de advertencia al iniciar: "Esta acción pondrá el evento en progreso. Asegúrate de que los precios están configurados"
- [ ] T045 Responsive: tabla de eventos colapsa a cards en mobile
- [ ] T046 Verificar tipos alineados con OpenAPI del backend, especialmente `EventoResponse` y `PrecioZonaResponse`

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende del plan 001 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 (`EventListPage` base construida)
- **US3 (Phase 4)**: Depende de Foundational y de `useEvento`
- **US4 (Phase 5)**: Depende de US3 (`EventDetailPage`)
- **US5 (Phase 6)**: Depende de Foundational y de US4 (`EventDetailPage` como contenedor)
- **US6 (Phase 7)**: Depende de Foundational — independiente de otras US
- **Polish (Phase 8)**: Depende de todo

---

## Notes

- **Flujo recomendado post-creación**: al crear un evento se redirige directamente a `/admin/eventos/:id/precios` para que el administrador configure los precios de inmediato
- **EventForm reutilizado**: en modo creación usa `POST /eventos`; en modo edición usa `PUT /eventos/{id}` — diferenciar con prop `eventoId?: string`
- **Zonas para precios**: la tabla de precios obtiene las zonas del recinto del evento usando el endpoint `/api/v1/recintos/{recintoId}/zonas` del plan 001 — reutilizar `useZonas(recintoId)` del plan 001
- **Ciclo de vida**: la lógica de qué botones mostrar está encapsulada en `EventLifecycleActions` — no en `EventDetailPage` — para facilitar testing y reutilización
- Este módulo es prerequisito directo de planes 004, 009 y 010 — completar antes de comenzar esos features

