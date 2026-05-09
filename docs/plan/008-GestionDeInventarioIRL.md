# Implementation Plan: Gestión de Inventario en Tiempo Real – Frontend

**Date**: 09/05/2026

## Summary

El sistema debe mostrar al **Administrador** el estado de disponibilidad de asientos en tiempo real: qué asientos
están libres, cuáles tienen un hold temporal activo y su tiempo de expiración, y cuáles ya están ocupados. La
interfaz permite verificar manualmente la disponibilidad de un asiento específico y visualizar el mapa de estado
del inventario del evento.

Este módulo es de solo lectura para el administrador — las acciones de reserva y ocupación las ejecuta el sistema
automáticamente. Depende del feature 002 (asientos) y feature 012 (eventos).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5 (refresco automático cada 30s para inventario en tiempo real)
**Client State**: Zustand (no requerido — datos del servidor son la fuente de verdad)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Verificación de disponibilidad de un asiento en menos de 1s. Mapa de inventario carga en
menos de 2s con hasta 5,000 asientos.
**Constraints**: No modificar estados desde esta interfaz — solo visualización y verificación. Los holds expirados
deben reflejarse correctamente (el backend los limpia automáticamente).
**Scale/Scope**: Extiende el feature 002 — `Asiento` con estado `RESERVADO` y campo `expiraEn` debe existir.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
// EstadoAsiento extendido — importar desde asiento.types.ts (feature 002) y verificar que incluye:
// 'DISPONIBLE' | 'BLOQUEADO' | 'RESERVADO' | 'VENDIDO' | 'MANTENIMIENTO' | 'ANULADO'
// Este feature agrega los estados RESERVADO y OCUPADO al ciclo
```

### Interfaces de Respuesta

```typescript
interface DisponibilidadResponse {
  asientoId: string;
  disponible: boolean;
  mensaje: string | null;
}

interface AsientoInventarioResponse {
  id: string;
  numero: string;
  fila: number;
  columna: number;
  zonaId: string;
  estado: string;               // EstadoAsiento
  expiraEn: string | null;      // ISO 8601 — presente solo en estado RESERVADO
}

