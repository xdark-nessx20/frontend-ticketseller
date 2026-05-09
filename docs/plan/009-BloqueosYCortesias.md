# Implementation Plan: Bloqueos y Cortesías – Frontend

**Date**: 09/05/2026

## Summary

El **Coordinador de Patrocinios** debe poder reservar asientos específicos para patrocinadores antes de la venta
general y generar tickets de cortesía para invitados especiales sin pasar por el proceso de pago. El panel
administrativo muestra todos los bloqueos y cortesías activos con filtros por tipo y estado, y permite editarlos
o liberarlos.

Este módulo opera exclusivamente desde el panel de administración del evento. Depende del feature 001 (recintos
con zonas y asientos), feature 002 (asientos) y feature 012 (eventos).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (selección de asientos para bloqueo múltiple)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Bloqueo de hasta 50 asientos en menos de 2s. Panel de bloqueos carga en menos de 3s.
**Constraints**: No bloquear asientos ya BLOQUEADOS u OCUPADOS. No crear cortesía para asiento OCUPADO. 0 asientos
bloqueados vendidos al público.
**Scale/Scope**: Extiende los features 001, 002 y 012.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoBloqueo = 'ACTIVO' | 'LIBERADO';
type EstadoCortesia = 'GENERADA' | 'USADA' | 'NO_USADA';
type CategoriaCortesia = 'PRENSA' | 'ARTISTA' | 'PATROCINADOR' | 'OTRO';
type TipoPanelItem = 'BLOQUEO' | 'CORTESIA';
```

### Interfaces de Respuesta

```typescript
interface BloqueoResponse {
  bloqueoId: string;
  asientoIds: string[];
  destinatario: string;
  estado: EstadoBloqueo;
  fechaCreacion: string;          // ISO 8601
  fechaExpiracion: string | null; // ISO 8601
}

interface CortesiaResponse {
  cortesiaId: string;
  codigoUnico: string;
  destinatario: string;
  categoria: CategoriaCortesia;
  asientoId: string | null;
  ticketId: string | null;
  estado: EstadoCortesia;
}

interface PanelItemResponse {
  tipo: TipoPanelItem;
  id: string;
  asientoId: string | null;
  destinatario: string;
  estado: string;                 // EstadoBloqueo | EstadoCortesia
}

interface PanelFiltros {
  tipo?: TipoPanelItem;
  estado?: string;
}
```

### Interfaces de Request

```typescript
interface BloquearAsientosRequest {
  asientoIds: string[];           // min 1
  destinatario: string;
  fechaExpiracion?: string;       // ISO 8601, opcional
}

interface CrearCortesiaRequest {
  destinatario: string;
  categoria: CategoriaCortesia;
  asientoId?: string;             // omitir → cortesía de acceso general
}

