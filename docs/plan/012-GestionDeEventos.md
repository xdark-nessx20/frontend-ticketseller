# Implementation Plan: Gestión de Eventos – Frontend

**Date**: 09/05/2026

## Summary

El **Promotor de Eventos** debe poder registrar nuevos eventos asignándolos a un recinto, configurar
los precios de entradas por zona, editar la información del evento, marcarlo como en progreso, o finalizado, y
cancelarlo con justificación obligatoria. `Evento` es la entidad central que conecta el inventario (feature 002) con la
venta de tickets (feature 004): sin un evento activo y con precios configurados no puede haber compras.

Este módulo opera exclusivamente desde el panel de administración. Depende del feature 001 (recintos)
y feature 002 (zonas). Bloquea los features 004 (checkout) y 011 (liquidación).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (filtros del listado de eventos)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Registro de evento en menos de 3s. Panel de eventos carga en menos de 2s.
**Constraints**: No se permite borrado físico de eventos. No editar eventos EN_PROGRESO. Cancelación
requiere justificación obligatoria. 0 eventos solapados en mismo recinto (detectado por backend con
HTTP 409).
**Scale/Scope**: Entidad central del sistema — bloquea features 004 y 011. Depende de features 001
y 002.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoEvento = 'ACTIVO' | 'EN_PROGRESO' | 'FINALIZADO' | 'CANCELADO';
type TipoEvento = string;          // valor libre definido por el promotor (concierto, teatro, etc.)
```

### Interfaces de Respuesta

```typescript
interface EventoResponse {
    id: string;
    nombre: string;
    fechaInicio: string;             // ISO 8601
    fechaFin: string;                // ISO 8601
    tipo: TipoEvento;
    recintoId: string;
    estado: EstadoEvento;
    motivoCancelacion: string | null;
}

interface PrecioZonaResponse {
    id: string;
    eventoId: string;
    zonaId: string;
    zonaNombre: string;
    precio: number;
}
```

### Interfaces de Request

```typescript
interface CrearEventoRequest {
    nombre: string;
    fechaInicio: string;             // ISO 8601
    fechaFin: string;                // ISO 8601
    tipo: string;
    recintoId: string;
}

interface EditarEventoRequest {
    nombre?: string;
    fechaInicio?: string;            // ISO 8601
    fechaFin?: string;               // ISO 8601
    tipo?: string;
}

interface CancelarEventoRequest {
    estado: 'CANCELADO';
    motivo: string;                  // obligatorio
}

interface PrecioZonaRequest {
    zonaId: string;
    precio: number;                  // positivo
}

interface ConfigurarPreciosRequest {
    precios: PrecioZonaRequest[];    // debe incluir todas las zonas del recinto
}

interface EventoFiltros {
    estado?: EstadoEvento;
}
```

## Coding Standards

> **⚠️ ADVERTENCIA — Reglas obligatorias de estilo de código:**
>
> 1. **NO crear comentarios innecesarios.** El código debe ser autoexplicativo. Solo se permiten comentarios cuando
     > aportan contexto que el código solo no puede expresar.
> 2. **Se DEBEN respetar los principios del Clean Code.** Nombres descriptivos, componentes pequeños de responsabilidad
     > única, sin código muerto, sin duplicación.
> 3. **Para tipos, usar `interface` para objetos y props, `type` para uniones y primitivas.**
> 4. **Solo componentes funcionales** — sin class components.
> 5. **Lógica de negocio en custom hooks** — los componentes solo renderizan.
> 6. **Sin estilos inline** — solo clases Tailwind.

## Project Structure

### Archivos nuevos que agrega este feature

```text
src/
├── types/
│   └── evento.types.ts
├── services/
│   └── eventoService.ts
├── stores/
│   └── eventosStore.ts
├── hooks/
│   └── eventos/
│       ├── useEventos.ts
│       ├── useEvento.ts
│       ├── useCrearEvento.ts
│       ├── useEditarEvento.ts
│       ├── useCancelarEvento.ts
│       ├── usePreciosZona.ts
│       └── useConfigurarPrecios.ts
├── pages/
│   └── eventos/
│       ├── EventosPage.tsx
│       └── EventoDetallePage.tsx
└── components/
    └── eventos/
        ├── EventosTable.tsx
        ├── EventoFiltrosBar.tsx
        ├── CrearEventoModal.tsx
        ├── EditarEventoModal.tsx
        ├── CancelarEventoModal.tsx
        ├── ConfigurarPreciosModal.tsx
        ├── PreciosZonaTable.tsx
        └── EventoEstadoBadge.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript, servicio y store de filtros — base de todas las operaciones de eventos.

