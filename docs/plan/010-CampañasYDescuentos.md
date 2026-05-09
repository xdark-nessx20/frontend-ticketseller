# Implementation Plan: Campañas y Descuentos – Frontend

**Date**: 09/05/2026  
**Specs**:

- [010-CampañasYDescuentos.md](/docs/plan/010-CampañasYDescuentos.md)

## Summary

El **Administrador** debe poder crear y gestionar campañas de descuento (promociones), definir los descuentos dentro de cada campaña, generar códigos promocionales en batch y cambiar el estado de las campañas. El **Comprador** puede aplicar un código promocional en su carrito y ver el descuento calculado antes de confirmar la reserva.

Este módulo tiene dos audiencias: el panel admin para la gestión de campañas y el componente de carrito del portal del comprador para la aplicación de códigos. El cálculo de descuentos es server-side — el frontend solo muestra el resultado.

Depende del plan 012 (eventos existen para asociar campañas) y del plan 004 (el `PromoCodeInput` ya está en el carrito).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: React 18+ (Vite)  
**Styling**: Tailwind CSS 3.x  
**Server State**: TanStack Query v5  
**Client State**: Zustand  
**HTTP Client**: Axios  
**Router**: React Router v6  
**Testing**: Vitest + React Testing Library + MSW  
**Target Platform**: Admin Panel SPA + Customer Portal  
**Performance Goals**: Listado de promociones carga en menos de 1s.  
**Constraints**: Un descuento acumulado no puede superar el 100% del precio. Los códigos generados son de un solo uso por defecto. La previa del descuento (calcular-descuentos) es informativa — el precio final lo confirma el backend al reservar.  
**Scale/Scope**: Feature de marketing — depende de planes 004 y 012.

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
│   └── promocion.types.ts
├── services/
│   ├── promocionesService.ts
│   └── descuentosService.ts
├── hooks/
│   └── promociones/
│       ├── usePromociones.ts
│       ├── useCrearPromocion.ts
│       ├── useGestionarEstadoPromocion.ts
│       ├── useDescuentos.ts
│       ├── useCrearDescuento.ts
│       ├── useGenerarCodigos.ts
│       ├── useCalcularDescuentos.ts
│       └── useAplicarCodigo.ts
├── pages/
│   └── promociones/
│       ├── PromotionListPage.tsx
│       ├── PromotionDetailPage.tsx
│       └── DiscountCodeManagerPage.tsx
└── components/
    └── promociones/
        ├── PromotionForm.tsx
        ├── PromotionStatusBadge.tsx
        ├── DiscountForm.tsx
        ├── DiscountTable.tsx
        ├── CodeGeneratorModal.tsx
        ├── DiscountCodeTable.tsx
        └── DescuentoAplicadoSummary.tsx

src/__tests__/
└── promociones/
    ├── PromotionForm.test.tsx
    ├── DiscountForm.test.tsx
    ├── CodeGeneratorModal.test.tsx
    └── PromotionStatusBadge.test.tsx
