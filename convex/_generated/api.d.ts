/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as assets from "../assets.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as flags from "../flags.js";
import type * as goals from "../goals.js";
import type * as marketData from "../marketData.js";
import type * as portfolios from "../portfolios.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analytics: typeof analytics;
  articles: typeof articles;
  assets: typeof assets;
  crons: typeof crons;
  documents: typeof documents;
  flags: typeof flags;
  goals: typeof goals;
  marketData: typeof marketData;
  portfolios: typeof portfolios;
  transactions: typeof transactions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
