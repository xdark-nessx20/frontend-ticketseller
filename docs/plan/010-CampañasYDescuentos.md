# Implementation Plan: Campañas y Descuentos – Frontend

**Date**: 09/05/2026

## Summary

El **Coordinador de Patrocinios** y el **Agente de Ventas** deben poder crear preventas exclusivas
con segmentación por tipo de usuario, descuentos porcentuales o por monto fijo con vigencia
temporal, y códigos promocionales con control de usos. El panel administrativo expone el ciclo de
vida de las campañas (pausar, reanudar, finalizar) y la aplicación de descuentos se refleja
automáticamente en el carrito del comprador.

Este módulo opera en dos contextos: el panel de administración (gestión de campañas) y el portal
del comprador (aplicar códigos en carrito). Depende del feature 002 (zonas), feature 004 (checkout)
y feature 012 (eventos).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x
**Server State**: TanStack Query v5
**Client State**: Zustand (estado del carrito con descuento aplicado)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Admin Panel SPA + Buyer Portal SPA
**Performance Goals**: Descuento reflejado en carrito en menos de 1s tras aplicar código. Panel de
campañas carga en menos de 2s.
**Constraints**: Cero casos de código usado más veces de las permitidas. Promociones FINALIZADAS no
se pueden reactivar.
**Scale/Scope**: Crea entidades desde cero — `TipoUsuario` se define aquí por primera vez. Depende
de features 002, 004 y 012.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type TipoPromocion = 'PREVENTA' | 'DESCUENTO' | 'CODIGOS';
type EstadoPromocion = 'ACTIVA' | 'PAUSADA' | 'FINALIZADA';
type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO';
type EstadoCodigoPromocional = 'ACTIVO' | 'AGOTADO' | 'EXPIRADO';
type TipoUsuario = 'VIP' | 'GENERAL' | 'PRENSA' | 'PATROCINADOR';
```

### Interfaces de Respuesta

```typescript
interface PromocionResponse {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  eventoId: string;
  fechaInicio: string;                    // ISO 8601
  fechaFin: string;                       // ISO 8601
  estado: EstadoPromocion;
  tipoUsuarioRestringido: TipoUsuario | null;
}

interface DescuentoResponse {
  id: string;
  promocionId: string;
  promocionNombre: string;
  tipo: TipoDescuento;
  valor: number;
  zonaId: string | null;
  acumulable: boolean;
}

interface DescuentoAplicadoResponse {
  descuentoId: string;
  tipo: TipoDescuento;
  valor: number;
  montoDescuento: number;
  totalConDescuento: number;
}
```

### Interfaces de Request

```typescript
interface CrearPromocionRequest {
  nombre: string;
  tipo: TipoPromocion;
  eventoId: string;
  fechaInicio: string;                    // ISO 8601
  fechaFin: string;                       // ISO 8601
  tipoUsuarioRestringido?: TipoUsuario;
}

interface CrearDescuentoRequest {
  tipo: TipoDescuento;
  valor: number;
  zonaId?: string;
  acumulable?: boolean;
}

interface CrearCodigosRequest {
  cantidad: number;
  usosMaximosPorCodigo?: number;          // null = sin límite
  prefijo?: string;
  fechaFin: string;                       // ISO 8601
}

interface AplicarCodigoRequest {
  codigo: string;
}

