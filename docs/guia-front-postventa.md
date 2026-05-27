# Guía de Integración Front-End: Módulo Post-Venta

Base URL: `http://localhost:8080`  
Formato: JSON en todas las peticiones y respuestas.

---

## Enums

```ts
type EstadoTicket =
  | 'VENDIDO'
  | 'CANCELADO'
  | 'REEMBOLSO_PENDIENTE'
  | 'ANULADO'
  | 'REEMBOLSADO';

type EstadoReembolso = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO';

type TipoReembolso = 'TOTAL' | 'PARCIAL';
```

Transiciones de estado válidas para `EstadoTicket`:

| Estado actual      | Puede pasar a                                          |
|--------------------|--------------------------------------------------------|
| `VENDIDO`          | `CANCELADO`, `ANULADO`, `REEMBOLSO_PENDIENTE`          |
| `CANCELADO`        | `REEMBOLSO_PENDIENTE`, `REEMBOLSADO`, `ANULADO`, `VENDIDO` |
| `REEMBOLSO_PENDIENTE` | `REEMBOLSADO`, `ANULADO`                            |
| `ANULADO` / `REEMBOLSADO` | Sin transiciones permitidas                    |

---

## Interfaces TypeScript

```ts
// GET /api/v1/compras/mis-compras  (ítem del array)
// PATCH /api/v1/admin/tickets/:id/estado  (respuesta)
interface TicketConReembolsoResponse {
  ticketId: string;           // UUID
  estadoTicket: EstadoTicket;
  estadoReembolso: EstadoReembolso | null;
  montoReembolso: number | null;
  reembolsoId: string | null; // UUID
}

// GET /api/v1/compras/mis-tickets  (ítem del array)
interface TicketResponse {
  id: string;             // UUID
  zonaNombre: string;
  compuertaNombre: string;
  estado: EstadoTicket;
  precio: number;
  codigoQr: string;
  esCortesia: boolean;
  numeroAsiento: string;
}

// POST /api/v1/tickets/:id/cancelar
// DELETE /api/v1/tickets/cancelar-varios
interface CancelacionResponse {
  ticketsCancelados: string[]; // UUID[]
  reembolsoId: string;         // UUID
  montoPendiente: number;
}

// POST /api/v1/admin/tickets/:id/reembolso  (respuesta)
interface ReembolsoResponse {
  reembolsoId: string;          // UUID
  estado: EstadoReembolso;
  monto: number;
  agenteId: string | null;      // UUID
  fechaCompletado: string;      // ISO 8601 (LocalDateTime)
}

// GET /api/v1/admin/reembolsos/cola  (ítem del array)
interface ReembolsoPendienteResponse {
  reembolsoId: string;      // UUID
  ticketId: string;         // UUID
  ventaId: string;          // UUID
  monto: number;
  tipo: TipoReembolso;
  estado: EstadoReembolso;
  fechaSolicitud: string;   // ISO 8601 (LocalDateTime)
  agenteId: string | null;  // UUID
}
```

---

## Endpoints

### 1. Mis Compras (comprador autenticado)

#### `GET /api/v1/compras/mis-compras`

Devuelve los tickets cancelados o con reembolso del comprador.

**Header requerido:**

```
X-Comprador-Id: <UUID del comprador>
```

**Respuesta `200 OK`:** `TicketConReembolsoResponse[]`

```json
[
  {
    "ticketId": "3fa85f64-...",
    "estadoTicket": "CANCELADO",
    "estadoReembolso": "PENDIENTE",
    "montoReembolso": 100.00,
    "reembolsoId": "7cb12a00-..."
  }
]
```

---

#### `GET /api/v1/compras/mis-tickets`

Devuelve todos los tickets del comprador (todos los estados).

**Header requerido:**

```
X-Comprador-Id: <UUID del comprador>
```

**Respuesta `200 OK`:** `TicketResponse[]`

```json
[
  {
    "id": "3fa85f64-...",
    "zonaNombre": "Tribuna Norte",
    "compuertaNombre": "Compuerta A",
    "estado": "VENDIDO",
    "precio": 120.00,
    "codigoQr": "base64string...",
    "esCortesia": false,
    "numeroAsiento": "A-12"
  }
]
```

---

### 2. Cancelaciones (comprador)

#### `DELETE /api/v1/tickets/{id}/cancelar`

Cancela un ticket individual. No requiere body.

**Path param:** `id` — UUID del ticket.

**Respuesta `200 OK`:** `CancelacionResponse`

```json
{
  "ticketsCancelados": ["3fa85f64-..."],
  "reembolsoId": "9bc00000-...",
  "montoPendiente": 120.00
}
```

