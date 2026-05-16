# CAMBIOS — Contratos de API (últimos 2 commits)

> Fecha: 2026-05-16  
> Commits cubiertos:  
> - `5541f72` — Grandes cambios para la integración entre módulos  
> - `ce9ab94` — Más configuraciones en las responses. Borrando endpoints innecesarios.

---

## 1. Eventos — `EventoResponse`

**Endpoint:** `GET /api/v1/eventos/{id}` y cualquier respuesta que devuelva un evento.

**Campo añadido:**

| Campo | Tipo | Descripción |
|---|---|---|
| `reingresoHabilitado` | `boolean` | Indica si el evento permite reingreso |

**Antes:**
```json
{
  "id": "...",
  "nombre": "...",
  "fechaInicio": "...",
  "fechaFin": "...",
  "tipo": "CONCIERTO",
  "recintoId": "...",
  "estado": "ACTIVO"
}
```

**Después:**
```json
{
  "id": "...",
  "nombre": "...",
  "fechaInicio": "...",
  "fechaFin": "...",
  "tipo": "CONCIERTO",
  "recintoId": "...",
  "estado": "ACTIVO",
  "reingresoHabilitado": true
}
```

---

## 2. Eventos — `CrearEventoRequest`

**Endpoint:** `POST /api/v1/eventos`

**Campo añadido:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `reingresoHabilitado` | `boolean` | No (default `false`) | Habilita el reingreso al evento |

**Antes:**
```json
{
  "nombre": "...",
  "fechaInicio": "...",
  "fechaFin": "...",
  "tipo": "CONCIERTO",
  "recintoId": "..."
}
```

**Después:**
```json
{
  "nombre": "...",
  "fechaInicio": "...",
  "fechaFin": "...",
  "tipo": "CONCIERTO",
  "recintoId": "...",
  "reingresoHabilitado": true
}
```

---

## 3. Eventos — `EditarEventoRequest`

**Endpoint:** `PATCH /api/v1/eventos/{id}`

**Campo añadido (opcional):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `reingresoHabilitado` | `Boolean` (boxed) | No | Actualiza si el evento permite reingreso. Si se omite, no se modifica. |

**Después:**
```json
{
  "nombre": "...",
  "reingresoHabilitado": false
}
```

---

## 4. Precios — `PrecioZonaResponse`

**Endpoint:** `GET /api/v1/eventos/{id}/precios`

**Cambio:** se añadió `nombreZona` en el commit `5541f72` y luego se renombró a `zonaNombre` en el commit `ce9ab94`. El campo final es **`zonaNombre`**.

| Campo | Cambio | Tipo |
|---|---|---|
| `zonaNombre` | **Añadido** (nombre final) | `String` |

**Antes:**
```json
{
  "id": "...",
  "eventoId": "...",
  "zonaId": "...",
  "precio": 150000.00
}
```

**Después:**
```json
{
  "id": "...",
  "eventoId": "...",
  "zonaId": "...",
  "precio": 150000.00,
  "zonaNombre": "Tribuna Norte"
}
```

---

## 5. Checkout — `TicketResponse`

**Endpoint:** `POST /api/v1/checkout` (respuesta al procesar el pago)

**Cambios importantes — IDs reemplazados por nombres:**

| Campo anterior | Campo nuevo | Tipo | Nota |
|---|---|---|---|
| `zonaId` (UUID) | `zonaNombre` | `String` | Ya no se retorna el ID |
| `compuertaId` (UUID) | `compuertaNombre` | `String` | Ya no se retorna el ID |
| *(no existía)* | `numeroAsiento` | `String` | Número de asiento asignado |

**Antes:**
```json
{
  "id": "...",
  "zonaId": "uuid-zona",
  "compuertaId": "uuid-compuerta",
  "estado": "ACTIVO",
  "precio": 150000.00,
  "codigoQr": "...",
  "esCortesia": false
}
```

**Después:**
```json
{
  "id": "...",
  "zonaNombre": "Tribuna Norte",
  "compuertaNombre": "Compuerta A",
  "estado": "ACTIVO",
  "precio": 150000.00,
  "codigoQr": "...",
  "esCortesia": false,
  "numeroAsiento": "A-12"
}
```

---

## 6. Acceso — `TicketEstadoResponse`

**Endpoint:** `POST /api/v1/acceso/verificar` (verificación de ticket en compuerta)

**Campos añadidos:**

| Campo | Tipo | Descripción |
|---|---|---|
| `numeroAsiento` | `String` | Número o identificador del asiento del ticket |
| `permiteReingreso` | `boolean` | Si el evento del ticket permite reingreso |

**Antes:**
```json
{
  "ticketId": "...",
  "eventoId": "...",
  "estado": "ACTIVO",
  "categoria": "VIP",
  "zona": "Palco",
  "compuertaAsignada": "Compuerta B",
  "fechaEvento": "2026-06-01T20:00:00"
}
```

