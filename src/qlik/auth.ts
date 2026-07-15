import { qlikConfig, tenantBaseUrl } from "./config";

const CSRF_STORAGE_KEY = "qlik-csrf-token";

/**
 * The URL param Qlik appends when redirecting back after a successful login.
 * We stamp our own marker too so we can detect a returning session.
 */
const RETURN_MARKER = "qlik_auth_return";

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
 * CRITICAL FIX for LOGIN-10:
 * The `returnto` parameter MUST be the exact origin string that is whitelisted
 * in the Qlik Cloud Management Console → Web Integrations.
 *
 * Qlik Cloud whitelists ORIGINS (no trailing slash, no path).
 * Using window.location.origin (no trailing slash) is required.
 *
 * We also append a ?qlik_auth_return=1 marker to the returnto URL so the app
 * can detect it has just come back from a Qlik login redirect and avoid
 * immediately re-triggering the auth flow before cookies settle.
 */
export function buildQlikLoginUrl(): string {
  // IMPORTANT: Use window.location.origin WITHOUT a trailing slash.
  // Qlik's whitelist entry must match this exactly.
  // Adding "/" produces LOGIN-10 if the entry was saved without the slash.
  const origin = window.location.origin;

  // Append a marker so we can detect the post-login return and skip the
  // redirect loop guard.
  const returnTo = `${origin}/?${RETURN_MARKER}=1`;

  const params = new URLSearchParams({
    "qlik-web-integration-id": qlikConfig.webIntegrationId,
    returnto: returnTo,
  });

  return `${tenantBaseUrl()}/login?${params.toString()}`;
}

/**
 * Returns true if the current page load is a Qlik post-login redirect
 * (i.e. we were just sent back from the Qlik login page).
 *
 * In this case we should NOT immediately re-check the session — we should
 * wait for the cookie to be set and then check once.
 */
function isQlikReturnRedirect(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has(RETURN_MARKER);
}

/**
 * Strip the auth return marker from the current URL so it doesn't clutter
 * the browser history or get bookmarked.
 */
function cleanUpReturnMarker(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has(RETURN_MARKER)) {
      url.searchParams.delete(RETURN_MARKER);
      window.history.replaceState({}, "", url.toString());
    }
  } catch {
    // Non-critical – ignore errors in URL manipulation.
  }
}

/**
 * Check whether the current browser has an active Qlik Cloud session.
 *
 * Steps:
 * 1. Obtain a real server-issued CSRF token.
 * 2. Call /api/v1/users/me with credentials + the real token.
 * 3. Return false (not authenticated) on 401/403; clear stale cached token.
 */
export async function hasQlikSession(): Promise<boolean> {
  let csrfToken: string;
  try {
    csrfToken = await fetchCsrfToken();
  } catch {
    // If we cannot obtain the CSRF token the user is not authenticated.
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
    // Stale or invalid token — clear cache so the next attempt fetches a fresh one.
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
 * LOGIN-10 root-cause fix:
 *
 *  1. If we just returned from a Qlik login redirect (RETURN_MARKER in URL),
 *     we clean up the URL and attempt to verify the session.
 *     If it fails even after returning from login we bail to fallback data
 *     (rather than looping forever).
 *
 *  2. If not returning from login and no session exists, we redirect exactly
 *     once. The returnto URL uses window.location.origin (no trailing slash)
 *     which must match what is entered in the Qlik Web Integration whitelist.
 *
 *  3. If no valid session is found AND we're not coming back from a redirect,
 *     we redirect to Qlik login — but only once per page load.
 */
export async function ensureQlikAuthenticated(): Promise<AuthCheckResult> {
  const returningFromLogin = isQlikReturnRedirect();

  if (returningFromLogin) {
    // We just came back from the Qlik login page. Clean up the URL.
    cleanUpReturnMarker();
  }

  const authenticated = await hasQlikSession();

  if (authenticated) {
    return { authenticated: true, redirected: false };
  }

  if (returningFromLogin) {
    // We already went through login but still have no session.
    // This means the login succeeded on Qlik's side but the cookie hasn't
    // settled or there is a CORS/cookie issue.
    // DO NOT redirect again — fall back to sample data to avoid an infinite loop.
    console.warn(
      "Returned from Qlik login but session is still not active. " +
      "Possible causes: third-party cookies blocked, or the Qlik Web Integration " +
      "whitelist does not include this origin. Falling back to sample data."
    );
    return { authenticated: false, redirected: false };
  }

  // First-time visit with no session — redirect to Qlik login.
  console.warn("Qlik session missing; redirecting to Qlik login.");
  window.location.assign(buildQlikLoginUrl());

  return {
    authenticated: false,
    redirected: true,
  };
}
