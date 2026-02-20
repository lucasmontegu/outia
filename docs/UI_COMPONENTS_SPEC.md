# Outia - Especificación de Componentes UI

> Catálogo de componentes reutilizables con sus props, comportamientos y diseño.

---

## Componentes Core

### 1. AdaptiveGlass

Superficie base con liquid glass que se adapta a la plataforma.

```typescript
interface AdaptiveGlassProps {
  children?: React.ReactNode;
  blurLevel?: 'L1' | 'L2' | 'L3';      // 14, 24, 34
  borderRadius?: number;
  showBorder?: boolean;
  tintColor?: string;
  blurTint?: 'light' | 'dark' | 'default';
  pointerEvents?: ViewProps['pointerEvents'];
  style?: StyleProp<ViewStyle>;
}
```

**Cascade de implementación:**
1. iOS con `@expo/ui` → SwiftUI glassEffect
2. iOS fallback → BlurView (expo-blur)
3. Android → Semi-transparent View

**Uso:**
```tsx
<AdaptiveGlass blurLevel="L2" borderRadius={14} showBorder>
  <Text>Content over glass</Text>
</AdaptiveGlass>
```

---

### 2. GlassSearchPill

Botón de búsqueda en forma de cápsula con liquid glass.

```typescript
interface GlassSearchPillProps {
  onPress: () => void;
  placeholder?: string;  // Default: "¿A dónde vamos?"
}
```

**Posición:** Bottom center, `bottom: safeAreaInsets.bottom + 24`

**Animaciones:**
- Entrada: `FadeInUp.duration(200)`
- Salida: `FadeOutDown.duration(150)`

**iOS:** Usa SwiftUI `glassEffect` con `Label` y `systemImage="magnifyingglass"`

---

### 3. FloatingFabs

Stack vertical de FABs con liquid glass.

```typescript
type NavProps = {
  mode: "nav";
  onSettings: () => void;
  onAlerts: () => void;
  onSaved: () => void;
  alertBadgeCount?: number;  // Mostrar badge si > 0
};

type WeatherProps = {
  mode: "weather";
  activeLayer?: WeatherLayerType;
  onToggleLayer: (layer: WeatherLayerType) => void;
};

type FloatingFabsProps = NavProps | WeatherProps;
```

**Posición:** `top: safeAreaInsets.top + 16`, `right: 20` (nav) o `left: 20` (weather)

**Tamaño FAB:** 48x48px, border-radius: 24

**SF Symbols:**
- Settings: `gearshape`
- Alerts: `bell`
- Saved: `bookmark`
- Precipitation: `drop.fill`
- Temperature: `thermometer.medium`

---

### 4. RouteKpiStrip

Chip compacto mostrando distancia y ETA.

```typescript
interface RouteKpiStripProps {
  distance?: string;  // "45 km"
  eta?: string;       // "52 min"
}
```

**Posición:** Top-right, debajo de safe area

**Layout:** Vertical stack, texto alineado a la derecha

---

### 5. WeatherLayerChips

Scroll horizontal de chips para togglear capas de clima.

```typescript
type WeatherLayerType = 'precipitation' | 'clouds' | 'temp' | 'wind';

interface WeatherLayerChipsProps {
  activeLayer?: WeatherLayerType;
  onToggle: (layer: WeatherLayerType | undefined) => void;
  style?: StyleProp<ViewStyle>;
}
```

**Chips:**
| Key | Label | SF Symbol |
|-----|-------|-----------|
| `precipitation` | Lluvia | `drop.fill` |
| `clouds` | Nubes | `cloud.fill` |
| `temp` | Temp | `thermometer.medium` |
| `wind` | Viento | `wind` |

**Estado activo:** Glass más opaco, foregroundStyle primary

---

### 6. RouteActionBar

Barra de acciones inferior para route preview.

```typescript
interface RouteActionBarProps {
  onGoNow: () => void;
  onTimeline: () => void;
  onMore: () => void;
  isLoading?: boolean;
  isTimelineDisabled?: boolean;
}
```

