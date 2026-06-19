export interface QlikCloudConfig {
  host: string;
  appId: string;
  webIntegrationId: string;
  appOrigin?: string;
}

function readEnv(name: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[name];
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const qlikConfig: QlikCloudConfig = {
  host: requireEnv("VITE_QLIK_HOST"),
  appId: requireEnv("VITE_QLIK_APP_ID"),
  webIntegrationId: requireEnv("VITE_QLIK_WEB_INTEGRATION_ID"),
  appOrigin: readEnv("VITE_APP_ORIGIN"),
};

export function tenantBaseUrl(): string {
  return `https://${qlikConfig.host}`;
}

export function websocketAppUrl(csrfToken: string): string {
  const params = new URLSearchParams({
    "qlik-web-integration-id": qlikConfig.webIntegrationId,
    "qlik-csrf-token": csrfToken,
  });
  return `wss://${qlikConfig.host}/app/${qlikConfig.appId}?${params.toString()}`;
}