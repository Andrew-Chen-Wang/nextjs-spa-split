# NextJS SPA Split

Tutorial for mixing NextJS with SPAs at different endpoints, namely the SPA being
utilized for authenticated dashboard and NextJS for unauthenticated.

This is primarily for B2C applications that need SEO. Specifically, the user shouldn't
have to go to `app.domain.com` and the preferred outcome is that the user is always
on `domain.com`. An example of this is Facebook.com. They have different dashboards
all under `facebook.com` with different base route segments.

## Context

NextJS and Vercel have been very useful in deploying applications quickly. NextJS is
useful for SEO, but the client/server component dichotomy creates a sprawling codebase
of client components with tons of server component `page.tsx` files. It also makes
navigation a bit complicated, increases latency be loading new pages over and over
(even if it is cached), and possibly leak security.

A React SPA is totally fine behind authenticated, non-SEO optimized pages. A single
bundle loaded on to the user's computer makes for a faster experience where the only
data needed to be loaded are API endpoints and the main JS bundle comes from a CDN
rather than a server.

To make sure the user is authenticated on initial load and to continue using
session cookies, the initial loading of the page still goes through NextJS.
After that, we redirect the user to the proper endpoint: either an unprotected
page for login or the SPA.

## Alternatives

Many B2B SaaS sites alternatively host their dashboard SPA on `app.domain.com`.
This isn't very user-friendly, but many B2B applications are totally fine with it.
It also makes the split much easier to handle: simply host the SPA in a bucket and
update the built HTML file. Then whenever the user first enters the dashboard,
the HTML/SPA will load, check if the user is authenticated, and, if not, redirect
the user to a login page (which is still in the SPA) and perform authentication.
That authentication flow still requires the user to refresh the SPA since an http-only
cookie must be set (but the cookie can be set on any subdomain, so many applications
simply have their API backend set the cookie with the Domain flag set to the top domain).

## Repo Structure

Stack: NextJS, ShadCN, Kysely, Vitest, Tailwind, HonoJS, PostgreSQL

Think of `lib` as a place to put custom, shared code. Think of `packages` as
a place to put shared clients. Think of `apps` as actually deployed applications.
