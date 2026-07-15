import { qlikConfig, tenantBaseUrl } from "./config";

const CSRF_STORAGE_KEY = "qlik-csrf-token";
const RETURN_MARKER = "qlik_auth_return";

/**
 * Resolve the app origin used as the Qlik `returnto` URL.
 * Uses VITE_APP_ORIGIN when set, falls back to window.location.origin.
 * .trim() removes the \n that .env line-endings inject (%0A in URLs → LOGIN-10).
 */
export function resolvedAppOrigin(): string {
  if (qlikConfig.appOrigin) {
    return qlikConfig.appOrigin.trim().replace(/\/$/, "");
  }
  return window.location.origin;
}

/**
 * The exact returnto URL sent to Qlik.
 *
 * The Qlik whitelist entry is stored WITHOUT the protocol (e.g. "ott-streaming-analytics-dashboard.vercel.app").
 * So we strip "https://" from the origin to match it exactly — otherwise Qlik returns LOGIN-10.
 * Qlik will redirect back to the app after login using this URL.
 */
export function buildReturnToUrl(): string {
  // Strip protocol so the hostname matches the Qlik whitelist entry (no https://)
  const origin = resolvedAppOrigin().replace(/^https?:\/\//, "");
  return `${origin}/?${RETURN_MARKER}=1`;
}

/** The full Qlik login redirect URL. */
export function buildQlikLoginUrl(): string {
  const params = new URLSearchParams({
    "qlik-web-integration-id": qlikConfig.webIntegrationId,
    returnto: buildReturnToUrl(),
  });
  return `${tenantBaseUrl()}/login?${params.toString()}`;
}

/** Exposed for the debug UI panel. */
export function debugReturnToUrl(): string {
  return buildReturnToUrl();
}

/** True when this page load is Qlik's post-login redirect back to us. */
export function isQlikReturnRedirect(): boolean {
  return new URLSearchParams(window.location.search).has(RETURN_MARKER);
}

/** Remove the marker from the URL bar without a page reload. */
export function cleanUpReturnMarker(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has(RETURN_MARKER)) {
      url.searchParams.delete(RETURN_MARKER);
      window.history.replaceState({}, "", url.toString());
    }
  } catch { /* non-critical */ }
}

export function clearCsrfToken(): void {
  window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
}

/** Fetch a server-issued CSRF token (cached in sessionStorage). */
export async function fetchCsrfToken(): Promise<string> {
  const cached = window.sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (cached) return cached;

  const response = await fetch(`${tenantBaseUrl()}/api/v1/csrf-token`, {
    method: "GET",
    credentials: "include",
    headers: { "qlik-web-integration-id": qlikConfig.webIntegrationId },
  });

  if (!response.ok) {
    throw new Error(`CSRF token fetch failed (HTTP ${response.status})`);
  }

  const token = response.headers.get("qlik-csrf-token");
  if (!token) {
    throw new Error("No qlik-csrf-token header in response.");
  }

  window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  return token;
}

/**
 * Check silently whether the browser already has an active Qlik Cloud session.
 * Returns false on any network / auth error — never throws.
 */
export async function hasQlikSession(): Promise<boolean> {
  try {
    const csrfToken = await fetchCsrfToken();

    const response = await fetch(`${tenantBaseUrl()}/api/v1/users/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "qlik-web-integration-id": qlikConfig.webIntegrationId,
        "qlik-csrf-token": csrfToken,
        Accept: "application/json",
      },
    });

    if (response.ok) return true;

    if (response.status === 401 || response.status === 403) {
      clearCsrfToken();
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Manually trigger a Qlik login redirect.
 * Called only when the user clicks "Connect to Qlik Cloud".
 */
export function redirectToQlikLogin(): void {
  window.location.assign(buildQlikLoginUrl());
}
