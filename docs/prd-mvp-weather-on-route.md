# PRD MVP - Outia (Weather on Route AI)

Version: 0.1  
Fecha: 2026-02-16  
Estado: Draft para validacion de producto/tecnica

## 1. Contexto y oportunidad

Las apps actuales de "weather on the way" validan clima por ruta, pero aun tienen friccion en UX y poca capa conversacional. La oportunidad es lanzar un producto mobile-first con:

- Planeacion de viaje por fecha/hora.
- Vista semanal arriba (widget/timeline semanal) para decidir cuando salir.
- Mapa con hitos de clima a lo largo de la ruta.
- Asistente AI por voz para decisiones antes y durante el viaje.

Competidor principal: Weather on the Way (iOS), con foco fuerte en radar, timeline y alertas de riesgo en ruta.

## 2. Objetivo del MVP

Entregar en 8-10 semanas una app usable de punta a punta para planificar viajes por ruta con clima por tramo y recomendaciones accionables.

## 3. Objetivos y no-objetivos

Objetivos MVP:

- Permitir crear ruta A-B con fecha/hora de salida.
- Mostrar clima proyectado por tramos de la ruta segun ETA.
- Mostrar resumen semanal en la parte superior para comparar dias.
- Emitir alertas de riesgo (lluvia intensa, tormenta, nieve/hielo cuando aplique).
- Incluir asistente AI por voz para preguntas clave de decision.

No-objetivos MVP:

- Navegacion turn-by-turn en tiempo real (se integra con apps externas).
- CarPlay/Android Auto completo.
- Prediccion hiperlocal propietaria.
- Cobertura global con misma profundidad en todos los paises.

## 4. Usuario objetivo y JTBD

Segmentos primarios:

- Conductores de viajes interurbanos (2h-12h).
- Familias que planifican salidas de fin de semana.
- Conductores frecuentes (comerciales/light logistics).

JTBD:

- "Quiero saber que dia y hora me conviene salir para evitar mal clima."
- "Quiero ver en que parte exacta de la ruta tendre riesgo."
- "Quiero una recomendacion clara sin tener que interpretar 5 apps."

## 5. Benchmark competitivo (resumen)

Weather on the Way hoy comunica y/o ofrece:

- Clima en ruta con "timeline" por horas.
- Radar en vivo, riesgo de camino mojado/nevado/hielo.
- Integraciones con apps de navegacion.
- CarPlay y Dynamic Island.
- Modelo de monetizacion por suscripcion (en App Store figura plan anual aprox. ARS 21.999 y mensual ARS 4.500; precio puede variar por tienda/pais/fecha).

Gap de oportunidad para Outia:

- UX mas clara en comparacion de dias (weekly widget como entrada principal).
- Experiencia AI-native real (no solo tarjetas estaticas).
- Mejor experiencia conversacional por voz para decision y seguimiento.

## 6. Propuesta de valor MVP

"Planifica tu viaje por ruta con clima por tramo y recomendaciones conversacionales, eligiendo el mejor dia y hora para salir."

Diferenciadores MVP:

- Weekly planner arriba para elegir dia de salida en segundos.
- Route Weather Map con marcadores por tramo + severidad visual.
- AI Voice Copilot para responder "salgo hoy o manana?" y "que tramo es mas riesgoso?".

## 7. Alcance funcional MVP

### 7.1 Pantallas principales

- Onboarding + Sign in/up (Clerk).
- Home/Planner: widget semanal (7 dias) con score por dia, selector origen/destino/paradas, selector fecha/hora de salida.
- Route Screen: mapa con ruta y weather markers por tramo, tarjetas de riesgo por tramo y resumen total, bottom sheet con timeline del viaje.
- AI Assistant: entrada por voz y texto, respuestas con recomendacion explicita + razon.

### 7.2 Reglas de negocio clave

- Cada ruta se muestrea por tiempo (ej: cada 30-45 min de ETA) y por distancia maxima (ej: 50 km), lo que ocurra primero.
- Para cada punto muestreado se consulta clima en timestamp estimado de llegada.
- El sistema calcula un `Route Risk Score` (0-100) ponderando precip prob/intensidad, tormenta/severe alert, nieve/hielo (cuando aplique) y viento fuerte.
- Se genera `Day Score` para cada dia de la semana en el widget superior.

### 7.3 Alertas MVP

- Pre-viaje: aviso si el riesgo total supera umbral configurable.
- Ventana de salida sugerida: "Mejor salir 2h antes/despues".
- Alertas por tramo critico.

