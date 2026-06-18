import enigma from "enigma.js";
import schema from "enigma.js/schemas/12.2015.0.json";
import { qlikConfig, websocketAppUrl } from "./config";
import { getOrCreateCsrfToken } from "./auth";

export interface EngineSession {
  session: {
    close: () => Promise<void>;
  };
  app: any;
}

export async function openEngineAppSession(): Promise<EngineSession> {
  const csrfToken = getOrCreateCsrfToken();
  const session = enigma.create({
    schema,
    url: websocketAppUrl(csrfToken),
    createSocket: (url: string) => new WebSocket(url),
  });

  const global = (await session.open()) as any;
  const app = await global.openDoc(qlikConfig.appId);

  return {
    session,
    app,
  };
}

export async function closeEngineSession(engineSession: EngineSession | null): Promise<void> {
  if (!engineSession) {
    return;
  }
  await engineSession.session.close();
}