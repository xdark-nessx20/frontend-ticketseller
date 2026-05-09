# Implementation Plan: Checkout y Pago – Frontend

**Date**: 09/05/2026  
**Specs**:

- [004-CheckoutYPago.md](/docs/plan/004-CheckoutYPago.md)
- [005-CheckoutYPago.md](/docs/spec/005-CheckoutYPago.md)

## Summary

El **Comprador** debe poder explorar eventos disponibles, seleccionar asientos, reservarlos con un TTL de 15 minutos, completar el pago con datos de tarjeta o transferencia y recibir confirmación con sus tickets. Este módulo es el flujo de compra principal del sistema — el más complejo del frontend porque involucra estado transitorio (carrito, TTL), integración de pasarela y un mapa interactivo de selección de asientos.

El flujo tiene cuatro pasos: explorar eventos → seleccionar asientos en el mapa → checkout con resumen → pago. El estado del carrito (asientos seleccionados, código promo aplicado, venta activa) es persistido en Zustand para sobrevivir navegación entre pasos. Un temporizador visible muestra el tiempo restante de la reserva activa (TTL 15 min); al expirar, la app limpia el carrito y notifica al usuario.

Este módulo depende del plan 001 (recintos y zonas), plan 002 (catálogo de asientos), y plan 012 (eventos disponibles con precios configurados).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: React 18+ (Vite)  
**Styling**: Tailwind CSS 3.x  
**Server State**: TanStack Query v5  
**Client State**: Zustand  
**HTTP Client**: Axios  
**Router**: React Router v6  
**Testing**: Vitest + React Testing Library + MSW  
**Target Platform**: Customer Portal SPA  
**Performance Goals**: Proceso de reserva completa en menos de 1s. Confirmación de pago en menos de 5s. Mapa interactivo cargado antes de 2s.  
**Constraints**: TTL de reserva 15 minutos — el timer debe ser preciso. Un asiento reservado por otro usuario no puede seleccionarse. El pago solo es posible sobre una venta en estado RESERVADA.  
**Scale/Scope**: Feature central del portal del comprador — bloquea post-venta y devoluciones.

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
│   └── checkout.types.ts         ← VentaResponse, TicketResponse, ReservarRequest, PagarRequest, etc.
├── services/
│   └── checkoutService.ts        ← reservar, pagar, consultarVenta
├── stores/
│   └── cartStore.ts              ← Zustand: asientos seleccionados, ventaActiva, TTL, código promo
├── hooks/
│   └── checkout/
│       ├── useEventos.ts
│       ├── useEvento.ts
│       ├── usePreciosEvento.ts
│       ├── useReservarAsientos.ts
│       ├── useProcesarPago.ts
│       ├── useConsultarVenta.ts
│       └── useReservationTimer.ts
├── pages/
│   └── checkout/
│       ├── EventBrowsePage.tsx
│       ├── EventDetailPage.tsx
│       ├── SeatSelectionPage.tsx
│       ├── CheckoutPage.tsx
│       └── OrderConfirmationPage.tsx
└── components/
    └── checkout/
        ├── EventCard.tsx
        ├── EventGrid.tsx
        ├── EventFilters.tsx
        ├── InteractiveSeatMap.tsx
        ├── SeatLegend.tsx
        ├── CartSummary.tsx
        ├── CartItem.tsx
        ├── ReservationTimer.tsx
        ├── PromoCodeInput.tsx
        ├── PaymentForm.tsx
        └── OrderSummary.tsx

src/__tests__/
└── checkout/
    ├── EventCard.test.tsx
    ├── InteractiveSeatMap.test.tsx
    ├── ReservationTimer.test.tsx
    ├── PaymentForm.test.tsx
    ├── cartStore.test.ts
    └── useReservarAsientos.test.ts
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Depende de plan 012 completado (eventos con precios configurados deben existir).

- [ ] T001 Definir interfaces en `checkout.types.ts`:
  - `VentaResponse` (id, compradorId, eventoId, estado, fechaCreacion, fechaExpiracion, total, tickets)
  - `TicketResponse` (id, ventaId, asientoId, numeroTicket, codigoQr, estado, tipoCategoria, precio)
  - `ReservarAsientosRequest` (eventoId, compradorId, asientoIds)
  - `ProcesarPagoRequest` (montoPagado, metodoPago, idExternoPasarela)
  - Enums: `EstadoVenta`, `MetodoPago`, `EstadoTicket`
