import { create } from 'zustand';

export type HomeState =
  | 'idle'
  | 'searching'
  | 'route_preview'
  | 'comparing_routes'
  | 'scheduling';

export type WeatherLayerType = 'precipitation' | 'clouds' | 'temp' | 'wind';

interface RouteOption {
  id: string;
  label: string;
  distance: string;
  duration: string;
  riskScore: number;
}

interface HomeStore {
  // UI State
  state: HomeState;
  searchSheetVisible: boolean;
  activeWeatherLayer?: WeatherLayerType;

  // Route data
  currentTripId?: string;
  comparisonRoutes: RouteOption[];

  // Actions
  setState: (state: HomeState) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setCurrentTrip: (tripId: string | undefined) => void;
  setWeatherLayer: (layer: WeatherLayerType | undefined) => void;
  setComparisonRoutes: (routes: RouteOption[]) => void;
  reset: () => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
  // Initial state
  state: 'idle',
  searchSheetVisible: false,
  activeWeatherLayer: undefined,
  currentTripId: undefined,
  comparisonRoutes: [],

  // Actions
  setState: (state) => set({ state }),

  openSearch: () => set({
    state: 'searching',
    searchSheetVisible: true,
  }),

  closeSearch: () => set({
    state: 'idle',
    searchSheetVisible: false,
  }),

  setCurrentTrip: (tripId) => set({
    currentTripId: tripId,
    state: tripId ? 'route_preview' : 'idle',
    searchSheetVisible: false,
  }),

  setWeatherLayer: (layer) => set({ activeWeatherLayer: layer }),

  setComparisonRoutes: (routes) => set({
    comparisonRoutes: routes,
    state: routes.length > 0 ? 'comparing_routes' : 'route_preview',
  }),

  reset: () => set({
    state: 'idle',
    searchSheetVisible: false,
    activeWeatherLayer: undefined,
    currentTripId: undefined,
    comparisonRoutes: [],
  }),
}));
