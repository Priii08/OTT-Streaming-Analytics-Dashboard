
  # OTT Streaming Analytics Dashboard

  This is a code bundle for OTT Streaming Analytics Dashboard. The original project is available at https://www.figma.com/design/uTF9eJersqVY57sidho4SD/OTT-Streaming-Analytics-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Qlik Cloud configuration

  If your deployed origin is not the same as the browser origin or you need to pin a specific callback URL, set `VITE_APP_ORIGIN` to the exact whitelisted origin in Qlik Cloud. The app will use that value for the Qlik login `returnto` parameter and fall back to `window.location.origin` when it is not set.

  ## GitHub Pages deployment

  The repo is also prepared for GitHub Pages. Vite is configured with a relative base path, and the `public/404.html` fallback preserves client-side routes.

  To deploy with GitHub Pages, add a Pages workflow or publish the contents of `dist` to the `gh-pages` branch, then set `VITE_APP_ORIGIN` to the final Pages URL, for example `https://your-user.github.io/your-repo`.
  