# Implementation Plan: Control de Acceso – Frontend

**Date**: 09/05/2026

## Summary

El **Operador de Acceso** debe poder validar tickets en tiempo real en los puntos de ingreso del recinto. La interfaz
permite ingresar o escanear el ID de un ticket y muestra de inmediato su estado, zona, categoría y metadatos del
evento. También expone la estructura del recinto para que el operador valide coherencia de zona sin llamadas
adicionales.

Esta es una interfaz de uso en campo, optimizada para velocidad de respuesta y legibilidad en condiciones de luz
variable. No modifica datos — todas las operaciones son de solo lectura. Depende de los features 001 (recintos) y 004
(tickets con estado vendido).

## Technical Context

**Language/Version**: TypeScript 5.x
**Framework**: React 18+ (Vite)
**Styling**: Tailwind CSS 3.x — texto grande, alto contraste
**Server State**: TanStack Query v5 (sin caché — siempre estado fresco)
**Client State**: Zustand (historial de consultas recientes del operador)
**HTTP Client**: Axios
**Router**: React Router v6
**Target Platform**: Access Control SPA (uso en tablet/dispositivo de acceso)
**Performance Goals**: Respuesta de consulta de ticket en menos de 1s. Interfaz funcional sin conexión a internet
para mostrar historial reciente (consultas cacheadas localmente).
**Constraints**: No usar caché del servidor — el estado de los tickets debe reflejarse en tiempo real. Sin
modificaciones de datos desde esta interfaz.
**Scale/Scope**: Feature de solo lectura. Consume los endpoints de consulta ya expuestos por el backend.

## TypeScript Types

> Estos tipos deben mantenerse alineados con los DTOs del backend. Cualquier cambio en los contratos de la API debe
> reflejarse aquí primero.

### Enums

```typescript
type EstadoTicketAcceso = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO' | 'CANCELADO' | 'ANULADO';
```

### Interfaces de Respuesta

```typescript
interface TicketEstadoResponse {
  ticketId: string;
  estado: EstadoTicketAcceso;
  categoria: string;              // e.g. "VIP", "GENERAL"
  bloque: string;                 // e.g. "A", "Norte"
  coordenadaAcceso: string;       // e.g. "Puerta Norte"
  eventoId: string;
  fechaEvento: string;            // ISO 8601
}

interface BloqueResponse {
  categoria: string;
  coordenadaAcceso: string;
}

interface RecintoEstructuraAccesoResponse {
  recintoId: string;
  bloques: BloqueResponse[];
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
│   └── acceso.types.ts
├── services/
│   └── accesoService.ts
├── stores/
│   └── accesoStore.ts
├── hooks/
│   └── acceso/
│       ├── useConsultarTicket.ts
│       └── useRecintoEstructuraAcceso.ts
├── pages/
│   └── acceso/
│       ├── AccesoPage.tsx
│       └── EstructuraRecintoPage.tsx
└── components/
    └── acceso/
        ├── BuscadorTicket.tsx
        ├── ResultadoTicketCard.tsx
        ├── EstadoAccesoBadge.tsx
        ├── HistorialConsultasPanel.tsx
        └── EstructuraRecintoTable.tsx
```

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Tipos TypeScript y servicio — base de todas las consultas.

**⚠️ CRITICAL**: Depende de los features 001 y 004 completados.

- [ ] T001 Definir interfaces en `acceso.types.ts`:
    - `TicketEstadoResponse`, `BloqueResponse`, `RecintoEstructuraAccesoResponse`
    - Enum `EstadoTicketAcceso`
- [ ] T002 Implementar `accesoService.ts`:
    - `consultarTicket(ticketId)` → `GET /api/tickets/{id}`
    - `getEstructuraRecinto(recintoId)` → `GET /api/recintos/{id}`
- [ ] T003 Implementar `accesoStore.ts` con Zustand: lista de últimas 20 consultas realizadas (id, resultado,
  timestamp), para mostrar historial sin nueva llamada al backend
- [ ] T004 Definir rutas: `/acceso`, `/acceso/recinto/:id`

**Checkpoint**: Tipos definidos, servicio compilando, store del historial funcionando

---

## Phase 2: User Story 1 + 2 — Consulta de Estado, Zona y Categoría del Ticket (Priority: P1)

**Goal**: El operador puede ingresar o escanear el ID de un ticket y ver en un único panel su estado de ciclo de vida,
categoría, bloque y coordenada de acceso. Tickets inexistentes muestran error 404 claro.

**Independent Test**: Ingresar un ID válido muestra `ResultadoTicketCard` con estado VENDIDO, categoría VIP, bloque A.
Ingresar un ID inválido muestra "Ticket no encontrado". Ingresar un ticket ANULADO muestra alerta roja.

