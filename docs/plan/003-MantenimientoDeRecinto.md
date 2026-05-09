# Implementation Plan: Mantenimiento de Recinto (Cambio de Estado de Asientos) – Frontend

**Date**: 09/05/2026

## Summary

El **Gestor de Inventario** debe poder cambiar el estado de asientos individuales o en masa dentro del contexto de un
evento específico, con validación de las transiciones permitidas por la máquina de estados del negocio. Toda operación
manual queda registrada en un historial de auditoría consultable por el administrador.

Este módulo se integra como sección dentro de la vista de un evento — no es una página independiente. Las acciones
sobre asientos siempre están contextualizadas a un eventoId. Depende del feature 002 para la existencia de asientos y
del feature de gestión de eventos para el eventoId.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (selección de asientos para cambio masivo)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Cambio individual reflejado en UI en menos de 1s. Cambio masivo de hasta 200 asientos completa
en menos de 5s.
**Constraints**: No se puede cambiar un asiento `VENDIDO` a `DISPONIBLE` sin procesar la cancelación primero. Los
cambios masivos informan los asientos omitidos con su razón. Todas las operaciones requieren eventoId.
**Scale/Scope**: Extiende el feature 002 — la entidad `Asiento` debe existir. Depende del feature de eventos (012).

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoAsiento = 'DISPONIBLE' | 'BLOQUEADO' | 'RESERVADO' | 'VENDIDO' | 'MANTENIMIENTO' | 'ANULADO';
```

### Interfaces de Respuesta

```typescript
interface HistorialCambioResponse {
  fechaHora: string;          // ISO 8601
  usuario: string;
  estadoAnterior: EstadoAsiento;
  estadoNuevo: EstadoAsiento;
  motivo: string | null;
}

interface CambiarEstadoMasivoResponse {
  modificados: number;
  omitidos: number;
  mensajes: string[];
}

interface AsientoConEstadoResponse {
  id: string;
  numero: string;
  fila: number;
  columna: number;
  zonaId: string;
  estado: EstadoAsiento;
}
```

### Interfaces de Request

```typescript
interface CambiarEstadoRequest {
  estadoDestino: EstadoAsiento;
  motivo?: string;
}

interface CambiarEstadoMasivoRequest {
  asientoIds: string[];     // min 1
  estadoDestino: EstadoAsiento;
  motivo?: string;
}
```

### Transiciones Válidas (referencia visual)

```typescript
// DISPONIBLE  → BLOQUEADO, RESERVADO, MANTENIMIENTO
// BLOQUEADO   → DISPONIBLE, MANTENIMIENTO
// RESERVADO   → DISPONIBLE, VENDIDO
// VENDIDO     → (ninguna transición manual)
// MANTENIMIENTO → DISPONIBLE, BLOQUEADO
// ANULADO     → (ninguna transición manual)
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
│   └── mantenimiento.types.ts
├── services/
│   └── asientoMantenimientoService.ts
├── hooks/
│   └── mantenimiento/
│       ├── useCambiarEstadoAsiento.ts
│       ├── useCambiarEstadoMasivo.ts
│       └── useHistorialAsiento.ts
└── components/
    └── mantenimiento/
        ├── AsientoEstadoBadge.tsx
        ├── CambiarEstadoModal.tsx
        ├── CambiarEstadoMasivoModal.tsx
        ├── ResultadoMasivoAlert.tsx
        └── HistorialAsientoPanel.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base compartida por todas las user stories.

**⚠️ CRITICAL**: Depende de los features 002 (asientos) y 012 (eventos) implementados.

- [ ] T001 Definir tipos en `mantenimiento.types.ts`:
    - `HistorialCambioResponse`, `CambiarEstadoMasivoResponse`, `AsientoConEstadoResponse`
    - `CambiarEstadoRequest`, `CambiarEstadoMasivoRequest`
    - Enum `EstadoAsiento` (si no está ya definido en `asiento.types.ts`, importar desde allí)
- [ ] T002 Implementar `asientoMantenimientoService.ts`:
    - `cambiarEstado(eventoId, asientoId, data)` → `PATCH /api/eventos/{eventoId}/asientos/{asientoId}/estado`
    - `cambiarEstadoMasivo(eventoId, data)` → `PATCH /api/eventos/{eventoId}/asientos/estado-masivo`
    - `getHistorial(eventoId, asientoId)` → `GET /api/eventos/{eventoId}/asientos/{asientoId}/historial`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 1 — Cambio Individual de Estado de Asiento (Priority: P1)

**Goal**: El gestor puede cambiar el estado de un asiento específico dentro de un evento. Las transiciones inválidas
son rechazadas con mensaje claro. Cada cambio queda registrado en el historial.

