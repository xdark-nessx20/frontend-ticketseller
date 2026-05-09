# Implementation Plan: Gestión y Conciliación de Transacciones – Frontend

**Date**: 09/05/2026

## Summary

El **Administrador** y el equipo de **Soporte** deben poder gestionar el ciclo de vida de ventas y pagos: cambiar
estados con justificación obligatoria, consultar el historial inmutable de cambios, conciliar pagos con la pasarela
de forma automática o manual, y resolver discrepancias detectadas. El módulo expone un panel operativo con listado
filtrado de transacciones y herramientas de resolución de discrepancias.

Este módulo opera sobre entidades ya creadas por el feature 004. Es de uso exclusivo del panel de administración.

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (filtros del listado de transacciones)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA
**Performance Goals**: Listado de hasta 10,000 transacciones filtradas en menos de 2s.
**Constraints**: Transiciones de estado inválidas son rechazadas. 100% de cambios con historial. Idempotencia en
confirmaciones de pasarela duplicadas.
**Scale/Scope**: Extiende el feature 004 — `Venta` y `TransaccionFinanciera` deben existir.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
// EstadoVenta se importa desde checkout.types.ts (feature 004)
type EstadoConciliacion = 'VERIFICADO' | 'EN_DISCREPANCIA' | 'CONFIRMADO' | 'EXPIRADO';
```

### Interfaces de Respuesta

```typescript
interface HistorialEstadoVentaResponse {
  id: string;
  ventaId: string;
  estadoAnterior: string;         // EstadoVenta
  estadoNuevo: string;            // EstadoVenta
  actor: string;
  timestamp: string;              // ISO 8601
  justificacion: string | null;
}

interface VentaResumenResponse {
  id: string;
  compradorId: string;
  eventoId: string;
  estado: string;                 // EstadoVenta
  total: number;
  fechaCreacion: string;          // ISO 8601
}

interface PagoResponse {
  id: string;
  ventaId: string;
  monto: number;
  estadoConciliacion: EstadoConciliacion;
  idExternoPasarela: string | null;
}

interface TransaccionFiltros {
  estado?: string;                // EstadoVenta
  eventoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}
```

### Interfaces de Request

```typescript
interface CambiarEstadoVentaRequest {
  estado: string;                 // EstadoVenta
  justificacion: string;          // obligatorio
}

interface VerificarPagoRequest {
  ventaId: string;
  montoEsperado: number;
  idExternoPasarela: string;
}

interface ConfirmarPagoRequest {
  idExternoPasarela: string;
  montoConfirmado: number;
}