**Layout:** Horizontal, 3 elementos
1. "Timeline" - Glass pill
2. "Ir ahora" - Solid blue CTA (#3B82F6), flex: 1
3. "..." - Glass circle 48x48

**Posición:** Bottom, `bottom: safeAreaInsets.bottom + 16`

---

### 7. GlassSheetBackground

Background component para BottomSheet con liquid glass.

```typescript
interface GlassSheetBackgroundProps extends BottomSheetBackgroundProps {
  tintColor?: string;
  blurLevel?: BlurLevel;
  blurTint?: 'light' | 'dark' | 'default';
}
```

**Border radius:** Solo top corners, `glass.radius.sheetTop` (12px)

**Shadow:** `0 -4px 16px rgba(9, 14, 22, 0.12)`

---

### 8. RouteSearchCard

Card con inputs From/To para búsqueda de ruta.

```typescript
interface RouteSearchCardProps {
  defaultOriginLabel?: string;  // "Tu ubicación"
  onOriginSelect: (place: PlaceResult) => void;
  onDestinationSelect: (place: PlaceResult) => void;
  onSwap?: () => void;
  onComplete: () => void;
}

interface RouteSearchCardRef {
  focusOrigin: () => void;
  focusDestination: () => void;
}
```

**Layout:**
```
┌────────────────────────────────────┐
│ 🔵 Tu ubicación              [↕️]  │
│  │                                 │
│ 🔴 Buscar destino...          |    │
└────────────────────────────────────┘
```

**Colores:**
- Origin dot: `#3B82F6` (blue)
- Destination pin: `#EF4444` (red)
- Vertical line: `rgba(255,255,255,0.20)`

---

### 9. AlertCard

Card individual de alerta con indicador de severidad.

```typescript
interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
  onSwipeRight?: () => void;  // Mark as read
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│🔴│ ⛈️ Título de la alerta          │
│  │ Descripción del mensaje que     │
│  │ puede ocupar hasta 2 líneas     │
│  │                       Hace 5 min│
└─────────────────────────────────────┘
```

**Left border colors:**
- `critical`: `#EF4444`
- `warning`: `#F97316`
- `info`: `#3B82F6`

**Background:** Glass con `blurLevel="L2"`

---

### 10. AlertGroupHeader

Header de sección para agrupar alertas.

```typescript
interface AlertGroupHeaderProps {
  title: string;  // "CRÍTICAS", "ADVERTENCIAS", "INFORMACIÓN"
  severity: AlertSeverity;
  count: number;
}
```

**Estilos:**
- Text: Uppercase, 12px, weight 600
- Color: Tinted según severidad (más sutil que cards)

---

### 11. AISummaryCard

Card mostrando resumen generado por IA.

```typescript
interface AISummaryCardProps {
  recommendation: string;
  reasons: string[];
  confidence: number;  // 0-100
  bestDepartureWindow?: {
    startHour: number;
    endHour: number;
    riskReduction: number;
  };
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ 🤖 Resumen IA                       │
│                                     │
│ "Recommendation text goes here..."  │
│                                     │
│ • Reason 1                          │
│ • Reason 2                          │
│                                     │
│ Confianza: 85%  │  Mejor: 3-5 PM   │
└─────────────────────────────────────┘
```

---

### 12. TripTimeline

Timeline visual de la ruta con puntos de clima.

```typescript
interface TripTimelineProps {
  legs: TripLeg[];
  weatherPoints: WeatherPoint[];
  onSegmentPress?: (legIndex: number) => void;
}
```

**Elementos por segmento:**
- Hora de llegada estimada
- Distancia y duración
- Condición de clima (icono + texto)
- Indicador de riesgo (si > moderate)

---

### 13. WeatherMarker

Marcador de clima para mostrar en el mapa.

```typescript
interface WeatherMarkerProps {
  conditionCode: string;  // "clear", "rain", "snow", etc.
  riskLevel: RiskLevel;
  compact?: boolean;  // Solo mostrar dot de color
  onPress?: () => void;
}
```

**Compact mode:** Solo círculo de 12px con color de riesgo

**Full mode:** Círculo + icono de condición

---

### 14. DepartureSuggestionCard

Card con sugerencia de mejor hora de salida.

```typescript
interface DepartureSuggestionCardProps {
  bestDepartureWindow: {
    startHour: number;
    endHour: number;
    riskReduction: number;  // Porcentaje
  };
  onAccept: () => void;
}
```

**CTA:** "Cambiar a [hora]" - actualiza departureAt del trip

---

### 15. ScheduleDatePicker

Selector de fecha/hora nativo para programar salida.

```typescript
interface ScheduleDatePickerProps {
  initialDate: Date;
  minimumDate?: Date;  // Default: now
  maximumDate?: Date;  // Default: +7 days
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}
```

**iOS:** `@react-native-community/datetimepicker` modo "datetime"

**Android:** Secuencia de date picker + time picker

---

### 16. TurnBanner

Banner de instrucción de giro para navegación activa.

```typescript
interface TurnBannerProps {
  maneuver: 'turn-right' | 'turn-left' | 'straight' | 'u-turn' | 'arrive';
  instruction: string;  // "Gira a la derecha"
  distance: string;     // "en 850 m"
  streetName?: string;  // "Av. Insurgentes Sur"
}
```

**Glass:** Alta opacidad (`glass.surface.sheet`) para mejor legibilidad

**Iconos de giro:** SF Symbols o custom arrows

---

### 17. NavigationInfoPanel

Panel inferior con información de navegación.

```typescript
interface NavigationInfoPanelProps {
  eta: string;              // "11:42"
  remainingTime: string;    // "23 min"
  remainingDistance: string; // "18 km"
  currentSpeed: number;     // km/h
  speedLimit?: number;      // km/h
  weatherAlert?: {
    message: string;
    type: 'warning' | 'info';
  };
}
```

**Speed indicator:**
- Verde si `currentSpeed <= speedLimit`
- Rojo si `currentSpeed > speedLimit`

---

## Componentes de Formulario

### 18. PlaceSearchInput

Input con autocomplete de Google Places.

```typescript
interface PlaceSearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSelect: (place: PlaceResult) => void;
  autoFocus?: boolean;
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
}
```

**Debounce:** 300ms antes de llamar a API

---

### 19. SettingsRow

Row reutilizable para pantalla de settings.

```typescript
type SettingsRowProps =
  | { type: 'toggle'; label: string; value: boolean; onChange: (v: boolean) => void }
  | { type: 'picker'; label: string; value: string; options: string[]; onChange: (v: string) => void }
  | { type: 'link'; label: string; onPress: () => void }
  | { type: 'info'; label: string; value: string }
  | { type: 'action'; label: string; onPress: () => void; destructive?: boolean };
```

**Height:** 52px

**Separators:** `rgba(255,255,255,0.10)`

---

## Animaciones

### Entrada/Salida de Componentes

| Componente | Entering | Exiting |
|------------|----------|---------|
| GlassSearchPill | FadeInUp(200) | FadeOutDown(150) |
| FloatingFabs (right) | FadeInRight(200) | FadeOutRight(150) |
| FloatingFabs (left) | FadeInLeft(200) | FadeOutLeft(150) |
| AlertCard | FadeInRight(200).delay(index * 50) | FadeOutLeft(150) |
| Sheet content | FadeInUp(200) | - |

### Layout Transitions

Usar `LinearTransition` de reanimated para cambios de layout suaves.

---

## Estructura de Carpetas Propuesta

```
src/
├── components/
│   ├── ui/                      # Componentes base
│   │   ├── adaptive-glass.tsx
│   │   ├── glass-button.tsx
│   │   └── settings-row.tsx
│   │
│   ├── map/                     # Componentes de mapa
│   │   ├── route-map.tsx
│   │   ├── glass-search-pill.tsx
│   │   ├── floating-fabs.tsx
│   │   ├── route-kpi-strip.tsx
│   │   ├── route-action-bar.tsx
│   │   ├── weather-layer-chips.tsx
│   │   ├── weather-marker.tsx
│   │   └── glass-sheet-background.tsx
│   │
│   ├── search/                  # Componentes de búsqueda
│   │   ├── expandable-search-sheet.tsx
│   │   ├── route-search-card.tsx
│   │   ├── place-search-input.tsx
│   │   └── recent-places-list.tsx
│   │
│   ├── route/                   # Componentes de ruta
│   │   ├── ai-summary-card.tsx
│   │   ├── trip-timeline.tsx
│   │   ├── segment-detail-card.tsx
│   │   └── departure-suggestion-card.tsx
│   │
│   ├── alerts/                  # Componentes de alertas
│   │   ├── alert-card.tsx
│   │   └── alert-group-header.tsx
│   │
│   └── drive/                   # Componentes de navegación
│       ├── turn-banner.tsx
│       ├── navigation-info-panel.tsx
│       └── speed-indicator.tsx
│
├── app/
│   └── (app)/
│       ├── _layout.tsx
│       ├── home/
│       │   ├── _layout.tsx
│       │   └── index.tsx
│       ├── drive/
│       │   └── [tripId].tsx
│       ├── route/
│       │   └── [tripId].tsx
│       ├── alerts.tsx
│       ├── saved-routes.tsx
│       ├── settings.tsx
│       └── paywall.tsx
│
├── stores/                      # Zustand stores
│   ├── home-store.ts
│   └── search-store.ts
│
├── hooks/                       # Custom hooks
│   ├── useTrip.ts
│   ├── useTripPlanner.ts
│   └── useColors.ts
│
└── theme/
    ├── glass-tokens.ts
    └── risk-colors.ts
```

---

## Checklist de Implementación

### Fase 1: Core UI
- [ ] AdaptiveGlass (verificar SwiftUI)
- [ ] GlassSearchPill
- [ ] FloatingFabs
- [ ] GlassSheetBackground

### Fase 2: Home Screen
- [ ] Home layout con RouteMap
- [ ] Integración de estados (idle → route_preview)
- [ ] RouteKpiStrip
- [ ] RouteActionBar

### Fase 3: Search
- [ ] ExpandableSearchSheet
- [ ] RouteSearchCard
- [ ] PlaceSearchInput
- [ ] RecentPlacesList

### Fase 4: Route Details
- [ ] AISummaryCard
- [ ] TripTimeline
- [ ] SegmentDetailCard
- [ ] DepartureSuggestionCard

### Fase 5: Alerts
- [ ] AlertCard
- [ ] AlertGroupHeader
- [ ] Alerts screen con agrupación

### Fase 6: Drive Mode
- [ ] TurnBanner
- [ ] NavigationInfoPanel
- [ ] SpeedIndicator
- [ ] Drive screen completa

### Fase 7: Settings & Paywall
- [ ] SettingsRow
- [ ] Settings screen
- [ ] Paywall screen

---

*Documento generado para el equipo de desarrollo de Outia*