- [ ] T005 [US1+US2] Implementar `useConsultarTicket.ts` con `useQuery`: `staleTime: 0` y `gcTime: 0` para
  garantizar siempre datos frescos; en `onSuccess` guarda el resultado en `accesoStore`
- [ ] T006 [US1+US2] Implementar `EstadoAccesoBadge.tsx`: badge de color según `EstadoTicketAcceso` (verde para
  VENDIDO, rojo para CANCELADO/ANULADO, amarillo para RESERVADO)
- [ ] T007 [US1+US2] Implementar `ResultadoTicketCard.tsx`: muestra ticketId, estado (badge grande), categoría,
  bloque, coordenadaAcceso, eventoId y fechaEvento formateada — diseño de alto contraste con texto grande
- [ ] T008 [US1+US2] Implementar `BuscadorTicket.tsx`: input de texto para ingresar ID manualmente + botón
  "Consultar"; diseñado para futura integración con lector de QR
- [ ] T009 [US1+US2] Implementar `HistorialConsultasPanel.tsx`: lista las últimas 20 consultas del `accesoStore`
  con ID, resultado (VÁLIDO/INVÁLIDO) y timestamp
- [ ] T010 [US1+US2] Implementar `AccesoPage.tsx`: `BuscadorTicket` en posición prominente, área de resultado
  (`ResultadoTicketCard` o mensaje de error), `HistorialConsultasPanel` colapsable

**Checkpoint**: Consulta de estado funcional con resultado completo en pantalla

---

## Phase 3: User Story 3 — Metadatos de Evento en la Respuesta (Priority: P2)

**Goal**: La tarjeta del ticket muestra `eventoId` y `fechaEvento` para que el operador detecte tickets de eventos
distintos al actual.

**Independent Test**: Un ticket de un evento anterior muestra la fecha del evento original en la tarjeta, diferente
al evento activo. El operador puede ver que el ticket no corresponde al evento en curso.

- [ ] T011 [US3] Actualizar `ResultadoTicketCard.tsx`: confirmar que ya muestra `eventoId` y `fechaEvento`;
  agregar indicador visual si la `fechaEvento` es anterior a hoy (sesión inválida)

**Checkpoint**: Metadatos de evento visibles con alerta de sesión inválida

---

## Phase 4: Estructura del Recinto (Priority: P2)

**Goal**: El operador puede consultar la estructura completa del recinto (bloques, categorías, coordenadas de acceso)
para orientarse en el venue.

**Independent Test**: Navegar a `/acceso/recinto/:id` muestra la tabla de bloques con categoría y coordenada.
Recinto inexistente muestra error 404.

- [ ] T012 Implementar `useRecintoEstructuraAcceso.ts` con `useQuery`
- [ ] T013 Implementar `EstructuraRecintoTable.tsx`: tabla con columnas categoría y coordenada de acceso por bloque
- [ ] T014 Implementar `EstructuraRecintoPage.tsx`: carga y muestra `EstructuraRecintoTable`

**Checkpoint**: Consulta de estructura del recinto funcional

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T015 Configurar `staleTime: 0` globalmente para los hooks de acceso — nunca servir datos cacheados
- [ ] T016 Optimizar la UI para pantallas táctiles: targets de al menos 44px, texto mínimo 16px
- [ ] T017 Manejar estado de carga con skeleton de tamaño fijo para evitar layout shift al responder la consulta
- [ ] T018 Confirmar que `accesoStore` persiste el historial en `localStorage` para acceso offline

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Depende de los features 001 y 004 completados
- **US1+US2 (Phase 2)**: Depende de Foundational
- **US3 (Phase 3)**: Depende de Phase 2 — extiende `ResultadoTicketCard`
- **Estructura (Phase 4)**: Depende de Foundational — puede ejecutarse en paralelo con Phases 2 y 3
- **Polish (Phase 5)**: Depende de todas las fases

### Dentro de cada User Story

- Tipos y servicio antes que hooks
- Hooks antes que componentes y páginas
- Verificar checkpoint antes de pasar a la siguiente fase

---

## Notes

- **Sin caché**: usar `staleTime: 0` y `gcTime: 0` en todos los hooks de este feature — el estado de un ticket puede
  cambiar en milisegundos durante el ingreso al evento
- **Historial local**: el historial en `accesoStore` es de solo lectura y persiste en `localStorage`; si el operador
  cierra el navegador, el historial se conserva
- **Lector de QR**: el `BuscadorTicket` está diseñado para recibir el ID como texto; cuando se integre un lector de
  QR físico, el input recibirá el escaneo como un keydown event seguido de Enter — el componente ya maneja eso si el
  input tiene autofocus
- **Sesión inválida**: mostrar alerta visible cuando `fechaEvento` difiere del evento activo — el operador debe poder
  identificar inmediatamente un ticket del día equivocado