interface ActualizarEstadoPromocionRequest {
  estado: EstadoPromocion;
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
│   └── promociones.types.ts
├── services/
│   └── promocionesService.ts
├── hooks/
│   └── promociones/
│       ├── usePromociones.ts
│       ├── useCrearPromocion.ts
│       ├── useGestionarEstadoPromocion.ts
│       ├── useDescuentos.ts
│       ├── useCrearDescuento.ts
│       ├── useCrearCodigos.ts
│       └── useAplicarCodigo.ts
├── pages/
│   └── promociones/
│       └── PromocionesPage.tsx
└── components/
    └── promociones/
        ├── PromocionesTable.tsx
        ├── CrearPromocionModal.tsx
        ├── GestionarEstadoModal.tsx
        ├── DescuentosPanel.tsx
        ├── CrearDescuentoModal.tsx
        ├── GenerarCodigosModal.tsx
        ├── AplicarCodigoInput.tsx
        ├── PromocionEstadoBadge.tsx
        └── DescuentoAplicadoResumen.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base compartida por administración y portal del comprador.

**⚠️ CRITICAL**: Depende de los features 002, 004 y 012 completados.

- [ ] T001 Definir interfaces en `promociones.types.ts`:
    - `PromocionResponse`, `DescuentoResponse`, `DescuentoAplicadoResponse`
    - `CrearPromocionRequest`, `CrearDescuentoRequest`, `CrearCodigosRequest`, `AplicarCodigoRequest`, `ActualizarEstadoPromocionRequest`
    - Enums: `TipoPromocion`, `EstadoPromocion`, `TipoDescuento`, `EstadoCodigoPromocional`, `TipoUsuario`
- [ ] T002 Implementar `promocionesService.ts`:
    - `getPromociones(eventoId)` → `GET /api/admin/promociones?eventoId={id}`
    - `crearPromocion(data)` → `POST /api/admin/promociones`
    - `actualizarEstado(promocionId, data)` → `PATCH /api/admin/promociones/{id}/estado`
    - `getDescuentos(promocionId)` → `GET /api/admin/promociones/{id}/descuentos`
    - `crearDescuento(promocionId, data)` → `POST /api/admin/promociones/{id}/descuentos`
    - `crearCodigos(promocionId, data)` → `POST /api/admin/promociones/{id}/codigos`
    - `aplicarCodigo(data)` → `POST /api/compras/carrito/aplicar-codigo`
- [ ] T003 Definir rutas: `/admin/eventos/:eventoId/promociones`

**Checkpoint**: Tipos definidos, servicio compilando

---

## Phase 2: User Story 1 — Crear Preventa Exclusiva (Priority: P2)

**Goal**: El coordinador puede crear una preventa con fechas y segmentación por tipo de usuario. Solo
los usuarios del tipo autorizado pueden ver y comprar esos asientos durante el período de preventa.

**Independent Test**: Hacer clic en "Nueva Promoción" y completar el formulario con tipo PREVENTA y
TipoUsuario VIP. La promoción aparece en la tabla con estado ACTIVA. Un usuario GENERAL ve los asientos
bloqueados hasta la fecha de venta general.

- [ ] T004 [US1] Implementar `useCrearPromocion.ts` con `useMutation`: invalida la lista de
  promociones en `onSuccess`
- [ ] T005 [US1] Implementar `PromocionEstadoBadge.tsx`: badge coloreado por `EstadoPromocion`
  (verde=ACTIVA, amarillo=PAUSADA, gris=FINALIZADA)
- [ ] T006 [US1] Implementar `CrearPromocionModal.tsx`: select tipo (PREVENTA/DESCUENTO/CODIGOS),
  inputs nombre y eventoId, date pickers fechaInicio/fechaFin, select tipoUsuarioRestringido
  opcional; manejo de error 409 si fechas inválidas
- [ ] T007 [US1] Implementar `PromocionesTable.tsx`: columnas nombre, tipo, fechas, estado (badge),
  tipoUsuario, acciones (ver descuentos, gestionar estado)

**Checkpoint**: Creación de preventa funcional con segmentación por tipo de usuario

---

## Phase 3: User Story 2 — Crear Descuento por Tiempo Limitado (Priority: P2)

**Goal**: El agente puede crear descuentos porcentuales o por monto fijo que se aplican automáticamente
en el carrito durante su vigencia. Puede segmentar el descuento a una zona específica.

**Independent Test**: Seleccionar una promoción ACTIVA y hacer clic en "Agregar Descuento". Completar
con tipo PORCENTAJE y valor 20. El descuento aparece en el panel. Al hacer checkout durante la vigencia,
el total del carrito muestra el descuento aplicado.

- [ ] T008 [US2] Implementar `useDescuentos.ts` y `useCrearDescuento.ts` con `useQuery`/`useMutation`
- [ ] T009 [US2] Implementar `CrearDescuentoModal.tsx`: select tipo (PORCENTAJE/MONTO_FIJO), input
  valor con validación positivo/≤100 para porcentaje, select zonaId opcional con zonas del evento
- [ ] T010 [US2] Implementar `DescuentoAplicadoResumen.tsx`: muestra desglose del descuento aplicado
  (tipo, valor, monto descontado, total con descuento) en el carrito
- [ ] T011 [US2] Implementar `DescuentosPanel.tsx`: lista los descuentos de una promoción con botón
  "Agregar Descuento"

**Checkpoint**: Descuentos por tiempo funcionales con reflejo automático en carrito

---

## Phase 4: User Story 3 — Crear Descuento por Código Promocional (Priority: P2)

**Goal**: El agente puede generar códigos promocionales masivos con control de usos. Los compradores
los ingresan en el carrito para obtener el descuento.

**Independent Test**: Hacer clic en "Generar Códigos" con cantidad 100 y prefijo "INFLUENCER". Se
generan los códigos. En el portal del comprador, ingresar un código válido aplica el descuento.
Ingresar el mismo código de uso único por segunda vez muestra error "Código ya utilizado".

- [ ] T012 [US3] Implementar `useCrearCodigos.ts` con `useMutation`: invalida la promoción en
  `onSuccess`
- [ ] T013 [US3] Implementar `useAplicarCodigo.ts` con `useMutation`: actualiza el estado del
  carrito con `DescuentoAplicadoResponse` en `onSuccess`; maneja errores 409 (agotado/expirado)
  con mensajes descriptivos
- [ ] T014 [US3] Implementar `GenerarCodigosModal.tsx`: input cantidad, input prefijo opcional,
  input usosMaximosPorCodigo opcional, date picker fechaFin
- [ ] T015 [US3] Implementar `AplicarCodigoInput.tsx`: input de texto + botón "Aplicar"; muestra
  `DescuentoAplicadoResumen` si el código fue válido; muestra el error descriptivo del backend si
  el código falla (409)

**Checkpoint**: Códigos promocionales funcionales con límite de usos

---

## Phase 5: User Story 4 — Pausar o Finalizar Campañas (Priority: P2)

**Goal**: El coordinador puede pausar, reanudar o finalizar anticipadamente una campaña con efecto
inmediato. Las campañas FINALIZADAS no pueden reactivarse.

**Independent Test**: Desde la tabla de promociones, hacer clic en "Pausar" sobre una campaña ACTIVA.
El estado cambia a PAUSADA y el descuento deja de aplicarse en el carrito. Hacer clic en "Reanudar"
reactiva la campaña. Hacer clic en "Finalizar" muestra confirmación y es irreversible.

- [ ] T016 [US4] Implementar `useGestionarEstadoPromocion.ts` con `useMutation`: invalida la lista
  de promociones en `onSuccess`
- [ ] T017 [US4] Implementar `GestionarEstadoModal.tsx`: muestra el estado actual, botones de
  transición disponibles según estado (ACTIVA → puede pausar/finalizar; PAUSADA → puede activar/
  finalizar; FINALIZADA → sin acciones); confirmación obligatoria antes de FINALIZAR
- [ ] T018 [US4] Integrar `GestionarEstadoModal` en las acciones de `PromocionesTable`

**Checkpoint**: Gestión del ciclo de vida de campañas funcional

---

## Phase 6: User Story 5 — Descuentos por Zona (Priority: P3)

**Goal**: El agente puede crear descuentos que aplican solo a tickets de una zona específica.

**Independent Test**: Crear descuento con zonaId "platea-alta". Al agregar un ticket de esa zona al
carrito, el descuento se aplica. Ticket de otra zona no recibe el descuento.

- [ ] T019 [US5] Actualizar `CrearDescuentoModal.tsx`: confirmar que el select de zonaId carga las
  zonas ACTIVAS del evento asociado a la promoción
- [ ] T020 [US5] Actualizar `DescuentosPanel.tsx`: mostrar el nombre de la zona si el descuento
  tiene `zonaId`, mostrar "Todas las zonas" si `zonaId` es null

**Checkpoint**: Segmentación de descuentos por zona funcional

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T021 Implementar `PromocionesPage.tsx`: usa `usePromociones`, renderiza `PromocionesTable` con
  botón "Nueva Promoción"
- [ ] T022 Deshabilitar botón "Aplicar código" mientras la mutation está pendiente — no re-enviar
- [ ] T023 Mostrar aviso en `AplicarCodigoInput` cuando el descuento expira mientras el comprador
  está en carrito (recalcular al confirmar checkout)
- [ ] T024 Verificar que `TipoUsuario` se reutiliza en otros features que requieran segmentación

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 002, 004 y 012 completados
- **US1 (Phase 2)**: Depende de Foundational
- **US2 (Phase 3)**: Depende de Foundational — puede ejecutarse en paralelo con US1
- **US3 (Phase 4)**: Depende de US2 — los códigos aplican un descuento que debe existir
- **US4 (Phase 5)**: Depende de US1 y US2 — gestiona el ciclo de vida de lo creado en US1/US2
- **US5 (Phase 6)**: Depende de US2 — extiende la aplicación de descuentos con filtro por zona
- **Polish (Phase 7)**: Depende de todas las user stories

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **`TipoUsuario` es el primer punto de definición**: este feature establece el concepto de
  segmentación de usuarios — otros features que requieran diferenciar tipos de usuario deben
  importar el enum desde `promociones.types.ts`
- **Descuento expira en carrito**: si un descuento expira mientras el comprador está en el carrito,
  el backend rechaza el cobro al confirmar — el frontend debe limpiar `DescuentoAplicadoResumen`
  en ese caso y mostrar un aviso
- **Deshabilitar botón de confirmación**: mientras `useAplicarCodigo` está pendiente, deshabilitar
  el botón para evitar doble envío (el backend maneja idempotencia, pero es mejor UX)
- **Transiciones FINALIZADA**: es estado terminal — cuando el backend retorna error 409 al intentar
  reactivar una campaña FINALIZADA, mostrar mensaje claro al coordinador