**Después:**
```json
{
  "ticketId": "...",
  "eventoId": "...",
  "estado": "ACTIVO",
  "categoria": "VIP",
  "zona": "Palco",
  "compuertaAsignada": "Compuerta B",
  "fechaEvento": "2026-06-01T20:00:00",
  "numeroAsiento": "P-05",
  "permiteReingreso": true
}
```

---

## 7. Liquidación — `SnapshotLiquidacionResponse`

**Endpoint:** `GET /api/v1/eventos/{id}/snapshot`

**Campos añadidos:**

| Campo | Tipo | Descripción |
|---|---|---|
| `recintoId` | `UUID` | ID del recinto al que pertenece el evento |
| `tipoRecinto` | `CategoriaRecinto` (enum) | Categoría del recinto: `ESTADIO` o `TEATRO` |

**Antes:**
```json
{
  "eventoId": "...",
  "condiciones": [...],
  "timestampGeneracion": "..."
}
```

**Después:**
```json
{
  "eventoId": "...",
  "recintoId": "...",
  "tipoRecinto": "ESTADIO",
  "condiciones": [...],
  "timestampGeneracion": "..."
}
```

---

## 8. Liquidación — `CondicionTicketResponse` (dentro de `SnapshotLiquidacionResponse`)

**Campo añadido:**

| Campo | Tipo | Descripción |
|---|---|---|
| `tickets` | `List<TicketResumenResponse>` | Listado de tickets individuales que conforman esta condición |

**Antes:**
```json
{
  "condicion": "REGULAR",
  "cantidad": 120,
  "valorTotal": 18000000.00
}
```

**Después:**
```json
{
  "condicion": "REGULAR",
  "cantidad": 120,
  "valorTotal": 18000000.00,
  "tickets": [
    { "ticketId": "...", "precio": 150000.00 },
    { "ticketId": "...", "precio": 150000.00 }
  ]
}
```

---

## 9. Nuevo DTO — `TicketResumenResponse`

Objeto anidado dentro de `CondicionTicketResponse`. No tiene endpoint propio.

```json
{
  "ticketId": "UUID",
  "precio": "BigDecimal"
}
```

---

## 10. Endpoints ELIMINADOS

Los siguientes endpoints ya no existen. Cualquier llamada a ellos retornará `404`.

| Método | Ruta | DTO de Request | DTO de Response | Motivo |
|---|---|---|---|---|
| `GET` | `/api/v1/recintos/{id}/modelo-negocio` | — | `ModeloNegocioResponse` | Eliminado — funcionalidad retirada |
| `PATCH` | `/api/v1/recintos/{id}/modelo-negocio` | `ConfigurarModeloNegocioRequest` | `ModeloNegocioResponse` | Eliminado — funcionalidad retirada |
| `GET` | `/api/v1/eventos/{id}/recaudo` | — | `RecaudoIncrementalResponse` | Eliminado — endpoint retirado |

### DTOs asociados a endpoints eliminados (ya no se usan)

**`ModeloNegocioResponse`** (eliminado):
```json
{
  "recintoId": "UUID",
  "modelo": "PORCENTAJE | FIJO",
  "tipoRecinto": "ESTADIO | TEATRO",
  "montoFijo": "BigDecimal"
}
```

**`ConfigurarModeloNegocioRequest`** (eliminado):
```json
{
  "modelo": "PORCENTAJE | FIJO",
  "montoFijo": "BigDecimal"
}
```

**`RecaudoIncrementalResponse`** (endpoint eliminado, DTO aún existe en backend):
```json
{
  "eventoId": "UUID",
  "recaudoRegular": "BigDecimal",
  "recaudoCortesia": "BigDecimal",
  "cancelaciones": "BigDecimal",
  "recaudoNeto": "BigDecimal",
  "timestamp": "LocalDateTime"
}
```

---

## Resumen de cambios por módulo frontend

| Módulo | Acción requerida |
|---|---|
| Crear/editar evento | Añadir campo `reingresoHabilitado` (checkbox) en el formulario |
| Detalle de evento | Mostrar nuevo campo `reingresoHabilitado` |
| Listado de precios por zona | Usar `zonaNombre` en lugar de resolver el UUID de zona |
| Checkout / confirmación de compra | Reemplazar `zonaId`/`compuertaId` por `zonaNombre`/`compuertaNombre`; mostrar `numeroAsiento` |
| Verificación de acceso (compuerta) | Mostrar `numeroAsiento` y `permiteReingreso` en la UI del operador |
| Liquidación — snapshot | Mostrar `recintoId`, `tipoRecinto`; expandir cada `CondicionTicketResponse` con su lista de `tickets` |
| Liquidación — modelo de negocio | Eliminar las pantallas/llamadas a `GET/PATCH /recintos/{id}/modelo-negocio` |
| Liquidación — recaudo incremental | Eliminar la llamada a `GET /eventos/{id}/recaudo` |
