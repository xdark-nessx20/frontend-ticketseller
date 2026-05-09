# Implementation Plan: Liquidación y Dispersión de Fondos – Frontend

**Date**: 09/05/2026

## Summary

El panel de administración debe permitir al **Administrador** configurar el modelo de negocio de
un recinto (tarifa plana o reparto de ingresos) y consultar los datos de liquidación al cierre de
un evento: snapshot consolidado de tickets por condición y recaudo incremental en tiempo real.
Estos endpoints son también consumidos por el Módulo 3 para ejecutar la dispersión financiera.

Este módulo es principalmente de consulta. La única operación de escritura es la configuración del
modelo de negocio del recinto. Depende del feature 002 (zonas), feature 004 (tickets/ventas) y
feature 012 (eventos en estado FINALIZADO).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (no requerido — datos del servidor son la fuente de verdad)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Snapshot carga en menos de 3s. Recaudo incremental en menos de 1s.
**Constraints**: Snapshot solo disponible si el evento está en estado FINALIZADO (HTTP 409 si no).
Modelo de negocio obligatorio para que el Módulo 3 pueda liquidar.
**Scale/Scope**: Feature de consulta con una operación de escritura. Depende de features 002, 004
y 012 completados.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type ModeloNegocio = 'TARIFA_PLANA' | 'REPARTO_INGRESOS';
```

### Interfaces de Respuesta

```typescript
interface ModeloNegocioResponse {
  recintoId: string;
  modelo: ModeloNegocio;
  tipoRecinto: string;             // CategoriaRecinto — importar desde recinto.types.ts (feature 001)
  montoFijo: number | null;        // presente solo si modelo = TARIFA_PLANA
}

interface CondicionTicketResponse {
  condicion: string;               // 'VALIDADO' | 'VENDIDO_SIN_ASISTENCIA' | 'CORTESIA' | 'CANCELADO'
  cantidad: number;
  valorTotal: number;
}

interface SnapshotLiquidacionResponse {
  eventoId: string;
  condiciones: CondicionTicketResponse[];
  timestampGeneracion: string;     // ISO 8601
}