interface InventarioEventoResponse {
  eventoId: string;
  totalAsientos: number;
  disponibles: number;
  reservados: number;
  ocupados: number;
  bloqueados: number;
  asientos: AsientoInventarioResponse[];
}
```

### Interfaces de Request

```typescript
interface VerificarDisponibilidadParams {
  eventoId: string;
  asientoId: string;
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
│   └── inventario.types.ts
├── services/
│   └── inventarioService.ts
├── hooks/
│   └── inventario/
│       ├── useInventarioEvento.ts
│       └── useVerificarDisponibilidad.ts
├── pages/
│   └── inventario/
│       └── InventarioEventoPage.tsx
└── components/
    └── inventario/
        ├── InventarioResumen.tsx
        ├── InventarioMapaGrid.tsx
        ├── AsientoInventarioCelda.tsx
        ├── HoldCountdown.tsx
        └── VerificarDisponibilidadPanel.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base de las consultas de inventario.

**⚠️ CRITICAL**: Depende de los features 002 y 012 completados. `EstadoAsiento` debe incluir `RESERVADO` y `OCUPADO`.

- [ ] T001 Definir interfaces en `inventario.types.ts`:
    - `DisponibilidadResponse`, `AsientoInventarioResponse`, `InventarioEventoResponse`
    - `VerificarDisponibilidadParams`
- [ ] T002 Implementar `inventarioService.ts`:
    - `getInventarioEvento(eventoId)` → `GET /api/inventario/eventos/{eventoId}`
    - `verificarDisponibilidad(eventoId, asientoId)` → `GET /api/inventario/asientos/{id}/disponibilidad`
- [ ] T003 Definir ruta: `/admin/eventos/:id/inventario`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 1 — Verificar Disponibilidad de un Asiento (Priority: P1)

**Goal**: El administrador puede ingresar el ID de un asiento y verificar si está disponible en el contexto de un
evento. La respuesta muestra el estado actual y el motivo si no está disponible.

**Independent Test**: En el panel de inventario del evento, ingresar el ID de un asiento DISPONIBLE muestra
"Disponible: Sí". Ingresar un asiento RESERVADO muestra "Disponible: No" con el tiempo de expiración del hold.

- [ ] T004 [US1] Implementar `useVerificarDisponibilidad.ts` con `useQuery`: clave dinámica por `asientoId`,
  `staleTime: 0` para siempre consultar estado fresco
- [ ] T005 [US1] Implementar `VerificarDisponibilidadPanel.tsx`: input de ID de asiento, botón "Verificar",
  resultado con `disponible` en badge verde/rojo, mensaje descriptivo
- [ ] T006 [US1] Integrar `VerificarDisponibilidadPanel` en `InventarioEventoPage.tsx`

**Checkpoint**: Verificación de disponibilidad funcional

---

## Phase 3: User Story 2 + 3 — Mapa de Inventario y Holds Activos (Priority: P1)

**Goal**: El administrador puede ver el mapa completo de asientos del evento con su estado actual. Los asientos con
hold muestran un countdown del tiempo restante hasta la liberación automática.

**Independent Test**: Navegar a `/admin/eventos/:id/inventario` muestra el `InventarioResumen` con conteos y el
`InventarioMapaGrid` con asientos coloreados por estado. Las celdas con estado RESERVADO muestran `HoldCountdown`
activo.

- [ ] T007 [US2+US3] Implementar `useInventarioEvento.ts` con `useQuery`: `refetchInterval: 30_000` para
  actualización automática cada 30 segundos durante el evento
- [ ] T008 [US2+US3] Implementar `HoldCountdown.tsx`: calcula tiempo restante desde `expiraEn` (ISO 8601) hasta
  `now()`, actualiza cada segundo, muestra `MM:SS` en color naranja
- [ ] T009 [US2+US3] Implementar `AsientoInventarioCelda.tsx`: celda coloreada según estado (verde=DISPONIBLE,
  naranja=RESERVADO, rojo=OCUPADO/VENDIDO, gris=BLOQUEADO), muestra `HoldCountdown` si tiene `expiraEn`
- [ ] T010 [US2+US3] Implementar `InventarioMapaGrid.tsx`: grid de asientos usando virtualización; agrupa por zona
  con encabezado de nombre de zona
- [ ] T011 [US2+US3] Implementar `InventarioResumen.tsx`: tarjetas con conteos de disponibles, reservados, ocupados
  y bloqueados; muestra porcentaje de ocupación
- [ ] T012 [US2+US3] Implementar `InventarioEventoPage.tsx`: `InventarioResumen` en la parte superior,
  `VerificarDisponibilidadPanel` y `InventarioMapaGrid` en el cuerpo

**Checkpoint**: Mapa de inventario en tiempo real funcional con holds visibles

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T013 Agregar leyenda de colores al `InventarioMapaGrid` para que el administrador pueda identificar estados
- [ ] T014 Mostrar timestamp de "última actualización" junto al botón de recarga manual
- [ ] T015 Verificar que `HoldCountdown` se detiene y muestra "Expirado" cuando `expiraEn` ya pasó (el scheduler
  del backend limpia el hold, pero puede haber un lag de hasta 1 minuto)
- [ ] T016 Usar el mismo componente de virtualización del feature 002 (`MapaAsientosGrid`) o extenderlo — no crear
  una segunda implementación de grid

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 002 y 012 completados
- **US1 (Phase 2)**: Depende de Foundational
- **US2+US3 (Phase 3)**: Depende de Foundational — puede ejecutarse en paralelo con US1
- **Polish (Phase 4)**: Depende de todas las fases

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **`refetchInterval`**: el refresco automático cada 30s es un balance entre frescura de datos y carga al servidor;
  ajustar según el volumen de eventos simultáneos
- **Reutilización de grid**: el `MapaAsientosGrid` del feature 002 y el `InventarioMapaGrid` de este feature sirven
  propósitos distintos (edición vs visualización) — pueden compartir el mismo componente base de celda con props
  diferentes en lugar de duplicar el layout
- **Hold expirado visible**: cuando un hold expira, el backend actualiza el estado en el siguiente ciclo del scheduler
  (hasta 1 min de lag) — mostrar "Expirado" en el countdown cuando `expiraEn < now()` sin esperar la actualización
  del servidor
- **EstadoAsiento compartido**: no redefinir el enum — importar desde `asiento.types.ts` del feature 002