- [ ] T002 Implementar `checkoutService.ts`:
  - `reservarAsientos(data)` — POST `/api/v1/checkout/reservar`
  - `procesarPago(ventaId, data)` — POST `/api/v1/checkout/{ventaId}/pagar`
  - `consultarVenta(ventaId)` — GET `/api/v1/checkout/{ventaId}`
- [ ] T003 Implementar `cartStore.ts` con Zustand:
  - Estado: `selectedSeatIds: string[]`, `ventaActiva: VentaResponse | null`, `promoCode: string`, `compradorId: string`
  - Acciones: `toggleSeat`, `clearCart`, `setVentaActiva`, `setPromoCode`, `setCompradorId`
- [ ] T004 Definir rutas: `/eventos`, `/eventos/:eventoId`, `/eventos/:eventoId/asientos`, `/checkout`, `/checkout/confirmacion/:ventaId`

**Checkpoint**: Tipos, servicio y store compilando; rutas registradas

---

## Phase 2: User Story 2 — Carrito con TTL (Priority: implementar antes que US1)

**Goal**: Los asientos seleccionados se reservan con TTL de 15 minutos y se libera si no se completa el pago.

**Independent Test**: Reservar asientos muestra un timer regresivo visible. Al llegar a 0:00 el carrito se limpia, se muestra un mensaje "Tu reserva expiró" y el mapa actualiza la disponibilidad.

### Tests para User Story 2

- [ ] T005 [P] [US2] Test: `ReservationTimer` muestra "14:59" un segundo después de la reserva — `ReservationTimer.test.tsx`
- [ ] T006 [P] [US2] Test: `ReservationTimer` llama a `clearCart` y muestra mensaje al llegar a 0 — `ReservationTimer.test.tsx`
- [ ] T007 [P] [US2] Test: `cartStore` `setVentaActiva` guarda `fechaExpiracion` correctamente — `cartStore.test.ts`

### Implementación de User Story 2

- [ ] T008 [US2] Implementar `useReservationTimer.ts`: deriva los segundos restantes de `ventaActiva.fechaExpiracion`, usa `setInterval` con cleanup, llama a `cartStore.clearCart()` al expirar
- [ ] T009 [US2] Implementar `ReservationTimer.tsx`: muestra timer en formato MM:SS, cambia a rojo cuando faltan menos de 2 minutos
- [ ] T010 [US2] Implementar `useReservarAsientos.ts` con `useMutation`: llama a `checkoutService.reservarAsientos`, en `onSuccess` llama a `setVentaActiva(data)`
- [ ] T011 [US2] Integrar `ReservationTimer` en el layout de las páginas `SeatSelectionPage` y `CheckoutPage`

**Checkpoint**: TTL visual funcional y liberación al expirar

---

## Phase 3: User Story 1 — Flujo de Compra Completo (Priority: P1)

**Goal**: El comprador puede explorar eventos, seleccionar asientos, reservar, pagar y recibir confirmación.

**Independent Test**: Navegar a `/eventos`, hacer clic en un evento, seleccionar 2 asientos disponibles, ir a checkout, ingresar datos de pago válidos y confirmar — llegar a `/checkout/confirmacion/:ventaId` con los tickets y sus códigos QR.

### Tests para User Story 1

- [ ] T012 [P] [US1] Test: `EventCard` renderiza nombre, fecha, venue y precio mínimo — `EventCard.test.tsx`
- [ ] T013 [P] [US1] Test: `InteractiveSeatMap` no permite seleccionar asientos no disponibles — `InteractiveSeatMap.test.tsx`
- [ ] T014 [P] [US1] Test: `InteractiveSeatMap` limita la selección al máximo de entradas por compra — `InteractiveSeatMap.test.tsx`
- [ ] T015 [P] [US1] Test: `PaymentForm` valida todos los campos requeridos antes de enviar — `PaymentForm.test.tsx`
- [ ] T016 [P] [US1] Test: `useProcesarPago` muestra error si la reserva está expirada (409) — `useReservarAsientos.test.ts`
- [ ] T017 [P] [US1] Test: `CartSummary` calcula el total correctamente con descuento aplicado — test

