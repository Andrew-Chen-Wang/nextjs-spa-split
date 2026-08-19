/** Cookie `Domain` for the session cookie, e.g. `.example.com`.
 *
 *  Must be left unset in development: the website (:3000) and this API (:3001) share the
 *  `localhost` host, and cookies ignore ports, so a host-only cookie already reaches both.
 *  In production the two live on different hosts (`example.com` and `api.example.com`), so the
 *  cookie needs an explicit parent domain — with the leading dot — to be sent to the API. */
const configuredCookieDomain = process.env.COOKIE_DOMAIN?.trim()
export const COOKIE_DOMAIN = configuredCookieDomain === "" ? undefined : configuredCookieDomain

/** The registrable domain the browser apps are served from, derived from COOKIE_DOMAIN.
 *  Used to build the CORS allowlist. */
export const APEX_DOMAIN = COOKIE_DOMAIN?.replace(/^\./, "")
