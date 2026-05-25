# Guía Frontend: Descuentos y Códigos Promocionales

## ¿Qué cambió?

El campo `tipo` de una Promoción fue reemplazado por `mecanismo`. Los valores anteriores (`PREVENTA`, `DESCUENTO`, `CODIGOS`) se consolidan en dos:

| Antes | Ahora |
|---|---|
| `tipo: "PREVENTA"` | `mecanismo: "AUTOMATICO"` |
| `tipo: "DESCUENTO"` | `mecanismo: "AUTOMATICO"` |
| `tipo: "CODIGOS"` | `mecanismo: "CODIGO"` |

La diferencia de comportamiento entre los dos mecanismos:

- **`AUTOMATICO`**: el descuento se aplica directamente al carrito sin que el usuario haga nada. Si la promoción tiene `tipoUsuarioRestringido`, solo aplica para ese tipo de usuario.
- **`CODIGO`**: el usuario ingresa un código voluntariamente. Al aplicarlo, el backend actualiza el total de la venta en base de datos y devuelve los montos actualizados.

---

## Tipos TypeScript

```typescript
type MecanismoAplicacion = 'AUTOMATICO' | 'CODIGO';
type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO';
type EstadoPromocion = 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';
type TipoUsuario = 'VIP' | 'GENERAL' | 'PRENSA' | 'PATROCINADOR';

interface Promocion {
  id: string;
  nombre: string;
  mecanismo: MecanismoAplicacion; // antes: tipo
  eventoId: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPromocion;
  tipoUsuarioRestringido?: TipoUsuario;
}

interface DescuentoAplicado {
  subtotalOriginal: number;
  montoDescuento: number;
  totalFinal: number;
}

interface ItemCarrito {
  zonaId: string;
  precio: number;
}
```

---

## Descuentos automáticos (`mecanismo: "AUTOMATICO"`)

Se calculan al armar el carrito. No requieren acción del usuario.

### Endpoint

```
POST /api/v1/admin/promociones/calcular-descuentos
```

### Request

```typescript
interface CalcularDescuentoRequest {
  eventoId: string;
  tipoUsuario?: TipoUsuario; // si se omite, solo aplican descuentos sin restricción de usuario
  items: ItemCarrito[];
}
```

### Ejemplo

```typescript
async function calcularDescuentos(
  eventoId: string,
  tipoUsuario: TipoUsuario | undefined,
  items: ItemCarrito[]
): Promise<DescuentoAplicado> {
  const res = await fetch('/api/v1/admin/promociones/calcular-descuentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventoId, tipoUsuario, items }),
  });
  if (!res.ok) throw new Error('Error al calcular descuentos');
  return res.json();
}
```

### Comportamiento por tipo de usuario

| `tipoUsuario` enviado | Descuentos que aplican |
|---|---|
| `"VIP"` | Sin restricción + restricción VIP |
| `"GENERAL"` | Solo sin restricción de usuario |
| Omitido / `null` | Solo sin restricción de usuario |

---

## Códigos promocionales (`mecanismo: "CODIGO"`)

El usuario ingresa un código en el checkout. Al aplicarlo exitosamente, el backend actualiza `venta.total` en base de datos y devuelve los nuevos montos.

### Endpoint

```
POST /api/v1/compras/{ventaId}/aplicar-codigo
```

### Request / Response

```typescript
interface AplicarCodigoRequest {
  codigo: string;
}

// Response: DescuentoAplicado
// {
//   subtotalOriginal: number,
//   montoDescuento: number,
//   totalFinal: number   ← este es el nuevo total de la venta en BD
// }
```

### Errores posibles

| HTTP | Descripción |
|---|---|
| `400` | Código en blanco |
| `404` | Venta no encontrada |
| `409` | Código expirado, agotado, o pertenece a una promoción inactiva |

---

## Actualización automática del UI al aplicar código

Cuando el backend responde con `200 OK`, el `totalFinal` ya está persistido en la venta. El frontend debe reflejar este cambio inmediatamente sin recargar la página.

### Opción recomendada: actualización local + invalidación

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface Venta {
  id: string;
  total: number;
  // ...otros campos
}