**Independent Test**: En la vista del evento, seleccionar un asiento y cambiar su estado a "MANTENIMIENTO". El badge
del asiento se actualiza inmediatamente. Intentar mover un asiento "VENDIDO" a "DISPONIBLE" muestra error 409.

- [ ] T003 [US1] Implementar `useCambiarEstadoAsiento.ts` con `useMutation`: invalida la query del asiento en `onSuccess`
- [ ] T004 [US1] Implementar `AsientoEstadoBadge.tsx`: badge de color según `EstadoAsiento` (verde/amarillo/rojo/gris)
- [ ] T005 [US1] Implementar `CambiarEstadoModal.tsx`: select de estado destino (solo opciones válidas según estado
  actual), campo motivo opcional, validación antes de confirmar
- [ ] T006 [US1] Exponer botón "Cambiar Estado" en el componente de asiento de la vista de evento; abre
  `CambiarEstadoModal` con el `asientoId` y `eventoId` en contexto
- [ ] T007 [US1] Manejar error 409 (transición inválida): mostrar mensaje descriptivo del backend en el modal

**Checkpoint**: Cambio individual funcional con validación de transición y feedback de error

---

## Phase 3: User Story 2 — Cambio Masivo de Estado de Asientos (Priority: P2)

**Goal**: El gestor puede seleccionar múltiples asientos y aplicar el mismo cambio de estado en bloque. Los asientos
no modificables quedan excluidos y se informa cuántos fueron omitidos.

**Independent Test**: Seleccionar 10 asientos, elegir "BLOQUEADO" como destino y confirmar. El resumen muestra
"modificados: 8, omitidos: 2" con razones. El estado de los 8 asientos se actualiza en pantalla.

- [ ] T008 [US2] Implementar `useCambiarEstadoMasivo.ts` con `useMutation`
- [ ] T009 [US2] Implementar `CambiarEstadoMasivoModal.tsx`: muestra los asientos seleccionados, select de estado
  destino, campo motivo opcional, botón confirmar
- [ ] T010 [US2] Implementar `ResultadoMasivoAlert.tsx`: muestra `CambiarEstadoMasivoResponse` con conteos de
  modificados/omitidos y mensajes descriptivos
- [ ] T011 [US2] Agregar modo selección múltiple en la vista de asientos del evento: checkboxes por asiento, botón
  "Cambiar estado a seleccionados" que abre `CambiarEstadoMasivoModal`

**Checkpoint**: Cambio masivo funcional con resumen de resultados

---

## Phase 4: User Story 3 — Historial de Cambios de Estado (Priority: P3)

**Goal**: El gestor puede consultar el historial cronológico de cambios manuales de cualquier asiento, ordenado del
más reciente al más antiguo. Para asientos sin historial, se muestra lista vacía.

**Independent Test**: Hacer clic en un asiento y abrir su historial. La lista muestra fecha, usuario, estado anterior,
estado nuevo y motivo. Para un asiento sin cambios manuales, se muestra "Sin historial".

- [ ] T012 [US3] Implementar `useHistorialAsiento.ts` con `useQuery`: clave `['historial', eventoId, asientoId]`
- [ ] T013 [US3] Implementar `HistorialAsientoPanel.tsx`: lista cronológica de `HistorialCambioResponse` con
  fecha formateada, usuario, badges de estado anterior → nuevo, y motivo si existe
- [ ] T014 [US3] Integrar panel como sección colapsable en el modal o drawer de detalle del asiento

**Checkpoint**: Historial funcional, visible y correctamente formateado

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T015 Limitar las opciones del select de estado destino según las transiciones válidas definidas en los tipos —
  no mostrar opciones que el backend rechazaría
- [ ] T016 Verificar que la selección múltiple se limpia al cerrar el modal masivo o al navegar fuera
- [ ] T017 Confirmar que los badges de `AsientoEstadoBadge` son consistentes con los de `StatusBadge` del feature 001

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 002 y 012 completados
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 — reutiliza la infraestructura de selección de asientos
- **US3 (Phase 4)**: Puede ejecutarse en paralelo con US2
- **Polish (Phase 5)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **EstadoAsiento compartido**: el enum `EstadoAsiento` se define en `asiento.types.ts` del feature 002 — no duplicar;
  importar desde allí en `mantenimiento.types.ts`
- **Transiciones válidas en el select**: derivar las opciones disponibles del estado actual del asiento usando un mapa
  estático en el frontend — esto es solo para UX (el backend valida de todos modos)
- **Contexto de evento**: todas las llamadas requieren `eventoId` — pasarlo como parámetro a los hooks, no como estado
  global, para evitar bugs al tener múltiples eventos en memoria
- **Historial vacío**: el backend retorna lista vacía (no 404) para asientos sin historial — tratar correctamente en UI