**⚠️ CRITICAL**: Depende de los features 001 y 002 completados. Este feature bloquea los features
004 y 011.

- [ ] T001 Definir interfaces en `evento.types.ts`:
    - `EventoResponse`, `PrecioZonaResponse`
    - `CrearEventoRequest`, `EditarEventoRequest`, `CancelarEventoRequest`, `PrecioZonaRequest`,
      `ConfigurarPreciosRequest`, `EventoFiltros`
    - Enums: `EstadoEvento`
- [ ] T002 Implementar `eventoService.ts`:
    - `getEventos(filtros?)` → `GET /api/eventos`
    - `getEvento(eventoId)` → `GET /api/eventos/{id}`
    - `crearEvento(data)` → `POST /api/eventos`
    - `editarEvento(eventoId, data)` → `PATCH /api/eventos/{id}`
    - `cambiarEstadoEvento(eventoId, data)` → `PATCH /api/eventos/{id}/estado`
    - `getPrecios(eventoId)` → `GET /api/eventos/{id}/precios`
    - `configurarPrecios(eventoId, data)` → `POST /api/eventos/{id}/precios`
- [ ] T003 Implementar `eventosStore.ts` con Zustand: filtro de estado activo (`estado?`), acciones
  `setFiltroEstado`, `resetFiltros`
- [ ] T004 Definir rutas: `/admin/eventos`, `/admin/eventos/:id`

**Checkpoint**: Tipos definidos, servicio compilando, store funcionando

---

## Phase 2: User Story 1 — Registro de un Evento (Priority: P1)

**Goal**: El promotor puede registrar un evento con datos mínimos asignado a un recinto disponible.
El sistema rechaza recintos inactivos o con solapamiento de fechas.

**Independent Test**: Hacer clic en "Nuevo Evento" y completar el formulario con un recintoId válido.
El evento aparece en la tabla con estado ACTIVO. Seleccionar un recinto inactivo muestra error 409.
Seleccionar fechas que solapan con otro evento del mismo recinto muestra error 409 descriptivo.

- [ ] T005 [US1] Implementar `useEventos.ts` y `useCrearEvento.ts` con `useQuery`/`useMutation`:
  `useCrearEvento` invalida la lista en `onSuccess`
- [ ] T006 [US1] Implementar `EventoEstadoBadge.tsx`: badge coloreado por `EstadoEvento`
  (verde=ACTIVO, amarillo=EN_PROGRESO, gris=FINALIZADO, rojo=CANCELADO)
- [ ] T007 [US1] Implementar `CrearEventoModal.tsx`: inputs nombre, tipo, date pickers
  fechaInicio/fechaFin, select recintoId con recintos activos; manejo de error 409 (solapamiento
  o recinto no disponible) con mensaje descriptivo
- [ ] T008 [US1] Implementar `EventosTable.tsx`: columnas nombre, tipo, recinto, fechaInicio,
  estado (badge), acciones (editar, configurar precios, cancelar, ver detalle)
- [ ] T009 [US1] Implementar `EventoFiltrosBar.tsx`: select estado, botón "Nuevo Evento", botón
  "Limpiar filtros" — lee y escribe en `eventosStore`
- [ ] T010 [US1] Implementar `EventosPage.tsx`: usa `useEventos` con `eventosStore` para filtros,
  renderiza `EventoFiltrosBar` + `EventosTable`

**Checkpoint**: Registro y listado de eventos funcionales

---

## Phase 3: User Story 2 — Configurar Precios por Zona (Priority: P1)

**Goal**: El promotor puede configurar precios por zona para un evento. Todas las zonas del recinto
deben tener precio; el backend rechaza si alguna queda sin precio.

**Independent Test**: Hacer clic en "Configurar Precios" sobre un evento ACTIVO. El modal muestra
las zonas del recinto con inputs de precio. Dejar una zona sin precio y confirmar muestra error 422.
Completar todas y confirmar guarda los precios.

- [ ] T011 [US2] Implementar `usePreciosZona.ts` y `useConfigurarPrecios.ts` con
  `useQuery`/`useMutation`: `useConfigurarPrecios` invalida los precios del evento en `onSuccess`
- [ ] T012 [US2] Implementar `PreciosZonaTable.tsx`: tabla con columnas zona y precio; modo edición
  con inputs de precio por fila
