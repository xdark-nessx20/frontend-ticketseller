# Implementation Plan: Checkout y Pago – Frontend

**Date**: 09/05/2026

## Summary

El **Comprador** debe poder seleccionar asientos de un evento, reservarlos temporalmente mientras completa el pago
(TTL de 15 minutos), procesar la transacción con tarjeta o transferencia y recibir sus tickets por email con código
QR único. Este es el flujo de compra principal de la plataforma.

La arquitectura separa el flujo en dos páginas principales: selección de asientos (con mapa o lista por zona) y
formulario de pago. El estado del carrito se persiste en Zustand con TTL sincronizado con el backend. Las mutaciones
son secuenciales: primero reservar, luego pagar.

Depende del feature 012 (eventos con precios configurados) y del feature 002 (asientos disponibles).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (carrito, countdown del TTL)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Buyer Portal SPA
**Performance Goals**: Reserva confirmada en menos de 2s. Proceso de pago completado en menos de 5s para el 95% de
transacciones.
**Constraints**: Solo se pueden comprar asientos en estado DISPONIBLE. El TTL de reserva es 15 minutos — el carrito
muestra un countdown. Pagos duplicados deben prevenirse. No se puede pagar sobre una venta EXPIRADA.
**Scale/Scope**: Feature de mayor complejidad — introduce integración con pasarela de pagos. Depende del feature 012.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoVenta = 'RESERVADA' | 'COMPLETADA' | 'EXPIRADA' | 'CANCELADA';
type EstadoTicket = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO' | 'CANCELADO' | 'REEMBOLSO_PENDIENTE' | 'REEMBOLSADO' | 'ANULADO';
type MetodoPago = 'TARJETA' | 'TRANSFERENCIA';
```

### Interfaces de Respuesta

```typescript
interface VentaResponse {
  id: string;
  compradorId: string;
  eventoId: string;
  estado: EstadoVenta;
  fechaCreacion: string;          // ISO 8601
  fechaExpiracion: string;        // ISO 8601
  total: number;
}

interface TicketResponse {
  id: string;
  ventaId: string;
  eventoId: string;
  zonaId: string;
  compuertaId: string;
  codigoQR: string;
  estado: EstadoTicket;
  precio: number;
  esCortesia: boolean;
}

interface VentaDetalleResponse {
  venta: VentaResponse;
  tickets: TicketResponse[];
}
```

### Interfaces de Request

```typescript
interface ReservarAsientosRequest {
  zonaId: string;
  cantidad: number;
  // alternativa: ticketIds específicos
  asientoIds?: string[];
}

