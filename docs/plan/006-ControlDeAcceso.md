# Implementation Plan: Control de Acceso – Frontend

**Date**: 09/05/2026  
**Specs**:

- [006-ControlDeAcceso.md](/docs/plan/006-ControlDeAcceso.md)

## Summary

El **Operador de Compuerta** debe poder validar la entrada de asistentes escaneando el código QR de su ticket o ingresando el número de ticket manualmente. La interfaz muestra en tiempo real si el acceso es exitoso, denegado o si es un reingreso, junto con los datos del asiento y la zona asociada.

Esta UI está optimizada para uso en dispositivos móviles y tablets por parte del personal en la entrada del evento. El flujo es simple: escanear → mostrar resultado. El store Zustand guarda la compuerta activa de la sesión y un historial local de las últimas validaciones para referencia rápida del operador.

Este módulo depende del plan 004 completado (los tickets existen) y del plan 001 (las compuertas están configuradas).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: React 18+ (Vite)  
**Styling**: Tailwind CSS 3.x — interfaz mobile-first  
**Server State**: TanStack Query v5  
**Client State**: Zustand  
**HTTP Client**: Axios  
**Router**: React Router v6  
**Testing**: Vitest + React Testing Library + MSW  
**Target Platform**: Mobile / Tablet (Customer-facing gate tool)  
**Performance Goals**: Validación de ticket responde en menos de 500ms.  
**Constraints**: El sistema no registra el acceso (solo lee estado) — el control de acceso es de solo lectura. La página funciona sin estado de autenticación propio — el operador selecciona su compuerta al inicio de turno.  
**Scale/Scope**: Feature operativo de acceso — depende de planes 001 y 004.

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
│   └── acceso.types.ts           ← TicketEstadoResponse, etc.
├── services/
│   └── accesoService.ts          ← GET /api/v1/tickets/{id}
├── stores/
│   └── accessStore.ts            ← Zustand: compuertaActiva, historial de sesión
├── hooks/
│   └── acceso/
│       ├── useValidarTicket.ts
│       └── useCompuertas.ts
├── pages/
│   └── acceso/
│       ├── GateSelectorPage.tsx
│       └── GateValidationPage.tsx
└── components/
    └── acceso/
        ├── QRScanner.tsx
        ├── ManualTicketInput.tsx
        ├── TicketValidationResult.tsx
        ├── AccessStatusBadge.tsx
        └── ValidationHistoryList.tsx

src/__tests__/
└── acceso/
    ├── TicketValidationResult.test.tsx
    ├── ManualTicketInput.test.tsx
    └── accessStore.test.ts
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `acceso.types.ts`:
  - `TicketEstadoResponse` (ticketId, numeroTicket, estado, zona, fila, columna, categoria, metadata)
  - `ValidationRecord` (ticketId, estado, zona, timestamp) — solo para el historial local
  - Enum: `EstadoAcceso` (EXITOSO, DENEGADO, REINGRESO)
- [ ] T002 Implementar `accesoService.ts`:
  - `validarTicket(ticketId)` — GET `/api/v1/tickets/{id}`
- [ ] T003 Implementar `accessStore.ts` con Zustand:
  - Estado: `compuertaActiva: CompuertaResponse | null`, `historial: ValidationRecord[]`
  - Acciones: `setCompuerta`, `addValidation`, `clearHistorial`
- [ ] T004 Definir rutas: `/acceso` (selector de compuerta), `/acceso/validar` (validación)

**Checkpoint**: Tipos, servicio y store compilando

---

## Phase 2: User Story 1 — Seleccionar Compuerta (Priority: P1)

**Goal**: El operador selecciona su compuerta al inicio de turno antes de empezar a validar tickets.

**Independent Test**: Navegar a `/acceso` muestra lista de compuertas del evento activo. Seleccionar "Puerta A - Zona Norte" y confirmar redirige a `/acceso/validar` con la compuerta activa visible.

### Tests para User Story 1

- [ ] T005 [P] [US1] Test: `GateSelectorPage` muestra lista de compuertas mockeadas — test
- [ ] T006 [P] [US1] Test: seleccionar compuerta y confirmar guarda en `accessStore` — `accessStore.test.ts`

### Implementación de User Story 1