function CodigoPromoField({ ventaId }: { ventaId: string }) {
  const [codigo, setCodigo] = useState('');
  const queryClient = useQueryClient();

  const aplicarCodigo = useMutation({
    mutationFn: async (codigo: string): Promise<DescuentoAplicado> => {
      const res = await fetch(`/api/v1/compras/${ventaId}/aplicar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.mensaje ?? 'Código inválido');
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Actualizar el total en caché sin hacer otro request
      queryClient.setQueryData<Venta>(['venta', ventaId], (old) =>
        old ? { ...old, total: data.totalFinal } : old
      );
      // Invalidar para sincronizar el resto de la venta (tickets, estado, etc.)
      queryClient.invalidateQueries({ queryKey: ['venta', ventaId] });
      setCodigo('');
    },
  });

  return (
    <div>
      <input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código promocional"
        disabled={aplicarCodigo.isPending}
      />
      <button
        onClick={() => aplicarCodigo.mutate(codigo)}
        disabled={aplicarCodigo.isPending || !codigo.trim()}
      >
        {aplicarCodigo.isPending ? 'Aplicando...' : 'Aplicar'}
      </button>

      {aplicarCodigo.isSuccess && (
        <p className="text-green-600">
          Descuento aplicado: ${aplicarCodigo.data.montoDescuento.toLocaleString()}
          {' '}— Nuevo total: ${aplicarCodigo.data.totalFinal.toLocaleString()}
        </p>
      )}

      {aplicarCodigo.isError && (
        <p className="text-red-600">{(aplicarCodigo.error as Error).message}</p>
      )}
    </div>
  );
}
```

### Sin TanStack Query (fetch simple)

```typescript
async function aplicarCodigo(
  ventaId: string,
  codigo: string,
  onSuccess: (data: DescuentoAplicado) => void,
  onError: (mensaje: string) => void
) {
  const res = await fetch(`/api/v1/compras/${ventaId}/aplicar-codigo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  });

  if (res.status === 409) {
    const body = await res.json();
    onError(body.mensaje); // "CÓDIGO EXPIRADO" | "CÓDIGO YA UTILIZADO"
    return;
  }

  if (!res.ok) {
    onError('Error al aplicar el código');
    return;
  }

  const data: DescuentoAplicado = await res.json();
  onSuccess(data); // actualizar UI con data.totalFinal
}
```

---

## Panel admin: creación de promociones

### Crear promoción automática

```typescript
// POST /api/v1/admin/promociones
const body = {
  nombre: 'Descuento Apertura',
  mecanismo: 'AUTOMATICO',     // antes: tipo: 'DESCUENTO' o tipo: 'PREVENTA'
  eventoId: '...',
  fechaInicio: '2026-06-01T00:00:00',
  fechaFin: '2026-06-15T23:59:59',
  tipoUsuarioRestringido: 'VIP', // opcional — omitir para descuento sin restricción
};
```

### Crear campaña de códigos

```typescript
// Paso 1 — crear la promoción
// POST /api/v1/admin/promociones
const promBody = {
  nombre: 'Campaña Influencers',
  mecanismo: 'CODIGO',   // antes: tipo: 'CODIGOS'
  eventoId: '...',
  fechaInicio: '2026-06-01T00:00:00',
  fechaFin: '2026-07-31T23:59:59',
};

// Paso 2 — definir el descuento que da el código
// POST /api/v1/admin/promociones/{id}/descuentos
const descBody = {
  tipo: 'PORCENTAJE',  // o 'MONTO_FIJO'
  valor: 15,
  acumulable: false,
  // zonaId: '...' — opcional, si se omite aplica a todas las zonas
};

// Paso 3 — generar los códigos
// POST /api/v1/admin/promociones/{id}/codigos
const codigosBody = {
  cantidad: 200,
  usosMaximosPorCodigo: 1,
  prefijo: 'INFLUENCER',
  fechaFin: '2026-07-31T23:59:59',
};
```

### Migración en formularios existentes

- Renombrar el campo `tipo` → `mecanismo` en el estado del formulario y en el payload del request.
- Reemplazar los valores del select:
  - `"PREVENTA"` → `"AUTOMATICO"`
  - `"DESCUENTO"` → `"AUTOMATICO"`
  - `"CODIGOS"` → `"CODIGO"`
- La respuesta del endpoint también devuelve `mecanismo` en vez de `tipo`.
