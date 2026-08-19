# Next.js SPA Split

Example at https://nextjs-spa-split.andrewcwang.com

Tutorial for mixing Next.js with SPAs at different endpoints, namely the SPA being
utilized for authenticated dashboard and Next.js for unauthenticated.

This is primarily for B2C applications that need SEO. Specifically, the user shouldn't
have to go to `app.domain.com` and the preferred outcome is that the user is always
on `domain.com`. An example of this is Facebook.com. They have different dashboards
all under `facebook.com` with different base route segments.

## Usage

This project template includes an admin and dashboard served via SPA only to authenticated
(and authorized for admin) users. React Vite hot-reloading also works.

First, copy the `.template.env` file to `.env` and fill out the rest of the variables.
Second, run the following:

```shell
pnpm install
docker compose up -d
pnpm run -C apps/dbmigrator migrate:up
lefthook install
pnpm run dev
```

`pnpm run dev` starts four processes: the Next.js website on `:3000`, the Hono API on `:3001`,
and the dashboard and admin SPAs on `:3002` and `:3003`.

The API is a separate deployment (see [Splitting the API out of Next.js](#splitting-the-api-out-of-nextjs)),
so it gets its own Vercel project: point the project's Root Directory at `apps/internal-api`,
enable _Include files outside the Root Directory_, and set `DATABASE_URL`,
`NEXT_PUBLIC_HOST_URL`, `NEXT_PUBLIC_API_URL`, and `VERCEL_EXPERIMENTAL_BACKENDS=1`.

Production configuration is also set up via OpenTofu (see the [tofu](./tofu) directory).
It simply sets up IAM permission to deploy the SPA assets to an S3 bucket, and the smart
deployment happens in GitHub Actions with IAM + GitHub Actions OIDC.

To set up, you'll need IAM credentials that can create the above resources.

```shell
brew bundle
tofu plan
tofu apply
```

For the NextJS app, we're simply going to use Vercel.

## Context

Next.js and Vercel have been very useful in deploying applications quickly. Next.js is
useful for SEO, but the client/server component dichotomy creates a sprawling codebase
of client components with tons of server component `page.tsx` files. It also makes
navigation a bit complicated, increases latency be loading new pages over and over
(even if it is cached), and possibly leak security.

A React SPA is totally fine behind authenticated, non-SEO optimized pages. A single
bundle loaded on to the user's computer makes for a faster experience where the only
data needed to be loaded are API endpoints and the main JS bundle comes from a CDN
rather than a server.

To make sure the user is authenticated on initial load and to continue using
session cookies, the initial loading of the page still goes through Next.js.
After that, we redirect the user to the proper endpoint: either an unprotected
page for login or the SPA.

## Splitting the API out of Next.js

The Hono API used to be mounted inside Next.js at `app/api/[[...route]]/route.ts`, which meant
every API request was a Next.js Vercel Function invocation. The API and the marketing site scale
very differently, and there is no reason to pay Next.js compute prices for JSON endpoints. So
`apps/internal-api` is now its own deployment — Vercel's zero-config Hono backend, which picks up
the default export of `src/index.ts` — served from `api.domain.com`.

`apps/website` keeps only what genuinely belongs to it: SEO pages, the OAuth login flow, and
`src/proxy.ts`, which still validates the session against Postgres directly (not by calling the
API) before rewriting authenticated traffic to a SPA.

Splitting the API onto its own host means the browser now makes cross-origin calls, so two things
have to line up:

1. **CORS.** The API allowlists the apex domain and its subdomains with `credentials: true`
   (`apps/internal-api/src/index.ts`). Without `credentials`, the browser will not attach the
   session cookie at all.
2. **The cookie `Domain` flag.** The website sets the `session` cookie; a cookie set for
   `domain.com` is _not_ sent to `api.domain.com` unless it carries an explicit
   `Domain=.domain.com`. Both sides derive that from `NEXT_PUBLIC_HOST_URL`, so there is no
   separate variable to keep in sync. It resolves to `undefined` for `localhost`, which is what
   you want locally: `localhost:3000` and `localhost:3001` are the same host as far as cookies
   are concerned, since cookies ignore ports.

`SameSite=lax` still works across the split: `domain.com` and `api.domain.com` share a
registrable domain, so the requests are cross-_origin_ but same-_site_.

The generated API client (`lib/typescript/api-client`) hardcodes the API base URL rather than
reading it from an env var. That is deliberate: the same module is consumed by both Next.js and
the Vite SPAs, and `NEXT_PUBLIC_*` inlining does not reach a Vite build. `NODE_ENV` is the one
variable both bundlers replace statically.

## Alternatives

### Hosting SPA on subdomain

Many B2B SaaS sites alternatively host their dashboard SPA on `app.domain.com`.
This isn't very user-friendly, but many B2B applications are totally fine with it.
It also makes the split much easier to handle: simply host the SPA in a bucket and
update the built HTML file. Then whenever the user first enters the dashboard,
the HTML/SPA will load, check if the user is authenticated, and, if not, redirect
the user to a login page (which is still in the SPA) and perform authentication.
That authentication flow still requires the user to refresh the SPA since an http-only
cookie must be set (but the cookie can be set on any subdomain, so many applications
simply have their API backend set the cookie with the Domain flag set to the top domain).

### Vercel Microfrontend and Multi Zones

See their docs https://vercel.com/docs/microfrontends and
https://nextjs.org/docs/app/guides/multi-zones

Microfrontends and multi zones are useful if you plan on sticking around with Vercel.
Multi zones require you use Next.js. Microfrontends can route to an external application
(i.e. our SPAs). There are two scenarios where microfrontends cannot handle your needs:

1. If you have a route for a page that is hosted for SEO and for authenticated users,
   but the content is different (e.g. for authenticated users you need to show a sidebar),
   again assuming the pathname is the same and you tried using a microfrontend, your SPA
   would need to redirect back to Next.js
2. If you want to authenticate the user initially, you'll want to go through the main
   Next.js application. You can theoretically re-authenticate an already authenticated
   user by doing a quick `/login` check against your API server by setting the Domain flag
   explicitly on your auth session cookie. But you'll have a weird redirect experience
   where the user is first shown an inkling of the SPA and, if the user has been logged out
   for too long, redirected back to the Next.js login page.

Anyways, the way we're doing this is exactly like Vercel. Vercel's microfrontends simply
uses `@vercel/microfrontends` where they modify your middleware. They handle the routing
at the "network" level, but really it's just plain logic code that they handle for you but
can be easily handled yourself for the same latency. Since Vercel’s microfrontend routing happens
at their network infrastructure level, the external application needs to be represented as a Vercel
project so it can be included in your microfrontends.json configuration.

## Repo Structure

Stack: Next.js, ShadCN, Kysely, Vitest, Tailwind, HonoJS, PostgreSQL

Think of `lib` as a place to put custom, shared code. Think of `packages` as
a place to put shared clients. Think of `apps` as actually deployed applications.
