import { qlikConfig, tenantBaseUrl } from "./config";

const CSRF_STORAGE_KEY = "qlik-csrf-token";

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
 * The `returnto` parameter MUST be the exact origin that is whitelisted in the
 * Qlik Cloud Management Console → Web Integrations. We always use
 * window.location.origin so it matches the browser's actual origin regardless
 * of any env-var override.
 */
export function buildQlikLoginUrl(): string {
  const returnTo = qlikConfig.appOrigin ?? window.location.origin;

  const params = new URLSearchParams({
    "qlik-web-integration-id": qlikConfig.webIntegrationId,
    returnto: returnTo,
  });

  return `${tenantBaseUrl()}/login?${params.toString()}`;
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
 * If no valid session is found we stay on the current app and let it use the
 * bundled fallback data. This avoids sending the user into a login loop when
 * the deployment origin cannot be added to Qlik Cloud's allowed origins list.
 */
export async function ensureQlikAuthenticated(): Promise<AuthCheckResult> {
  const authenticated = await hasQlikSession();

  if (authenticated) {
    return { authenticated: true, redirected: false };
  }

  console.warn("Qlik session missing; redirecting to Qlik login.");
  window.location.assign(buildQlikLoginUrl());

  return {
    authenticated: false,
    redirected: true,
  };
}
