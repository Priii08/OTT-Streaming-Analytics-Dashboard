
  # OTT Streaming Analytics Dashboard

  This is a code bundle for OTT Streaming Analytics Dashboard. The original project is available at https://www.figma.com/design/uTF9eJersqVY57sidho4SD/OTT-Streaming-Analytics-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Qlik Cloud configuration

  If your deployed origin is not the same as the browser origin or you need to pin a specific callback URL, set `VITE_APP_ORIGIN` to the exact whitelisted origin in Qlik Cloud. The app will use that value for the Qlik login `returnto` parameter and fall back to `window.location.origin` when it is not set.
