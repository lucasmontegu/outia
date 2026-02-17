/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiSummaries from "../aiSummaries.js";
import type * as alertEngine from "../alertEngine.js";
import type * as alerts from "../alerts.js";
import type * as apiUsage from "../apiUsage.js";
import type * as cronHandlers from "../cronHandlers.js";
import type * as crons from "../crons.js";
import type * as departureOptimizer from "../departureOptimizer.js";
import type * as http from "../http.js";
import type * as lib_apiRetry from "../lib/apiRetry.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_riskEngine from "../lib/riskEngine.js";
import type * as lib_routeSampler from "../lib/routeSampler.js";
import type * as minutelyPrecipCheck from "../minutelyPrecipCheck.js";
import type * as providers_googleRoutes from "../providers/googleRoutes.js";
import type * as providers_llm from "../providers/llm.js";
import type * as providers_weatherAirPollution from "../providers/weatherAirPollution.js";
import type * as providers_weatherForecast5day from "../providers/weatherForecast5day.js";
import type * as providers_weatherNoaa from "../providers/weatherNoaa.js";
import type * as providers_weatherOpenWeather from "../providers/weatherOpenWeather.js";
import type * as providers_weatherRouter from "../providers/weatherRouter.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as savedPlaces from "../savedPlaces.js";
import type * as savedRoutes from "../savedRoutes.js";
import type * as tripDailyScores from "../tripDailyScores.js";
import type * as tripDailyScoresQueries from "../tripDailyScoresQueries.js";
import type * as tripLegs from "../tripLegs.js";
import type * as tripPipeline from "../tripPipeline.js";
import type * as tripWeatherPoints from "../tripWeatherPoints.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiSummaries: typeof aiSummaries;
  alertEngine: typeof alertEngine;
  alerts: typeof alerts;
  apiUsage: typeof apiUsage;
  cronHandlers: typeof cronHandlers;
  crons: typeof crons;
  departureOptimizer: typeof departureOptimizer;
  http: typeof http;
  "lib/apiRetry": typeof lib_apiRetry;
  "lib/errors": typeof lib_errors;
  "lib/riskEngine": typeof lib_riskEngine;
  "lib/routeSampler": typeof lib_routeSampler;
  minutelyPrecipCheck: typeof minutelyPrecipCheck;
  "providers/googleRoutes": typeof providers_googleRoutes;
  "providers/llm": typeof providers_llm;
  "providers/weatherAirPollution": typeof providers_weatherAirPollution;
  "providers/weatherForecast5day": typeof providers_weatherForecast5day;
  "providers/weatherNoaa": typeof providers_weatherNoaa;
  "providers/weatherOpenWeather": typeof providers_weatherOpenWeather;
  "providers/weatherRouter": typeof providers_weatherRouter;
  pushNotifications: typeof pushNotifications;
  savedPlaces: typeof savedPlaces;
  savedRoutes: typeof savedRoutes;
  tripDailyScores: typeof tripDailyScores;
  tripDailyScoresQueries: typeof tripDailyScoresQueries;
  tripLegs: typeof tripLegs;
  tripPipeline: typeof tripPipeline;
  tripWeatherPoints: typeof tripWeatherPoints;
  trips: typeof trips;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
