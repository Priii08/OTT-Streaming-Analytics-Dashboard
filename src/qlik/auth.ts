import { qlikConfig, tenantBaseUrl } from "./config";

const CSRF_STORAGE_KEY = "qlik-csrf-token";

function randomToken(length = 16): string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let token = "";
	for (let i = 0; i < length; i += 1) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
}

export function getOrCreateCsrfToken(): string {
	const existing = window.sessionStorage.getItem(CSRF_STORAGE_KEY);
	if (existing) {
		return existing;
	}
	const created = randomToken();
	window.sessionStorage.setItem(CSRF_STORAGE_KEY, created);
	return created;
}

export function buildQlikLoginUrl(returnTo = window.location.href): string {
	const preferredReturnTo = qlikConfig.appOrigin ?? returnTo;
	const normalizedReturnTo = new URL(preferredReturnTo, window.location.origin).origin;
	const params = new URLSearchParams({
		"qlik-web-integration-id": qlikConfig.webIntegrationId,
		returnto: normalizedReturnTo,
	});
	return `${tenantBaseUrl()}/login?${params.toString()}`;
}

export async function hasQlikSession(): Promise<boolean> {
	const csrfToken = getOrCreateCsrfToken();
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
		return false;
	}

	const body = await response.text().catch(() => "");
	throw new Error(`Qlik session check failed (${response.status}): ${body}`);
}

export interface AuthCheckResult {
	authenticated: boolean;
	redirected: boolean;
}

export async function ensureQlikAuthenticated(): Promise<AuthCheckResult> {
	const authenticated = await hasQlikSession();
	if (authenticated) {
		return { authenticated: true, redirected: false };
	}

	return { authenticated: false, redirected: false };
}