- [ ] T007 [US1] Implementar `useCompuertas.ts`: reutilizar servicio del plan 001
- [ ] T008 [US1] Implementar `GateSelectorPage.tsx`: lista de compuertas (cards clickeables), botón confirmar que llama a `setCompuerta` y navega a `/acceso/validar`

**Checkpoint**: Selección de compuerta funcional

---

## Phase 3: User Story 2 — Validar Ticket (Priority: P1)

**Goal**: El operador valida tickets escaneando el QR o ingresando el número manualmente. La pantalla muestra resultado claro verde/rojo/amarillo.

**Independent Test**: Ingresar un ID de ticket válido y vendido muestra resultado verde "ACCESO EXITOSO" con nombre del asistente y zona. Un ticket ya USADO muestra amarillo "REINGRESO". Un ticket CANCELADO muestra rojo "ACCESO DENEGADO".

### Tests para User Story 2

- [ ] T009 [P] [US2] Test: `TicketValidationResult` renderiza verde para ticket VENDIDO — `TicketValidationResult.test.tsx`
- [ ] T010 [P] [US2] Test: `TicketValidationResult` renderiza rojo para ticket CANCELADO — `TicketValidationResult.test.tsx`
- [ ] T011 [P] [US2] Test: `ManualTicketInput` llama a `validarTicket` con el ID ingresado — `ManualTicketInput.test.tsx`
- [ ] T012 [P] [US2] Test: `useValidarTicket` añade la validación al historial del store — `accessStore.test.ts`

### Implementación de User Story 2

- [ ] T013 [US2] Implementar `useValidarTicket.ts` con `useMutation`: llama a `accesoService.validarTicket`, en `onSuccess` llama a `addValidation(record)` en el store
- [ ] T014 [US2] Implementar `AccessStatusBadge.tsx`: icono + texto grande (EXITOSO verde, DENEGADO rojo, REINGRESO amarillo)
- [ ] T015 [US2] Implementar `TicketValidationResult.tsx`: panel full-screen o card grande con `AccessStatusBadge`, zona, fila/columna, duración visible 3 segundos antes de resetear
- [ ] T016 [US2] Implementar `QRScanner.tsx`: integra `html5-qrcode` o `@zxing/browser` para leer QR de la cámara; al detectar llama a `validarTicket` — // TODO: verificar compatibilidad con cámara de dispositivo
- [ ] T017 [US2] Implementar `ManualTicketInput.tsx`: input de texto + botón "Validar", submit con Enter
- [ ] T018 [US2] Implementar `ValidationHistoryList.tsx`: lista de las últimas 10 validaciones de la sesión con resultado y timestamp
- [ ] T019 [US2] Implementar `GateValidationPage.tsx`: layout mobile-first con tabs "Escanear QR" / "Manual", `TicketValidationResult` en overlay al validar, `ValidationHistoryList` debajo

**Checkpoint**: Validación de tickets funcional en ambos modos

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T020 Interfaz mobile-first: botones grandes, fuente grande, resultado visible desde distancia
- [ ] T021 Vibración del dispositivo al validar (`navigator.vibrate`) — éxito: vibración corta; error: vibración larga
- [ ] T022 Modo de alto contraste para exteriores con luz solar
- [ ] T023 Modo offline básico: si no hay red, mostrar mensaje claro "Sin conexión — validación no disponible"
- [ ] T024 Limpiar historial de sesión al cambiar de compuerta

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de planes 001 y 004 completados
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de US1 (compuerta activa requerida para validar)
- **Polish (Phase 4)**: Depende de todo

---

## Notes

- **QR Scanner**: la librería `html5-qrcode` requiere HTTPS en producción para acceder a la cámara — en desarrollo usar `ManualTicketInput` como fallback
- **Sin autenticación propia**: este módulo no tiene login — se asume que el operador accede desde una URL interna/tablet dedicada; agregar PIN simple si se requiere protección básica
- **Resultado temporal**: el componente `TicketValidationResult` se muestra 3 segundos (o hasta próximo scan) para dar tiempo al operador de ver el resultado con claridad
- **Historial local**: el historial de validaciones es solo en memoria (Zustand) — no persiste entre sesiones, no se envía al servidor