```

---

## Phase 1: Foundational

- [ ] T001 Definir interfaces en `promocion.types.ts`:
  - `PromocionResponse` (id, eventoId, nombre, descripcion, fechaInicio, fechaFin, estado, tipo)
  - `DescuentoResponse` (id, promocionId, nombre, tipoDescuento, valor, cantidadMaxima)
  - `DescuentoAplicadoResponse` (descuentosAplicados, totalOriginal, totalConDescuento, ahorro)
  - `CrearPromocionRequest` (eventoId, nombre, descripcion, fechaInicio, fechaFin, tipo)
  - `ActualizarEstadoPromocionRequest` (estado)
  - `CrearDescuentoRequest` (nombre, tipoDescuento, valor, cantidadMaxima, tiposUsuario)
  - `CrearCodigosRequest` (cantidad, usosMaximosPorCodigo, prefijo, fechaFin)
  - `AplicarCodigoRequest` (codigo)
  - `CalcularDescuentoRequest` (eventoId, tipoUsuario, items)
  - Enums: `EstadoPromocion`, `TipoPromocion`, `TipoDescuento`, `TipoUsuario`
- [ ] T002 Implementar `promocionesService.ts`:
  - `getPromociones(eventoId)` — GET `/api/v1/admin/promociones?eventoId=`
  - `crearPromocion(data)` — POST `/api/v1/admin/promociones`
  - `actualizarEstado(id, data)` — PATCH `/api/v1/admin/promociones/{id}/estado`
  - `generarCodigos(id, data)` — POST `/api/v1/admin/promociones/{id}/codigos`
  - `calcularDescuentos(data)` — POST `/api/v1/admin/promociones/calcular-descuentos`
- [ ] T003 Implementar `descuentosService.ts`:
  - `getDescuentos(promocionId)` — GET `/api/v1/admin/promociones/{id}/descuentos`
  - `crearDescuento(promocionId, data)` — POST `/api/v1/admin/promociones/{id}/descuentos`
  - `aplicarCodigo(data)` — POST `/api/v1/compras/carrito/aplicar-codigo`
- [ ] T004 Definir rutas: `/admin/promociones`, `/admin/promociones/:id`, `/admin/promociones/:id/codigos`

**Checkpoint**: Tipos y servicios compilando

---

## Phase 2: User Story 1 — Crear y Listar Promociones (Priority: P1)

**Goal**: El administrador puede crear campañas de descuento para un evento y verlas en el listado.

**Independent Test**: Navegar a `/admin/promociones?eventoId=X` muestra lista de promociones. Crear "Black Friday" con fechas y tipo DESCUENTO_PORCENTAJE aparece en la lista con estado BORRADOR.

### Tests para User Story 1

- [ ] T005 [P] [US1] Test: `PromotionForm` valida fechaFin posterior a fechaInicio — `PromotionForm.test.tsx`
- [ ] T006 [P] [US1] Test: `PromotionStatusBadge` renderiza color correcto por estado — `PromotionStatusBadge.test.tsx`
- [ ] T007 [P] [US1] Test: `useCrearPromocion` invalida `['promociones', eventoId]` en `onSuccess`

### Implementación de User Story 1

- [ ] T008 [US1] Implementar `usePromociones.ts`, `useCrearPromocion.ts`
- [ ] T009 [US1] Implementar `PromotionStatusBadge.tsx`: badge BORRADOR (gris), ACTIVA (verde), PAUSADA (amarillo), FINALIZADA/CANCELADA (rojo)
- [ ] T010 [US1] Implementar `PromotionForm.tsx`: campos nombre, descripción, select de tipo, select de evento, date pickers fechaInicio/fechaFin; validación Zod
- [ ] T011 [US1] Implementar `PromotionListPage.tsx`: tabla de promociones + botón "Nueva Campaña"

**Checkpoint**: Creación y listado de promociones funcional

---

## Phase 3: User Story 2 — Gestionar Estado de Promoción (Priority: P1)

**Goal**: El administrador puede activar, pausar, finalizar o cancelar una campaña.

**Independent Test**: En el detalle de una campaña BORRADOR, clic en "Activar" cambia el estado a ACTIVA. Desde ACTIVA se puede "Pausar" o "Finalizar".

### Tests para User Story 2

- [ ] T012 [P] [US2] Test: botones de transición de estado solo muestran opciones válidas desde el estado actual — test
- [ ] T013 [P] [US2] Test: `useGestionarEstadoPromocion` invalida queries en `onSuccess`

### Implementación de User Story 2

- [ ] T014 [US2] Implementar `useGestionarEstadoPromocion.ts`
- [ ] T015 [US2] Agregar botones de ciclo de vida en `PromotionDetailPage.tsx`: Activar (desde BORRADOR), Pausar/Finalizar (desde ACTIVA), Reactivar (desde PAUSADA), Cancelar

**Checkpoint**: Gestión de ciclo de vida de campañas funcional

---

## Phase 4: User Story 3 — Crear Descuentos (Priority: P1)

**Goal**: El administrador puede añadir reglas de descuento a una campaña existente.

**Independent Test**: En el detalle de una campaña, sección "Descuentos", crear un descuento "Estudiantes 20%" de tipo PORCENTAJE con valor 20 — aparece en la tabla de descuentos.

### Tests para User Story 3

- [ ] T016 [P] [US3] Test: `DiscountForm` valida valor positivo y tipo seleccionado — `DiscountForm.test.tsx`

### Implementación de User Story 3

- [ ] T017 [US3] Implementar `useDescuentos.ts`, `useCrearDescuento.ts`
- [ ] T018 [US3] Implementar `DiscountForm.tsx`: select de tipo (PORCENTAJE/MONTO_FIJO), input de valor, multi-select de tiposUsuario, input de cantidadMaxima
- [ ] T019 [US3] Implementar `DiscountTable.tsx`: tabla de descuentos con tipo, valor, usuarios, límite
- [ ] T020 [US3] Implementar `PromotionDetailPage.tsx`: detalle de campaña + `DiscountTable` + formulario de descuento inline

**Checkpoint**: Descuentos por campaña funcional

---

## Phase 5: User Story 4 — Generar Códigos Promocionales (Priority: P1)

**Goal**: El administrador puede generar lotes de códigos para una campaña.

**Independent Test**: Abrir modal "Generar Códigos", ingresar cantidad 100, prefijo "VIP", usos máximos 1, fecha de expiración. Confirmar muestra lista de 100 códigos generados con opción de copiar al portapapeles.

### Tests para User Story 4

- [ ] T021 [P] [US4] Test: `CodeGeneratorModal` valida cantidad positiva — `CodeGeneratorModal.test.tsx`
- [ ] T022 [P] [US4] Test: resultado muestra lista de códigos — `CodeGeneratorModal.test.tsx`

### Implementación de User Story 4

- [ ] T023 [US4] Implementar `useGenerarCodigos.ts`
- [ ] T024 [US4] Implementar `CodeGeneratorModal.tsx`: formulario de generación + tabla de resultados + botón "Copiar todos"
- [ ] T025 [US4] Implementar `DiscountCodeManagerPage.tsx`: listado de campañas con códigos + botón que abre `CodeGeneratorModal`

**Checkpoint**: Generación de códigos funcional

---

## Phase 6: User Story 5 — Aplicar Código en Carrito (Priority: P1)

**Goal**: El comprador puede aplicar un código promocional en el carrito y ver el descuento calculado.

**Independent Test**: En el carrito, ingresar código "VIP2026" y clic "Aplicar" muestra "-20%" y el nuevo total. Código inválido muestra "Código no válido o expirado".

### Tests para User Story 5

- [ ] T026 [P] [US5] Test: `PromoCodeInput` (del plan 004) muestra descuento aplicado al recibir respuesta exitosa — test
- [ ] T027 [P] [US5] Test: código inválido muestra mensaje de error inline

### Implementación de User Story 5

- [ ] T028 [US5] Implementar `useAplicarCodigo.ts` y `useCalcularDescuentos.ts`
- [ ] T029 [US5] Implementar `DescuentoAplicadoSummary.tsx`: muestra descuentos aplicados, ahorro total, total con descuento
- [ ] T030 [US5] Actualizar `PromoCodeInput.tsx` del plan 004 para usar `useAplicarCodigo` y mostrar `DescuentoAplicadoSummary`

**Checkpoint**: Aplicación de código promocional en carrito funcional

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T031 Botón "Copiar código" en tabla de `DiscountCodeTable` con feedback visual (ícono check por 2s)
- [ ] T032 Exportar códigos generados como CSV
- [ ] T033 Verificar tipos alineados con OpenAPI del backend

---

## Dependencies & Execution Order

- **Foundational (Phase 1)**: Depende de planes 004 y 012
- **US1–US4 (Phases 2–5)**: Paralelas entre sí, todas dependen de Foundational
- **US5 (Phase 6)**: Depende de Foundational y del `PromoCodeInput` del plan 004
- **Polish (Phase 7)**: Depende de todo

---

## Notes

- **TipoUsuario**: el backend valida el tipo de usuario para descuentos diferenciados — el frontend pasa el tipo del comprador autenticado; implementar lógica de `tipoUsuario` cuando exista autenticación real
- **calcular-descuentos vs aplicar-codigo**: el primero es para preview (sin estado), el segundo aplica el código al carrito y valida uso