### Implementación de User Story 1

- [ ] T018 [US1] Implementar `useEventos.ts` (lista con filtros), `useEvento.ts` (detalle), `usePreciosEvento.ts`
- [ ] T019 [US1] Implementar `EventCard.tsx`: imagen, nombre evento, fecha, recinto, precio desde X
- [ ] T020 [US1] Implementar `EventFilters.tsx`: filtros por nombre, tipo, fecha
- [ ] T021 [US1] Implementar `EventGrid.tsx`: grid responsive de `EventCard` con paginación
- [ ] T022 [US1] Implementar `EventBrowsePage.tsx` y `EventDetailPage.tsx`
- [ ] T023 [US1] Implementar `InteractiveSeatMap.tsx`: reutiliza lógica de grilla del plan 002 pero en modo compra — celdas DISPONIBLE son seleccionables, BLOQUEADO/RESERVADO/VENDIDO son disabled con opacidad
- [ ] T024 [US1] Implementar `SeatLegend.tsx`: leyenda de colores disponible/reservado/vendido/zona
- [ ] T025 [US1] Implementar `SeatSelectionPage.tsx`: mapa + panel derecho con `CartSummary` y botón "Reservar"
- [ ] T026 [US1] Implementar `CartSummary.tsx` y `CartItem.tsx`: lista de asientos seleccionados, subtotales, total
- [ ] T027 [US1] Implementar `PromoCodeInput.tsx`: input de código promo con botón "Aplicar", muestra descuento aplicado o error
- [ ] T028 [US1] Implementar `useProcesarPago.ts` con `useMutation`: invalida `['venta', ventaId]` en `onSuccess`
- [ ] T029 [US1] Implementar `PaymentForm.tsx`: campos número tarjeta, CVV, expiración, titular — o selector de método TRANSFERENCIA; validación Zod
- [ ] T030 [US1] Implementar `CheckoutPage.tsx`: `CartSummary` + `PromoCodeInput` + `PaymentForm` + `ReservationTimer`
- [ ] T031 [US1] Implementar `OrderConfirmationPage.tsx`: usa `useConsultarVenta`, muestra lista de tickets con código QR (imagen base64), botón "Descargar PDF" (// TODO: integrar librería PDF)

**Checkpoint**: Flujo completo de compra funcional end-to-end

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T032 Proteger rutas de checkout con guard que verifique `compradorId` en el store
- [ ] T033 Persistir `cartStore` en sessionStorage para resistir recargas accidentales
- [ ] T034 Manejo de error de red en `PaymentForm`: deshabilitar botón mientras procesa, mostrar spinner
- [ ] T035 Accesibilidad del mapa interactivo: `role="grid"`, `role="gridcell"`, `aria-disabled` en no disponibles
- [ ] T036 Verificar tipos contra OpenAPI del backend, especialmente `VentaResponse` y `TicketResponse`

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de plan 012 (eventos con precios)
- **US2/Timer (Phase 2)**: Depende de Foundational — implementar antes que US1
- **US1/Flujo completo (Phase 3)**: Depende de US2
- **Polish (Phase 4)**: Depende de todo

---

## Notes

- **compradorId**: el backend usa header `X-Comprador-Id` para identificar al comprador — almacenarlo en `cartStore` y añadirlo al cliente Axios como header por defecto al autenticar
- **QR**: el backend retorna `codigoQr` como string base64 — renderizar con `<img src="data:image/png;base64,..." />`
- **Pasarela real**: el formulario de pago envía `idExternoPasarela` y `montoPagado` al backend — en sandbox, estos pueden ser valores fijos; en producción vendrán del widget de Wompi
- **Concurrencia**: si un asiento es reservado por otro usuario mientras el comprador lo tiene seleccionado (pero aún no reservado), el error del backend (409) debe reflejarse mostrando el asiento como no disponible en el mapa