- [ ] T013 [US2] Implementar `ConfigurarPreciosModal.tsx`: carga las zonas del recinto del evento y
  las precios existentes (si ya fueron configurados), inputs de precio por zona con validación
  `min(0.01)`, aviso si alguna zona está sin precio al intentar guardar; maneja error 422

**Checkpoint**: Configuración de precios por zona funcional

---

## Phase 4: User Story 3 — Edición de Información de un Evento (Priority: P2)

**Goal**: El promotor puede editar datos de un evento, excepto si está EN_PROGRESO. El sistema
rechaza ediciones sobre eventos en progreso con mensaje claro.

**Independent Test**: Hacer clic en "Editar" sobre un evento ACTIVO. Cambiar el nombre y confirmar.
El evento actualizado aparece en la tabla. Intentar editar un evento EN_PROGRESO muestra error 409
"No se puede editar un evento en progreso".

- [ ] T014 [US3] Implementar `useEditarEvento.ts` con `useMutation`: invalida el evento y la lista
  en `onSuccess`; maneja error 409 con mensaje descriptivo
- [ ] T015 [US3] Implementar `EditarEventoModal.tsx`: inputs precargados con los datos actuales del
  evento; todos los campos son opcionales (edición parcial); deshabilita el botón guardar mientras
  la mutation está pendiente
- [ ] T016 [US3] Integrar `EditarEventoModal` en las acciones de `EventosTable`; deshabilitar el
  botón "Editar" si el estado es EN_PROGRESO

**Checkpoint**: Edición de eventos funcional con guard de estado

---

## Phase 5: User Story 4 — Cancelar un Evento (Priority: P2)

**Goal**: El promotor puede cancelar un evento con justificación obligatoria. El evento desaparece
del listado activo pero se mantiene visible con filtro por estado CANCELADO.

**Independent Test**: Hacer clic en "Cancelar" sobre un evento ACTIVO. El modal requiere ingresar
motivo. Confirmar cambia el estado a CANCELADO. El evento no aparece en el listado por defecto pero
sí al filtrar por estado CANCELADO.

- [ ] T017 [US4] Implementar `useCancelarEvento.ts` con `useMutation`: invalida la lista de eventos
  en `onSuccess`
- [ ] T018 [US4] Implementar `CancelarEventoModal.tsx`: muestra nombre del evento para confirmar,
  textarea motivo obligatorio (Zod `min(1)`), aviso de que la acción es irreversible, botones
  cancelar/confirmar
- [ ] T019 [US4] Integrar `CancelarEventoModal` en las acciones de `EventosTable`; deshabilitar el
  botón "Cancelar" si el estado ya es CANCELADO o FINALIZADO

**Checkpoint**: Las cuatro user stories son funcionales e independientemente testeables

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T020 Implementar `EventoDetallePage.tsx`: muestra datos completos del evento incluyendo
  `PreciosZonaTable`, acciones de editar/cancelar y links a inventario y bloqueos
- [ ] T021 Mostrar aviso en `EventosTable` cuando un evento tiene precios sin configurar (necesario
  para habilitar ventas)
- [ ] T022 Verificar que el filtro por estado `CANCELADO` en `EventoFiltrosBar` funciona
  correctamente con el query param del backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 001 y 002 completados — bloquea todas las
  user stories y los features 004 y 011
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 — necesita el eventoId y las zonas del recinto
- **US3 (Phase 4)**: Depende de US1 — puede ejecutarse en paralelo con US2
- **US4 (Phase 5)**: Depende de US1 — `useCancelarEvento` necesita que el evento exista
- **Polish (Phase 6)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Solapamiento de fechas**: el backend retorna HTTP 409 si las fechas del nuevo evento solapan
  con otro evento en el mismo recinto — mostrar el mensaje del backend directamente en el modal,
  ya que contiene el nombre del evento conflictivo
- **Guard de edición**: deshabilitar visualmente el botón "Editar" cuando el estado es EN_PROGRESO
  (no solo manejar el error 409) — la UX debe comunicar la restricción antes de que el usuario
  intente la acción
- **Precios obligatorios para ventas**: sin precios configurados, el checkout del feature 004 falla
  — el aviso en `EventosTable` sobre precios pendientes es una guía operacional importante para el
  promotor
- **Estado CANCELADO en listado**: por defecto `GET /api/eventos` excluye cancelados; el filtro
  `estado=CANCELADO` en `eventosStore` debe enviarse como query param al servicio para que el
  backend los incluya