## 8. Arquitectura tecnica (stack solicitado)

Stack base:

- App: Expo (React Native) + BNA UI.
- Auth: Clerk.
- Backend/state: Convex (queries, mutations, actions, cron).

Servicios externos:

- Routing/maps: Google Maps Platform (MVP recomendado).
- Weather EEUU: NOAA/NWS.
- Weather LATAM/global fallback: OpenWeather (MVP recomendado).
- Opcion fase 2 para alerts premium: Tomorrow.io.

Arquitectura logica:

- Cliente Expo: render de mapa, planner semanal, timeline, UI de alertas, voice UI.
- Convex: persistencia de rutas, snapshots de clima, preferencias de usuario, orquestacion de consultas externas via `actions`, caching por ventana temporal.
- Proveedor adapter layer: `routeProvider` (Google Routes API inicialmente), `weatherProviderUS` (NOAA), `weatherProviderGlobal` (OpenWeather), `riskEngine` (normaliza y puntua riesgo).

## 9. Modelo de datos inicial (Convex)

Tablas sugeridas:

- `users`
- `trips`
- `trip_legs`
- `trip_weather_points`
- `trip_daily_scores`
- `alerts`
- `saved_routes`
- `assistant_conversations`
- `assistant_messages`

Campos minimos clave:

- `trips`: userId, origin, destination, stops, departureAt, timezone, status.
- `trip_weather_points`: tripId, lat, lon, etaAt, conditionCode, precipProb, temp, wind, alertType, riskScore.
- `trip_daily_scores`: tripId, date, score, summary.

## 10. Recomendacion de proveedores (MVP)

### 10.1 Mapas/routing

Recomendacion MVP: **Google Maps Platform**.

Razon:

- Integracion mas directa en Expo con `react-native-maps`.
- Rutas con trafico y alternativas maduras.
- Pricing inicial claro para prototipar (ejemplo publicado: Compute Routes Essentials con free tier mensual y luego costo por 1.000 requests).

Keep in view:

- HERE: fuerte en routing enterprise, pero mayor complejidad comercial/integracion para un MVP pequeno.
- Mapbox: viable, pero en Expo suele requerir development build y configuracion nativa, aumentando tiempo de salida.

### 10.2 Weather/alerts

Recomendacion MVP: **NOAA (EEUU) + OpenWeather (LATAM/global)**.

Razon:

- NOAA/NWS: excelente fuente publica para EEUU y alertas oficiales.
- OpenWeather: cobertura global con One Call + weather alerts en multiples paises.
- Reduce dependencia de un proveedor unico y permite optimizar costo por region.

Tomorrow.io:

- Buena opcion para fase 2 si se busca capa premium de alertas, nowcasting y SLA comercial.

## 11. AI-native first + Voice AI (MVP realista)

Objetivo MVP:

- No solo "chat". Debe entregar recomendacion accionable con contexto de ruta.

Capacidades MVP:

- Input por voz.
- Intentos soportados: "Compara salir hoy vs manana", "Donde esta el tramo mas peligroso?", "Dame hora recomendada para salir".
- Tool calling interno: `getTripSummary(tripId)`, `getRiskBySegment(tripId)`, `suggestDepartureWindow(tripId)`.
- Output estructurado: recomendacion corta, razones (max 3), nivel de confianza.

Implementacion sugerida:

- Captura audio en app + transcripcion/modelo en backend.
- Respuesta textual + TTS para lectura en voz.

## 12. UX/UI principios para superar al competidor

- Pantalla inicial orientada a decision (semana visible arriba).
- Menos ruido visual, mas jerarquia de riesgo.
- Color semantico consistente por severidad.
- Mapa como canvas principal, timeline como capa secundaria.
- AI card siempre visible para "siguiente mejor accion".

## 13. KPIs MVP

North Star:

- `% de viajes planificados con recomendacion aceptada` (usuario mantiene/reagenda segun sugerencia).

Metricas de producto:

- Activacion D0: crear primer viaje en <3 min.
- Uso semanal: rutas planificadas por usuario activo.
- Retencion D7/D30.
- CTR de alertas criticas.
- Accuracy percibida (rating post-viaje 1-5).

Metricas tecnicas:

- Tiempo de calculo de ruta+clima <5s p50 y <12s p95.
- Fallos de proveedor externo <2%.
- Costo promedio por viaje bajo umbral definido.