interface RecaudoIncrementalResponse {
  eventoId: string;
  recaudoRegular: number;
  recaudoCortesia: number;
  cancelaciones: number;
  recaudoNeto: number;
  timestamp: string;               // ISO 8601
}
```

### Interfaces de Request

```typescript
interface ConfigurarModeloNegocioRequest {
  modelo: ModeloNegocio;
  montoFijo?: number;              // requerido si modelo = TARIFA_PLANA
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
│   └── liquidacion.types.ts
├── services/
│   └── liquidacionService.ts
├── hooks/
│   └── liquidacion/
│       ├── useModeloNegocio.ts
│       ├── useConfigurarModeloNegocio.ts
│       ├── useSnapshotLiquidacion.ts
│       └── useRecaudoIncremental.ts
├── pages/
│   └── liquidacion/
│       └── LiquidacionEventoPage.tsx
└── components/
    └── liquidacion/
        ├── ModeloNegocioCard.tsx
        ├── ConfigurarModeloNegocioModal.tsx
        ├── SnapshotLiquidacionTable.tsx
        ├── RecaudoIncrementalResumen.tsx
        └── CondicionTicketBadge.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base de todas las consultas de liquidación.

**⚠️ CRITICAL**: Depende de los features 002, 004 y 012 completados. El evento debe estar en estado
`FINALIZADO` para que el snapshot esté disponible.

- [ ] T001 Definir interfaces en `liquidacion.types.ts`:
    - `ModeloNegocioResponse`, `CondicionTicketResponse`, `SnapshotLiquidacionResponse`,
      `RecaudoIncrementalResponse`
    - `ConfigurarModeloNegocioRequest`
    - Enum: `ModeloNegocio`
- [ ] T002 Implementar `liquidacionService.ts`:
    - `getModeloNegocio(recintoId)` → `GET /api/recintos/{id}/modelo-negocio`
    - `configurarModeloNegocio(recintoId, data)` → `PATCH /api/recintos/{id}/modelo-negocio`
    - `getSnapshot(eventoId)` → `GET /api/eventos/{id}/snapshot`
    - `getRecaudoIncremental(eventoId)` → `GET /api/eventos/{id}/recaudo`
- [ ] T003 Definir ruta: `/admin/eventos/:eventoId/liquidacion`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 2 — Consulta y Configuración del Modelo de Negocio (Priority: P1)

**Goal**: El administrador puede ver el modelo de negocio configurado para el recinto del evento y
modificarlo si es necesario. El modelo es prerrequisito para que el Módulo 3 ejecute la liquidación.

**Independent Test**: Navegar al panel de liquidación de un recinto muestra su modelo actual. Si no
tiene modelo configurado, muestra estado vacío con botón "Configurar". Hacer clic abre el modal.
Seleccionar TARIFA_PLANA habilita el input de monto fijo.

- [ ] T004 [US2] Implementar `useModeloNegocio.ts` con `useQuery`
- [ ] T005 [US2] Implementar `useConfigurarModeloNegocio.ts` con `useMutation`: invalida el query
  de modelo en `onSuccess`
- [ ] T006 [US2] Implementar `ConfigurarModeloNegocioModal.tsx`: select modelo
  (TARIFA_PLANA/REPARTO_INGRESOS), input montoFijo visible y obligatorio solo si modelo es
  TARIFA_PLANA (validación `min(0.01)`), muestra tipoRecinto del recinto como contexto
- [ ] T007 [US2] Implementar `ModeloNegocioCard.tsx`: muestra modelo actual, tipoRecinto y montoFijo
  si aplica; estado vacío con CTA "Configurar" si el backend retorna 422

**Checkpoint**: Configuración del modelo de negocio funcional

---

## Phase 3: User Story 1 — Snapshot al Cierre del Evento (Priority: P1)

**Goal**: El administrador puede consultar el consolidado de tickets agrupados por condición de
liquidación una vez que el evento ha finalizado.

**Independent Test**: Navegar a `/admin/eventos/:id/liquidacion` con un evento FINALIZADO muestra
la tabla de condiciones con conteos y valores. Un evento ACTIVO o EN_PROGRESO muestra aviso
"El snapshot estará disponible tras el cierre del evento".

- [ ] T008 [US1] Implementar `useSnapshotLiquidacion.ts` con `useQuery`: maneja el error 409 del
  backend (evento no finalizado) retornando estado de no-disponible sin lanzar error
- [ ] T009 [US1] Implementar `CondicionTicketBadge.tsx`: badge coloreado por condición de ticket
  (verde=VALIDADO, azul=VENDIDO_SIN_ASISTENCIA, gris=CORTESIA, rojo=CANCELADO)
- [ ] T010 [US1] Implementar `SnapshotLiquidacionTable.tsx`: columnas condición (badge), cantidad y
  valor total; fila de totales en el pie; muestra `timestampGeneracion` formateado
- [ ] T011 [US1] Integrar aviso de "evento no finalizado" cuando `useSnapshotLiquidacion` retorna
  no-disponible

**Checkpoint**: Snapshot de liquidación funcional con guard de estado de evento

---

## Phase 4: User Story 3 — Recaudo Incremental (Priority: P2)

**Goal**: El administrador puede ver el recaudo acumulado durante el evento en curso, diferenciando
regulares de cortesías y con cancelaciones descontadas.

**Independent Test**: Navegar a `/admin/eventos/:id/liquidacion` durante un evento en curso muestra
`RecaudoIncrementalResumen` con recaudoNeto. Al cancelar un ticket, el recaudo se actualiza en el
siguiente refresco.

- [ ] T012 [US3] Implementar `useRecaudoIncremental.ts` con `useQuery`
- [ ] T013 [US3] Implementar `RecaudoIncrementalResumen.tsx`: tarjetas con recaudoRegular,
  recaudoCortesia, cancelaciones (negativo) y recaudoNeto destacado; timestamp de última consulta

**Checkpoint**: Recaudo incremental funcional

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T014 Implementar `LiquidacionEventoPage.tsx`: `ModeloNegocioCard` en la parte superior,
  `RecaudoIncrementalResumen` y `SnapshotLiquidacionTable` en el cuerpo (snapshot deshabilitado
  si el evento no está finalizado)
- [ ] T015 Mostrar indicador visual cuando el modelo de negocio no está configurado — el Módulo 3
  no puede liquidar sin él
- [ ] T016 Verificar que `SnapshotLiquidacionTable` muestra todos los tickets (suma de todas las
  condiciones = total de tickets del evento)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 002, 004 y 012 completados
- **US2 (Phase 2)**: Depende de Foundational — implementar antes que US1 porque configura el
  modelo de negocio prerrequisito
- **US1 (Phase 3)**: Depende de US2 y de que el evento esté en estado FINALIZADO
- **US3 (Phase 4)**: Depende de Foundational — puede ejecutarse en paralelo con US1 y US2
- **Polish (Phase 5)**: Depende de todas las fases

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Guard de estado**: `useSnapshotLiquidacion` no debe lanzar error cuando el backend retorna
  409 (evento no finalizado) — traducir ese estado a un flag `disponible: false` para que el
  componente muestre el aviso apropiado sin romper la UI
- **Modelo de negocio obligatorio**: si `getModeloNegocio` retorna 422 (no configurado), mostrar
  `ModeloNegocioCard` en estado vacío con CTA prominente — sin modelo configurado el Módulo 3
  no puede ejecutar la dispersión
- **TARIFA_PLANA vs REPARTO_INGRESOS**: en REPARTO_INGRESOS el backend usa `tipoRecinto`
  (Estadio/Teatro) para calcular las comisiones — el frontend no necesita implementar ese cálculo,
  pero sí debe mostrar el tipoRecinto en la card para que el administrador lo verifique