interface EditarBloqueoRequest {
  destinatario: string;
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
│   └── bloqueos.types.ts
├── services/
│   └── blo queosService.ts
├── hooks/
│   └── bloqueos/
│       ├── useBloqueos.ts
│       ├── useBloquearAsientos.ts
│       ├── useLiberarBloqueo.ts
│       ├── useEditarBloqueo.ts
│       ├── useCortesias.ts
│       └── useCrearCortesia.ts
├── pages/
│   └── bloqueos/
│       └── PanelBloqueosPage.tsx
└── components/
    └── bloqueos/
        ├── PanelBloqueosTable.tsx
        ├── PanelFiltrosBar.tsx
        ├── BloquearAsientosModal.tsx
        ├── EditarBloqueoModal.tsx
        ├── CrearCortesiaModal.tsx
        └── CortesiaBadge.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base compartida por bloqueos y cortesías.

**⚠️ CRITICAL**: Depende de los features 001, 002 y 012 completados.

- [ ] T001 Definir interfaces en `bloqueos.types.ts`:
    - `BloqueoResponse`, `CortesiaResponse`, `PanelItemResponse`, `PanelFiltros`
    - `BloquearAsientosRequest`, `CrearCortesiaRequest`, `EditarBloqueoRequest`
    - Enums: `EstadoBloqueo`, `EstadoCortesia`, `CategoriaCortesia`, `TipoPanelItem`
- [ ] T002 Implementar `bloqueosService.ts`:
    - `getPanel(eventoId, filtros?)` → `GET /api/admin/eventos/{id}/bloqueos`
    - `bloquearAsientos(eventoId, data)` → `POST /api/admin/eventos/{id}/bloqueos`
    - `editarBloqueo(bloqueoId, data)` → `PATCH /api/admin/bloqueos/{id}`
    - `liberarBloqueo(bloqueoId)` → `DELETE /api/admin/bloqueos/{id}`
    - `crearCortesia(eventoId, data)` → `POST /api/admin/eventos/{id}/cortesias`
- [ ] T003 Definir ruta: `/admin/eventos/:id/bloqueos`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 1 — Bloquear Asientos para Patrocinadores (Priority: P1)

**Goal**: El coordinador puede seleccionar asientos del mapa del evento y bloquearlos para un patrocinador. El
sistema rechaza asientos ya bloqueados u ocupados.

**Independent Test**: Desde el panel del evento, seleccionar 3 asientos disponibles y hacer clic en "Bloquear".
El modal muestra los asientos seleccionados, requiere nombre del destinatario. Confirmar cambia el estado de los
asientos a BLOQUEADO. Intentar bloquear un asiento ya BLOQUEADO muestra error 409.

- [ ] T004 [US1] Implementar `useBloquearAsientos.ts` con `useMutation`: invalida el panel en `onSuccess`
- [ ] T005 [US1] Implementar `BloquearAsientosModal.tsx`: lista los asientos seleccionados, input destinatario
  obligatorio, date picker para fechaExpiracion opcional, manejo de error 409 con mensaje descriptivo
- [ ] T006 [US1] Integrar el botón "Bloquear seleccionados" en la vista de asientos del evento (reutiliza la
  selección múltiple del feature 003 si está disponible)

**Checkpoint**: Bloqueo de asientos funcional con validación de estado

---

## Phase 3: User Story 2 — Crear Cortesías para Invitados (Priority: P1)

**Goal**: El coordinador puede generar tickets de cortesía con o sin asiento asignado. Si se asigna asiento, se
bloquea automáticamente. Sin asiento, es un ticket de acceso general.

**Independent Test**: Hacer clic en "Nueva Cortesía" y completar el formulario con asiento asignado. El ticket
generado aparece en el panel con el código único. Crear cortesía sin asiento muestra badge "Acceso General".

- [ ] T007 [US2] Implementar `useCrearCortesia.ts` con `useMutation`: invalida el panel en `onSuccess`
- [ ] T008 [US2] Implementar `CortesiaBadge.tsx`: badge con el texto del `CategoriaCortesia` (colores por tipo)
- [ ] T009 [US2] Implementar `CrearCortesiaModal.tsx`: input destinatario, select categoría, select asiento
  opcional (carga asientos DISPONIBLES del evento), botones cancelar/confirmar

**Checkpoint**: Creación de cortesías funcional con y sin asiento

---

## Phase 4: User Story 3 — Panel de Gestión de Bloqueos y Cortesías (Priority: P2)

**Goal**: El coordinador puede ver todos los bloqueos y cortesías del evento en una tabla unificada con filtros.
Puede editar el destinatario de un bloqueo o liberarlo completamente.

**Independent Test**: Navegar a `/admin/eventos/:id/bloqueos` muestra la tabla combinada. Filtrar por tipo
"CORTESIA" muestra solo cortesías. Hacer clic en "Editar" abre modal para cambiar el destinatario. Hacer clic en
"Liberar" muestra confirmación y libera el asiento a DISPONIBLE.

- [ ] T010 [US3] Implementar `useBloqueos.ts`, `useEditarBloqueo.ts`, `useLiberarBloqueo.ts`, `useCortesias.ts`
- [ ] T011 [US3] Implementar `PanelFiltrosBar.tsx`: select tipo (BLOQUEO/CORTESIA), select estado, botón "Nueva
  Cortesía", botón "Bloquear asientos"
- [ ] T012 [US3] Implementar `PanelBloqueosTable.tsx`: columnas tipo (badge), asiento, destinatario, estado, fecha
  creación, acciones (editar, liberar)
- [ ] T013 [US3] Implementar `EditarBloqueoModal.tsx`: input destinatario precargado, botón guardar
- [ ] T014 [US3] Implementar `PanelBloqueosPage.tsx`: usa `useBloqueos` y `useCortesias`, renderiza
  `PanelFiltrosBar` + `PanelBloqueosTable`

**Checkpoint**: Panel completo con edición y liberación funcionales

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T015 Agregar modal de confirmación antes de liberar un bloqueo (acción irreversible)
- [ ] T016 Mostrar badge "General" en cortesías sin asiento asignado en la tabla
- [ ] T017 Verificar que al liberar una cortesía con asiento, el mapa de inventario refleja el asiento como
  DISPONIBLE en el siguiente refresco

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 001, 002 y 012 completados
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational — puede ejecutarse en paralelo con US1
- **US3 (Phase 4)**: Depende de US1 y US2
- **Polish (Phase 5)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Operación atómica de bloqueo**: si algún asiento de la lista falla, el backend revierte todos — el frontend
  debe mostrar el error 409 con la lista de asientos problemáticos del mensaje del backend
- **Cortesía general**: `asientoId: null` en `CortesiaResponse` indica acceso general — mostrar "Acceso General"
  en lugar de número de asiento en la tabla
- **Select de asientos disponibles**: el selector en `CrearCortesiaModal` solo debe mostrar asientos DISPONIBLES
  del evento — hacer una llamada al endpoint de inventario para obtener la lista filtrada
- **Reutilización de selección**: si el feature 003 ya implementa selección múltiple de asientos en el mapa, usar
  ese mismo mecanismo para `BloquearAsientosModal`
