/**
 * Analytics Module
 *
 * Comprehensive analytics infrastructure for Wau storefronts
 * - Event tracking (page views, clicks, conversions)
 * - UTM parameter support
 * - Session management
 * - Query functions for analytics dashboards
 */

// Server Actions (tracking events)
export {
  trackPageView,
  trackProductClick,
  trackLeadSubmission,
  trackPurchase,
} from "./actions";

// Query Functions (reading analytics)
export {
  getStoreAnalytics,
  getProductAnalytics,
  getTrafficSources,
  getTopProducts,
} from "./queries";

// Client Hooks
export { useAnalytics, extractUtmParams } from "./hooks/use-analytics";

// Validation Schemas
export {
  trackPageViewSchema,
  trackProductClickSchema,
  trackLeadSubmissionSchema,
  trackPurchaseSchema,
  utmParamsSchema,
  sessionSchema,
} from "./schemas";

// Types
export type {
  TrackPageViewInput,
  TrackProductClickInput,
  TrackLeadSubmissionInput,
  TrackPurchaseInput,
  UtmParams,
  SessionData,
} from "./schemas";
