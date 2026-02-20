# Outia UI Spec v1

Fecha: 2026-02-17
Estado: Draft listo para diseño e implementación

## 1. North Star

Una sola dirección visual y funcional:

1. `Map-first` real. El mapa es el canvas principal en Home, Plan, Briefing y Drive.
2. `Bottom sheet fijo` como contenedor único de contenido, con snaps definidos.
3. `Liquid glass oscuro` consistente en header, chips, cards y menús.
4. Producto orientado a decisión, no solo a visualización de clima.

## 2. Principios de coherencia

1. No mezclar estilos de distintas apps en una misma pantalla.
2. Un solo acento primario para acciones (`azul`).
3. Colores de riesgo reservados a semántica (`verde/ámbar/rojo`).
4. Una sola familia tipográfica: `SF Pro`.
5. Una sola lógica de elevación: glass + borde sutil + sombra suave.

## 3. Sistema visual base

## 3.1 Tokens de color

| Token | Valor | Uso |
|---|---|---|
| `bg/map-overlay` | `#0B1220AA` | capa sutil sobre mapa |
| `glass/surface` | `#11182766` | fondo de paneles glass |
| `glass/border` | `#FFFFFF24` | borde de paneles |
| `text/primary` | `#F8FAFC` | títulos |
| `text/secondary` | `#CBD5E1` | subtítulos |
| `action/primary` | `#2F80FF` | CTA y selección |
| `risk/low` | `#22C55E` | riesgo bajo |
| `risk/medium` | `#F59E0B` | riesgo medio |
| `risk/high` | `#EF4444` | riesgo alto |

## 3.2 Blur levels por snap

| Nivel | Blur | Opacidad panel |
|---|---|---|
| `L1` (sheet 16%) | 12 | 0.44 |
| `L2` (sheet 44%) | 18 | 0.54 |
| `L3` (sheet 86%) | 24 | 0.64 |

Regla: el blur cambia por snap, no por cada frame.

## 3.3 Tipografía y layout

1. `Title/L`: 34 semibold.
2. `Title/M`: 24 semibold.
3. `Body`: 17 regular.
4. `Caption`: 13 medium.
5. Radius: chips 16, cards 20, sheet/header 24.
6. Spacing: 8, 12, 16, 24.

## 4. Arquitectura de navegación

Tabs persistentes:

1. `Inicio`
2. `Alertas`
3. `Ajustes`

Flujo principal dentro de `Inicio`:

1. Home `Map-first`
2. Plan de ruta
3. Briefing IA
4. Drive mode

## 5. Componentes globales

## 5.1 Header glass flotante

Contenido:

1. Línea 1: `Origen → Destino`.
2. Línea 2: `Salida recomendada`.
3. Acciones: `Share`, `Abrir en navegación`.

Estados:

1. `Expanded`: altura 92.
2. `Compact`: altura 64.
3. `Minimal`: altura 52, solo resumen + iconos.

## 5.2 Bottom sheet fijo

Snaps:

1. `Peek` 16%: resumen rápido.
2. `Mid` 44%: timeline corto y métricas.
3. `Full` 86%: detalle completo.

## 5.3 Barra de CTA persistente

Botones:

1. Primario: `Comenzar viaje`.
2. Secundario: `Abrir en Waze/Google Maps`.

## 6. Pantalla 1: Home map-first

Objetivo: entrar y entender estado del viaje en 3 segundos.

## 6.1 Estado sin viaje activo

Mapa con ubicación actual + header simple + sheet en `Peek`.

Copy:

1. Header: `¿A dónde vamos hoy?`
2. Campo principal: `Buscar destino`
3. Acción rápida: `Usar salida ahora`
4. CTA: `Planificar viaje`

## 6.2 Estado con viaje activo

Mapa con ruta y marcadores de eventos climáticos.

KPIs en sheet `Peek`:

1. `ETA`.
2. `Riesgo total`.
3. `Min en clima severo`.

Copy:

1. Título: `Córdoba → Corralitos`
2. Subtítulo: `Salida recomendada 08:20 (mejor +20 min)`
3. Badge riesgo: `Riesgo medio`
4. CTA primario: `Comenzar viaje`
5. CTA secundario: `Abrir en navegación`

## 6.3 Interacciones

