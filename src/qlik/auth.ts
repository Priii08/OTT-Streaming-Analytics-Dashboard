import { qlikConfig } from "./config";

export async function authenticate() {
  console.log("Starting authentication...");

  const response = await fetch(
    `https://${qlikConfig.host}/api/v1/users/me`,
    {
      credentials: "include",
      headers: {
        "qlik-web-integration-id": qlikConfig.webIntegrationId,
      },
    }
  );

  console.log("Status:", response.status);

  if (response.ok) {
    const user = await response.json();
    console.log("Authenticated User:", user);
    return user;
  }

  const text = await response.text();
  console.log("Response:", text);

  throw new Error("Authentication failed");
}