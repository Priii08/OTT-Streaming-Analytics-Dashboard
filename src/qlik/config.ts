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

export const qlikConfig: QlikCloudConfig = {
  host: readEnv("VITE_QLIK_HOST") ?? "cliqvenus.ap.qlikcloud.com",
  appId: readEnv("VITE_QLIK_APP_ID") ?? "53b13125-7bb8-4ff0-b5bc-9e2704b0363e",
  webIntegrationId:
    readEnv("VITE_QLIK_WEB_INTEGRATION_ID") ?? "M56RlXSVJ0dcpleLLpIdU1oPwI9sDQxJ",
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