1. Drag sheet a `Mid`: muestra mini timeline de próximos 3 eventos.
2. Tap marcador en mapa: centra evento y abre card contextual.
3. Long press en mapa: `Agregar parada`.

## 7. Pantalla 2: Plan de ruta

Objetivo: definir viaje con mínima fricción.

Layout:

1. Header glass.
2. Sheet en `Full` por defecto.
3. Mapa visible detrás con preview de ruta.

Campos:

1. `Origen`.
2. `Destino`.
3. `Paradas` opcional.
4. `Salida` (ahora o programada).
5. `Perfil de riesgo` (Conservador, Balanceado, Rápido).

Copy exacto:

1. Label origen: `Desde`
2. Placeholder origen: `Tu ubicación actual`
3. Label destino: `Hasta`
4. Placeholder destino: `Buscar destino`
5. Label salida: `Cuándo salís`
6. CTA principal: `Analizar con IA`

Resultado al enviar:

1. Transición automática a Briefing IA.

## 8. Pantalla 3: Briefing IA (pre-viaje)

Objetivo: recomendar decisión clara antes de salir.

## 8.1 Bloques del sheet

1. Bloque `Recomendación IA`.
2. Bloque `Comparativa de salidas`.
3. Bloque `Comparativa de rutas`.
4. Bloque `Timeline accionable`.

## 8.2 Copy exacto de recomendación

1. Título: `Recomendación IA`
2. Mensaje principal: `Salí a las 08:20 para evitar el frente de lluvia en km 188.`
3. Impacto: `Ahorrás 18 min en clima severo con +6 min de ETA.`
4. Acción rápida: `Aplicar hora recomendada`

## 8.3 Tarjetas de comparación

Tarjeta tipo:

1. `Salir ahora` / `Salir +20 min` / `Salir +40 min`
2. `ETA`
3. `Riesgo`
4. `Min severos`

Colores:

1. Mejor opción con borde azul.
2. Riesgo alto en rojo.

## 8.4 CTA final

1. Primario: `Comenzar viaje con esta recomendación`
2. Secundario: `Abrir en navegación`

## 9. Pantalla 4: Drive mode

Objetivo: cero distracción y alertas útiles en marcha.

Layout:

1. Header minimal glass con `ETA` y `próximo evento`.
2. Mapa full.
3. Sheet en `Peek` bloqueado por defecto.
4. Card de evento emergente cuando hay riesgo.

Copy de evento:

1. Título: `Lluvia intensa en 12 min`
2. Contexto: `Km 144 · duración estimada 9 min`
3. Acción 1: `Ver alternativa`
4. Acción 2: `Seguir igual`

Reglas:

1. No mostrar listas largas durante conducción.
2. Priorización por voz para alertas críticas.
3. Interacción principal con botones grandes y pocas opciones.

## 10. Alertas y estados críticos

## 10.1 Sin conexión

1. Mensaje: `Sin conexión. Mostrando última ruta sincronizada.`
2. Acción: `Reintentar`.

## 10.2 Sin permisos de ubicación

1. Mensaje: `Activá ubicación para recomendaciones en tiempo real.`
2. Acción: `Abrir ajustes`.

## 10.3 Sin riesgo relevante

1. Mensaje: `Ruta estable. Sin eventos climáticos críticos.`
2. Acción: `Iniciar igual`.

## 11. Motion y transición

1. Snap sheet: 280ms, curva `easeOut`.
2. Compactación header: 220ms.
3. Cambio de focus en mapa al tocar evento: 300ms.
4. Entrada de alerta crítica: 180ms.
5. Evitar animaciones simultáneas de alta complejidad.

## 12. Plan de implementación sugerido

Semana 1:

1. Refactor Home a `map-first`.
2. Header glass reactivo + sheet con snaps.
3. CTA persistente.

Semana 2:

1. Briefing IA completo.
2. Tarjetas comparativas de salida/ruta.
3. Timeline accionable.

Semana 3:

1. Drive mode minimal.
2. Alertas críticas y fallback offline.
3. Ajuste fino de motion y contraste.

## 13. Criterios de éxito

1. Tiempo a primera acción `< 10s` en Home.
2. % de usuarios que usan `Aplicar hora recomendada`.
3. % de sesiones que inician viaje desde CTA principal.
4. Reducción de abandono entre `Plan` y `Comenzar viaje`.
5. NPS percibido de claridad de UI en modo conducción.