interface ProcesarPagoRequest {
  metodoPago: MetodoPago;
  // datos del medio de pago — estructura depende del proveedor de pasarela
  numeroTarjeta?: string;
  mesExpiracion?: string;
  anioExpiracion?: string;
  cvv?: string;
  titular?: string;
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
│   └── checkout.types.ts
├── services/
│   └── checkoutService.ts
├── stores/
│   └── carritoStore.ts
├── hooks/
│   └── checkout/
│       ├── useReservarAsientos.ts
│       ├── useProcesarPago.ts
│       ├── useVenta.ts
│       └── useCarritoCountdown.ts
├── pages/
│   └── checkout/
│       ├── EventoAsientosPage.tsx
│       ├── CheckoutPage.tsx
│       └── ConfirmacionPage.tsx
└── components/
    └── checkout/
        ├── ZonaSelectorPanel.tsx
        ├── AsientoSelectorGrid.tsx
        ├── ResumenCarrito.tsx
        ├── CarritoCountdown.tsx
        ├── FormularioPago.tsx
        ├── TicketConfirmado.tsx
        └── VentaEstadoBadge.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript, servicio Axios y store del carrito — base que todas las user stories necesitan.

**⚠️ CRITICAL**: Depende del feature 012 completado — el evento debe tener precios por zona configurados.

- [ ] T001 Definir interfaces en `checkout.types.ts`:
    - `VentaResponse`, `TicketResponse`, `VentaDetalleResponse`
    - `ReservarAsientosRequest`, `ProcesarPagoRequest`
    - Enums: `EstadoVenta`, `EstadoTicket`, `MetodoPago`
- [ ] T002 Implementar `checkoutService.ts`:
    - `reservarAsientos(data)` → `POST /api/checkout/reservar`
    - `procesarPago(ventaId, data)` → `POST /api/checkout/{ventaId}/pagar`
    - `getVenta(ventaId)` → `GET /api/checkout/{ventaId}`
- [ ] T003 Implementar `carritoStore.ts` con Zustand:
    - Estado: `ventaId`, `fechaExpiracion`, `asientosSeleccionados`, `isExpired`
    - Acciones: `setReserva`, `clearCarrito`, `marcarExpirado`
- [ ] T004 Definir rutas: `/eventos/:id/asientos`, `/checkout/:ventaId`, `/checkout/:ventaId/confirmacion`

**Checkpoint**: Tipos definidos, servicio compilando, store del carrito funcionando

---

## Phase 2: User Story 2 — Reserva Temporal y Countdown (Priority: P2, se implementa primero)

**Goal**: Al seleccionar asientos e iniciar el checkout, el sistema reserva los asientos por 15 minutos. Si el
comprador no completa el pago, los asientos se liberan automáticamente.

**Independent Test**: Seleccionar 2 asientos y hacer clic en "Reservar" crea la reserva y muestra el countdown de
15 minutos. Pasado el tiempo, el contador llega a 0:00 y se muestra aviso de expiración.

- [ ] T005 [US2] Implementar `useReservarAsientos.ts` con `useMutation`: en `onSuccess` guarda la reserva en
  `carritoStore` y navega a `/checkout/:ventaId`
- [ ] T006 [US2] Implementar `useCarritoCountdown.ts`: hook que calcula el tiempo restante hasta `fechaExpiracion`,
  actualiza cada segundo con `setInterval`, llama a `carritoStore.marcarExpirado()` al llegar a 0
- [ ] T007 [US2] Implementar `CarritoCountdown.tsx`: muestra `MM:SS` restantes, cambia a color rojo cuando quedan
  menos de 2 minutos, muestra banner de expiración al llegar a 0
- [ ] T008 [US2] Implementar `ZonaSelectorPanel.tsx`: muestra las zonas del evento con precio y disponibilidad,
  permite seleccionar cantidad de asientos por zona
- [ ] T009 [US2] Implementar `ResumenCarrito.tsx`: lista los asientos seleccionados, muestra subtotal y total
- [ ] T010 [US2] Implementar `EventoAsientosPage.tsx`: usa `ZonaSelectorPanel`, `ResumenCarrito` y botón
  "Reservar" que llama a `useReservarAsientos`

**Checkpoint**: Reserva temporal funcional con countdown sincronizado

---

## Phase 3: User Story 1 — Comprar Ticket con Tarjeta o Transferencia (Priority: P1)

**Goal**: El comprador puede completar el pago de una reserva activa. Si el pago es exitoso, recibe los tickets con
QR. Si es rechazado, la reserva permanece activa y puede reintentar.

**Independent Test**: Navegar a `/checkout/:ventaId` con reserva activa muestra el formulario de pago con el resumen.
Completar con datos válidos muestra la pantalla de confirmación con los tickets. Con datos rechazados muestra error
y mantiene la reserva.

- [ ] T011 [US1] Implementar `useProcesarPago.ts` con `useMutation`: en `onSuccess` navega a
  `/checkout/:ventaId/confirmacion`; en `onError` maneja 402 (fondos insuficientes) y 503 (error de pasarela)
  con mensajes específicos
- [ ] T012 [US1] Implementar `useVenta.ts` con `useQuery`: clave `['venta', ventaId]`, llama a
  `checkoutService.getVenta(ventaId)`
- [ ] T013 [US1] Implementar `FormularioPago.tsx`: select de método de pago, campos según método seleccionado,
  validación Zod, muestra error del backend si existe
- [ ] T014 [US1] Implementar `CheckoutPage.tsx`: usa `useVenta`, `CarritoCountdown`, `ResumenCarrito` y
  `FormularioPago`; redirige a la página de asientos si la venta está EXPIRADA
- [ ] T015 [US1] Implementar `TicketConfirmado.tsx`: muestra datos del ticket (zona, asiento, QR en imagen),
  mensaje de confirmación por email
- [ ] T016 [US1] Implementar `ConfirmacionPage.tsx`: usa `useVenta` para mostrar la venta COMPLETADA con todos
  los tickets usando `TicketConfirmado`

**Checkpoint**: Flujo completo de compra funcional end-to-end

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T017 Deshabilitar el botón "Pagar" mientras `useProcesarPago.isPending` para prevenir pagos duplicados
- [ ] T018 Limpiar `carritoStore` al completar exitosamente la compra o al detectar expiración
- [ ] T019 Manejar el caso donde el usuario navega directamente a `/checkout/:ventaId` sin pasar por la selección
  de asientos (cargar la venta desde el backend y mostrar su estado)
- [ ] T020 Agregar pantalla de error dedicada para venta EXPIRADA con botón de retorno al evento
- [ ] T021 Verificar alineación de `MetodoPago` con los valores aceptados por la pasarela configurada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende del feature 012 completado
- **US2 (Phase 2)**: Depende de Foundational — implementar antes que US1 porque el TTL es prerequisito del pago
- **US1 (Phase 3)**: Depende de US2 — el flujo de pago opera sobre una venta ya reservada
- **Polish (Phase 4)**: Depende de US1 y US2

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que páginas y componentes
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **CarritoStore vs servidor**: el store solo persiste `ventaId` y `fechaExpiracion`; los datos completos de la venta
  siempre se obtienen del backend vía `useVenta` — nunca duplicar en el store
- **Countdown preciso**: usar `fechaExpiracion` del servidor (no calcular 15 min desde el cliente) para evitar drift
  por diferencias de reloj
- **QR en imagen**: el campo `codigoQR` del backend es un string Base64 de la imagen QR — renderizar con `<img
  src={`data:image/png;base64,${ticket.codigoQR}`} />`
- **Error 402 vs 503**: distinguir fondos insuficientes (402, reintentar con otro método) de error de pasarela
  (503, reintentar más tarde) en los mensajes de usuario
- **Acceso a rutas de checkout**: rutas `/checkout/*` deben requerir autenticación de comprador