## 14. Roadmap de entrega (8-10 semanas)

Semana 1-2:

- Definicion API adapters, esquema Convex y flujo base de trip.
- UI foundation (planner semanal + mapa base).

Semana 3-4:

- Integracion routing + muestreo de ruta + weather join por ETA.
- Risk engine v1 + markers en mapa.

Semana 5-6:

- Alertas pre-viaje y sugerencia de ventana de salida.
- Persistencia de rutas guardadas.

Semana 7-8:

- AI voice assistant v1 (intents acotados + tool calls).
- Telemetria, tuning UX y hardening.

Semana 9-10 (buffer opcional):

- Beta cerrada, ajustes de precision/performance, preparacion de release.

## 15. Riesgos y mitigaciones

Riesgo:

- Diferencias de calidad entre proveedores por region.
- Mitigacion: capa de normalizacion + fallback por proveedor.

Riesgo:

- Costos de APIs crecen con uso.
- Mitigacion: caching por ventana temporal, muestreo adaptativo, limites por plan.

Riesgo:

- Voice UX compleja para primer release.
- Mitigacion: intents cerrados y respuestas estructuradas antes de ampliar open-ended chat.

Riesgo:

- Integracion de mapas compleja en iOS/Android.
- Mitigacion: usar opcion con menor friccion en Expo para MVP y posponer features nativas avanzadas.

## 16. Decisiones cerradas (v0.2)

### 16.1 Geos LATAM para MVP

Se define lanzar MVP LATAM en:

- Argentina (`AR`)
- Chile (`CL`)
- Uruguay (`UY`)
- Brasil (`BR`)
- Mexico (`MX`)
- Paraguay (`PY`)
- Ecuador (`EC`)

Razon:

- Cobertura robusta de routing con Google Maps.
- OpenWeather publica fuentes de alertas nacionales para estos paises (segun lista oficial de agencias en One Call 3.0).
- Balancea alcance comercial y complejidad operativa para MVP.

Geo backlog (post-MVP por validacion de calidad de alertas):

- Colombia (`CO`)
- Peru (`PE`)
- Bolivia (`BO`)
- Centroamerica adicional

### 16.2 Tope de costo mensual (MVP)

Se define un tope mensual de costos variables de APIs externas de **USD 450/mes** para etapa MVP beta.

Sub-caps operativos:

- Maps/routing (Google): **USD 100/mes**
- Weather (NOAA + OpenWeather): **USD 250/mes**
- AI voice (STT/TTS/LLM): **USD 100/mes**

Guardrails de control:

- Al 80% del presupuesto mensual: bajar granularidad de muestreo de ruta (ej. de 30-45 min a 60 min).
- Al 100%: desactivar recálculos automaticos y mantener modo consulta manual.
- Presupuesto diario maximo: `USD 15/dia` promedio (con alertas internas al superar `USD 12/dia`).

KPI de unit economics objetivo:

- Costo variable por viaje planificado <= **USD 0.20**.
- Costo variable por usuario activo mensual <= **USD 0.60**.

## 17. Preguntas abiertas para cerrar PRD v1.0

- Necesitas modo sin login para pruebas rapidas?
- CarPlay entra como feature roadmap o no-go hasta v2?

## 18. Fuentes de research

- Weather on the Way - App Store: https://apps.apple.com/us/app/weather-on-the-way/id1471394318
- Weather on the Way - Sitio oficial: https://www.weatherontheway.app/
- NOAA / NWS API docs: https://www.weather.gov/documentation/services-web-api
- NOAA Weather Radio coverage (EEUU/territorios): https://www.weather.gov/nwr/coverage/station_listing
- OpenWeather pricing (One Call 3.0): https://openweathermap.org/price
- OpenWeather alerts docs: https://openweathermap.org/api/one-call-3
- Google Maps Platform pricing (Routes): https://mapsplatform.google.com/pricing/
- Google Routes API docs: https://developers.google.com/maps/documentation/routes
- Expo maps integration (`react-native-maps`): https://docs.expo.dev/versions/latest/sdk/map-view/
- Mapbox pricing overview: https://www.mapbox.com/pricing
- Mapbox React Native install docs: https://rnmapbox.github.io/docs/install
- HERE SDK for native platforms: https://www.here.com/developer/here-sdk
- OpenAI Realtime API (voice/speech workflows): https://platform.openai.com/docs/guides/realtime
- Expo Speech (TTS): https://docs.expo.dev/versions/latest/sdk/speech/
