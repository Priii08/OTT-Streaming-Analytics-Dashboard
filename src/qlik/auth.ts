import { qlikConfig, tenantBaseUrl } from "./config";

const CSRF_STORAGE_KEY = "qlik-csrf-token";

/**
 * The URL param we append to the returnto URL so the app can detect it
 * has just come back from a Qlik login redirect.
 */
const RETURN_MARKER = "qlik_auth_return";

/**
 * Resolve the app origin that will be used as the `returnto` URL.
 *
 * Priority:
 *  1. VITE_APP_ORIGIN env var  — the canonical, whitelisted origin you control
 *  2. window.location.origin   — the actual browser origin (fallback)
 *
 * CRITICAL: Whatever value this returns MUST be listed in the Qlik Cloud
 * Management Console → Web Integrations → Allowed origins.
 * The whitelist entry must be the bare origin (no trailing slash, no path).
 */
export function resolvedAppOrigin(): string {
  // Use the explicitly configured origin when available. This is the safest
  // choice because it is the URL you actually whitelisted in Qlik.
  if (qlikConfig.appOrigin) {
    // .trim() removes the \n newline that .env file line-endings inject into the
    // value — without this, the URL contains %0A and Qlik rejects it (LOGIN-10).
    return qlikConfig.appOrigin.trim().replace(/\/$/, "");
  }
  // Fall back to the real browser origin (no trailing slash by spec).
  return window.location.origin;
}

/**
 * Fetch a server-issued CSRF token from Qlik Cloud.
 *
 * Qlik's CSRF token MUST come from the server — it is cryptographically bound
 * to the current session. Generating a random string locally will cause every
 * subsequent API call and WebSocket upgrade to be rejected with a 401.
 *
 * The token is cached in sessionStorage for the lifetime of the tab. It is
 * cleared on any 401/403 so a stale cached value can never be reused.
 */
export async function fetchCsrfToken(): Promise<string> {
  const cached = window.sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${tenantBaseUrl()}/api/v1/csrf-token`, {
    method: "GET",
    credentials: "include",
    headers: {
      "qlik-web-integration-id": qlikConfig.webIntegrationId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token from Qlik Cloud (HTTP ${response.status})`);
  }

  const token = response.headers.get("qlik-csrf-token");
  if (!token) {
    throw new Error(
      "Qlik Cloud did not return a qlik-csrf-token header. " +
      "Ensure the browser session cookie is present and the Web Integration ID is correct."
    );
  }

  window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  return token;
}

/**
 * Clear the cached CSRF token (call after any 401/403 to force a fresh fetch).
 */
export function clearCsrfToken(): void {
  window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
}

/**
 * Build the Qlik login URL.
 *
 * How Qlik validates the `returnto` parameter:
 *   Qlik extracts the ORIGIN from the returnto URL and checks it against the
 *   "Allowed origins" list of the Web Integration identified by the
 *   qlik-web-integration-id query parameter.
 *
 *   If the origin is not in the list → LOGIN-10 (401).
 *
 * What we send as returnto:
 *   <resolvedAppOrigin()>/?qlik_auth_return=1
 *
 *   The origin used is VITE_APP_ORIGIN (if set in your env) OR
 *   window.location.origin. Both must match the Qlik whitelist entry exactly.
 *
 *   The ?qlik_auth_return=1 query string is used by this app to detect that
 *   we just came back from a Qlik login redirect, preventing infinite loops.
 */
export function buildQlikLoginUrl(): string {
  const origin = resolvedAppOrigin();

  // Log so you can see EXACTLY what is being sent as returnto.
  console.log("[Qlik Auth] origin resolved to:", origin);
  console.log("[Qlik Auth] window.location.origin is:", window.location.origin);

  // Build the returnto URL. The origin is what Qlik validates against the
  // whitelist — the path and query string are ignored by Qlik's check.
  const returnTo = `${origin}/?${RETURN_MARKER}=1`;

  const params = new URLSearchParams({
    "qlik-web-integration-id": qlikConfig.webIntegrationId,
    returnto: returnTo,
  });

  const loginUrl = `${tenantBaseUrl()}/login?${params.toString()}`;
  console.log("[Qlik Auth] full login URL:", loginUrl);
  console.log("[Qlik Auth] returnto value:", returnTo);
  return loginUrl;
}

/**
 * Returns the returnto URL that would be sent to Qlik right now.
 * Used by the debug UI panel to display the exact value.
 */
export function debugReturnToUrl(): string {
  const origin = resolvedAppOrigin();
  return `${origin}/?${RETURN_MARKER}=1`;
}

/**
 * Returns true if the current page load is a Qlik post-login redirect.
 */
function isQlikReturnRedirect(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has(RETURN_MARKER);
}

/**
 * Strip the auth return marker from the URL so it is not bookmarked.
 */
function cleanUpReturnMarker(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has(RETURN_MARKER)) {
      url.searchParams.delete(RETURN_MARKER);
      window.history.replaceState({}, "", url.toString());
    }
  } catch {
    // Non-critical.
  }
}

/**
 * Check whether the current browser has an active Qlik Cloud session.
 */
export async function hasQlikSession(): Promise<boolean> {
  let csrfToken: string;
  try {
    csrfToken = await fetchCsrfToken();
  } catch {
    return false;
  }

  const response = await fetch(`${tenantBaseUrl()}/api/v1/users/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "qlik-web-integration-id": qlikConfig.webIntegrationId,
      "qlik-csrf-token": csrfToken,
      Accept: "application/json",
    },
  });

  if (response.ok) {
    return true;
  }

  if (response.status === 401 || response.status === 403) {
    clearCsrfToken();
    return false;
  }

  const body = await response.text().catch(() => "");
  throw new Error(`Qlik session check failed (${response.status}): ${body}`);
}

export interface AuthCheckResult {
  authenticated: boolean;
  redirected: boolean;
}

/**
 * Ensure the user is authenticated with Qlik Cloud.
 *
 *  1. Detect post-login return via RETURN_MARKER to prevent redirect loops.
 *  2. If authenticated → proceed.
 *  3. If returning from login but still no session → fall back to sample data
 *     (never redirect again to avoid an infinite loop).
 *  4. If first visit with no session → redirect to Qlik login exactly once.
 */
export async function ensureQlikAuthenticated(): Promise<AuthCheckResult> {
  const returningFromLogin = isQlikReturnRedirect();

  if (returningFromLogin) {
    cleanUpReturnMarker();
  }

  const authenticated = await hasQlikSession();

  if (authenticated) {
    return { authenticated: true, redirected: false };
  }

  if (returningFromLogin) {
    console.warn(
      "[Qlik Auth] Returned from Qlik login but session is still not active. " +
      "Possible causes:\n" +
      "  • Third-party cookies are blocked in this browser.\n" +
      "  • The Qlik Web Integration whitelist entry does not match the origin below.\n" +
      "  • Resolved origin: " + resolvedAppOrigin() + "\n" +
      "  • Browser origin:  " + window.location.origin + "\n" +
      "Falling back to sample data."
    );
    return { authenticated: false, redirected: false };
  }

  console.warn("[Qlik Auth] No Qlik session — redirecting to Qlik login.");
  window.location.assign(buildQlikLoginUrl());

  return { authenticated: false, redirected: true };
}