**Errores:**

| Código | Cuándo                              |
|--------|-------------------------------------|
| `409`  | El ticket ya fue usado (ingresó al evento) |
| `422`  | La solicitud llegó fuera del plazo de cancelación |

---

#### `DELETE /api/v1/tickets/cancelar-varios`

Cancela un subconjunto de tickets de una misma venta.

**Body:**

```ts
interface CancelarTicketRequest {
  ticketIds: string[]; // UUID[], mínimo 1 elemento
}
```

```json
{
  "ticketIds": ["3fa85f64-...", "7cb12a00-..."]
}
```

**Respuesta `200 OK`:** `CancelacionResponse` (mismo shape que arriba)

**Errores:** igual que el endpoint anterior.

---

#### `DELETE /api/v1/tickets/eventos/{eventoId}/cancelar`

Dispara la cancelación masiva de todos los tickets de un evento cancelado.  
Uso exclusivo de administrador.

**Path param:** `eventoId` — UUID del evento.

**Respuesta `200 OK`:** body vacío.

---

### 3. Admin — Gestión de Tickets

#### `PATCH /api/v1/admin/tickets/{id}/estado`

Cambia el estado de un ticket manualmente (uso administrativo).

**Path param:** `id` — UUID del ticket.

**Body:**

```ts
interface CambiarEstadoTicketRequest {
  estado: EstadoTicket;       // obligatorio
  justificacion: string;      // obligatorio, no vacío
  agenteId: string | null;    // UUID del agente que realiza el cambio
}
```

```json
{
  "estado": "ANULADO",
  "justificacion": "Error de emisión detectado por auditoría",
  "agenteId": "a1b2c3d4-..."
}
```

**Respuesta `200 OK`:** `TicketConReembolsoResponse`

```json
{
  "ticketId": "3fa85f64-...",
  "estadoTicket": "ANULADO",
  "estadoReembolso": null,
  "montoReembolso": null,
  "reembolsoId": null
}
```

**Errores:**

| Código | Cuándo                                       |
|--------|----------------------------------------------|
| `422`  | La transición de estado solicitada no es válida |

---

### 4. Admin — Gestión de Reembolsos

#### `POST /api/v1/admin/tickets/{id}/reembolso`

Procesa un reembolso manual (total o parcial) para un ticket.

**Path param:** `id` — UUID del ticket.

**Body:**

```ts
interface ReembolsoManualRequest {
  tipo: TipoReembolso;        // obligatorio: 'TOTAL' | 'PARCIAL'
  monto: number | null;       // requerido cuando tipo === 'PARCIAL'
  agenteId: string | null;    // UUID del agente que autoriza
}
```

Reembolso total:
```json
{
  "tipo": "TOTAL",
  "monto": null,
  "agenteId": "a1b2c3d4-..."
}
```

Reembolso parcial:
```json
{
  "tipo": "PARCIAL",
  "monto": 50.00,
  "agenteId": "a1b2c3d4-..."
}
```

**Respuesta `200 OK`:** `ReembolsoResponse`

```json
{
  "reembolsoId": "9bc00000-...",
  "estado": "COMPLETADO",
  "monto": 50.00,
  "agenteId": "a1b2c3d4-...",
  "fechaCompletado": "2026-05-27T14:30:00"
}
```

---

#### `GET /api/v1/admin/reembolsos/cola`

Lista todos los reembolsos en estado `PENDIENTE` o `EN_PROCESO`.

**Respuesta `200 OK`:** `ReembolsoPendienteResponse[]`

```json
[
  {
    "reembolsoId": "9bc00000-...",
    "ticketId": "3fa85f64-...",
    "ventaId": "1a2b3c4d-...",
    "monto": 120.00,
    "tipo": "TOTAL",
    "estado": "PENDIENTE",
    "fechaSolicitud": "2026-05-26T10:00:00",
    "agenteId": null
  }
]
```

---

#### `POST /api/v1/admin/reembolsos/procesar-cola`

Dispara el procesamiento automático de todos los reembolsos pendientes en la cola. No requiere body.

**Respuesta `200 OK`:** body vacío.

---

## Resumen de errores HTTP

| Código | Significado                                      | Dónde puede ocurrir               |
|--------|--------------------------------------------------|-----------------------------------|
| `400`  | Validación de campos del body (campo obligatorio faltante) | Cualquier endpoint con body |
| `409`  | Conflicto de estado (ticket ya usado)            | `DELETE /tickets/:id/cancelar`    |
| `422`  | Operación no permitida en el estado actual       | Cancelar fuera de plazo, transición de estado inválida |
| `500`  | Error interno del servidor                       | Cualquiera                        |