interface ResolverDiscrepanciaRequest {
  accion: 'CONFIRMAR' | 'RECHAZAR';
  justificacion: string;
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
│   └── transacciones.types.ts
├── services/
│   └── transaccionesService.ts
├── stores/
│   └── transaccionesStore.ts
├── hooks/
│   └── transacciones/
│       ├── useTransacciones.ts
│       ├── useHistorialVenta.ts
│       ├── useCambiarEstadoVenta.ts
│       ├── useDiscrepancias.ts
│       └── useResolverDiscrepancia.ts
├── pages/
│   └── transacciones/
│       ├── TransaccionesPage.tsx
│       └── DiscrepanciasPage.tsx
└── components/
    └── transacciones/
        ├── TransaccionesTable.tsx
        ├── TransaccionFiltros.tsx
        ├── CambiarEstadoVentaModal.tsx
        ├── HistorialVentaPanel.tsx
        ├── DiscrepanciasTable.tsx
        └── ResolverDiscrepanciaModal.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript, servicio y store de filtros.

**⚠️ CRITICAL**: Depende del feature 004 completado.

- [ ] T001 Definir interfaces en `transacciones.types.ts`:
    - `HistorialEstadoVentaResponse`, `VentaResumenResponse`, `PagoResponse`, `TransaccionFiltros`
    - `CambiarEstadoVentaRequest`, `VerificarPagoRequest`, `ConfirmarPagoRequest`, `ResolverDiscrepanciaRequest`
    - Enum `EstadoConciliacion`
- [ ] T002 Implementar `transaccionesService.ts`:
    - `getTransacciones(filtros)` → `GET /api/admin/ventas`
    - `getHistorialVenta(ventaId)` → `GET /api/admin/ventas/{id}/historial`
    - `cambiarEstadoVenta(ventaId, data)` → `PATCH /api/admin/ventas/{id}/estado`
    - `getDiscrepancias()` → `GET /api/pagos` (filtrado por `EN_DISCREPANCIA`)
    - `resolverDiscrepancia(pagoId, data)` → endpoint de resolución
- [ ] T003 Implementar `transaccionesStore.ts` con Zustand: filtros activos (estado, eventoId, fechaDesde,
  fechaHasta, página), acciones `setFiltro`, `resetFiltros`, `setPage`
- [ ] T004 Definir rutas: `/admin/transacciones`, `/admin/transacciones/discrepancias`

**Checkpoint**: Tipos definidos, servicio compilando, store funcionando

---

## Phase 2: User Story 1 — Cambiar Estado de una Venta (Priority: P1)

**Goal**: El administrador puede cambiar el estado de una venta con justificación obligatoria. Las transiciones
inválidas son rechazadas con mensaje descriptivo.

**Independent Test**: Desde la tabla de transacciones, hacer clic en "Cambiar estado" de una venta RESERVADA.
Seleccionar CANCELADA e ingresar justificación. Confirmar actualiza el estado en la tabla. Intentar una transición
inválida muestra error del backend.

- [ ] T005 [US1] Implementar `useCambiarEstadoVenta.ts` con `useMutation`: invalida la query de transacciones en
  `onSuccess`
- [ ] T006 [US1] Implementar `CambiarEstadoVentaModal.tsx`: select de estado destino, campo justificación obligatorio
  (Zod `min(1)`), botones cancelar/confirmar; manejar error de transición inválida
- [ ] T007 [US1] Implementar `TransaccionesTable.tsx`: columnas ID, comprador, evento, estado (badge), total,
  fecha, acciones (cambiar estado, ver historial)
- [ ] T008 [US1] Implementar `TransaccionesPage.tsx`: usa `useTransacciones` con `transaccionesStore` para filtros,
  renderiza `TransaccionFiltros` + `TransaccionesTable`

**Checkpoint**: Gestión de estado y auditoría funcional

---

## Phase 3: User Story 2 — Consultar Historial y Filtrar Transacciones (Priority: P2)

**Goal**: El administrador puede ver el historial cronológico de una venta y filtrar el listado por estado, fecha
y evento.

**Independent Test**: Hacer clic en "Ver historial" de una venta muestra los cambios ordenados de más reciente a
más antiguo. Filtrar por estado "COMPLETADA" reduce el listado correctamente.

- [ ] T009 [US2] Implementar `useTransacciones.ts` y `useHistorialVenta.ts` con `useQuery`
- [ ] T010 [US2] Implementar `HistorialVentaPanel.tsx`: lista de `HistorialEstadoVentaResponse` con timestamp,
  actor, estados anterior/nuevo (badges), y justificación si existe
- [ ] T011 [US2] Implementar `TransaccionFiltros.tsx`: selects de estado y evento, date pickers para rango de fecha,
  botón "Limpiar filtros" — lee y escribe en `transaccionesStore`
- [ ] T012 [US2] Agregar botón "Ver historial" en `TransaccionesTable.tsx` que abre `HistorialVentaPanel` en un
  drawer lateral

**Checkpoint**: Consulta operativa transaccional funcional

---

## Phase 4: User Story 3 — Conciliación de Pagos (Priority: P1)

**Goal**: El equipo de soporte puede ver los pagos verificados y confirmados. Las discrepancias detectadas
automáticamente aparecen en el panel de discrepancias para resolución manual.

**Independent Test**: Navegar a `/admin/transacciones/discrepancias` muestra la tabla de pagos EN_DISCREPANCIA.
Hacer clic en "Resolver" abre el modal con opciones confirmar/rechazar.

- [ ] T013 [US3] Implementar `useDiscrepancias.ts` con `useQuery`
- [ ] T014 [US3] Implementar `useResolverDiscrepancia.ts` con `useMutation`
- [ ] T015 [US3] Implementar `DiscrepanciasTable.tsx`: columnas ventaId, monto, idPasarela, estado
  (`EN_DISCREPANCIA` badge), botón "Resolver"
- [ ] T016 [US3] Implementar `ResolverDiscrepanciaModal.tsx`: radio buttons CONFIRMAR/RECHAZAR, campo justificación
  obligatorio, muestra los datos del pago para contexto
- [ ] T017 [US3] Implementar `DiscrepanciasPage.tsx`: usa `useDiscrepancias`, renderiza `DiscrepanciasTable`

**Checkpoint**: Panel de discrepancias funcional con resolución manual

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T018 Implementar paginación en `TransaccionesTable` — el backend retorna `Page<VentaResumenResponse>`
- [ ] T019 Agregar indicador de conteo de discrepancias pendientes en el menú de navegación
- [ ] T020 Verificar que `HistorialVentaPanel` muestra correctamente la entrada inicial del historial (estado de
  creación sin cambio previo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende del feature 004 completado
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1
- **US3 (Phase 4)**: Depende de Foundational — puede ejecutarse en paralelo con US1 y US2
- **Polish (Phase 5)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **EstadoVenta compartido**: importar el enum desde `checkout.types.ts` del feature 004 — no duplicar
- **Paginación del listado**: con 10,000 registros potenciales, es crítico paginar — nunca cargar todos en memoria
- **Filtros en URL**: considerar sincronizar `transaccionesStore` con query params de la URL para que los filtros
  sean compartibles y sobrevivan a la recarga
- **Idempotencia**: el backend maneja duplicados de confirmación — el frontend no necesita lógica especial, pero sí
  debe deshabilitar el botón "Confirmar" mientras la mutation está pendiente
