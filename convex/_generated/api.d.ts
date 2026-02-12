/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as assets from "../assets.js";
import type * as crons from "../crons.js";
import type * as deployments from "../deployments.js";
import type * as documents from "../documents.js";
import type * as flags from "../flags.js";
import type * as fx from "../fx.js";
import type * as marketData from "../marketData.js";
import type * as portfolioGoals from "../portfolioGoals.js";
import type * as portfolios from "../portfolios.js";
import type * as search from "../search.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analytics: typeof analytics;
  articles: typeof articles;
  assets: typeof assets;
  crons: typeof crons;
  deployments: typeof deployments;
  documents: typeof documents;
  flags: typeof flags;
  fx: typeof fx;
  marketData: typeof marketData;
  portfolioGoals: typeof portfolioGoals;
  portfolios: typeof portfolios;
  search: typeof search;
  transactions: typeof transactions;
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
