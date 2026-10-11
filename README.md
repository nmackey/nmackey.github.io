# nmackey.com

Personal site for [Nicholas Mackey](https://nmackey.com). Content lives in markdown; a small TypeScript 7 build emits static HTML for GitHub Pages.

## Setup

Node 24 via nvm, packages via pnpm:

```bash
nvm use
pnpm install
pnpm dev
```

`pnpm dev` builds the site, serves `dist/` at http://127.0.0.1:4173, and rebuilds when content, templates, or source change.

```bash
pnpm build
```

writes the static site to `dist/`.

## Content

- Landing page: [`templates/landing.html`](templates/landing.html)
- Web posts: [`content/web/`](content/web/) — one `.md` file per post
- Personal posts: [`content/personal/`](content/personal/) — same pattern; [`index.md`](content/personal/index.md) is the section intro

Post frontmatter:

```yaml
---
title: Post title
date: 2018-04-07
tags: [webpack, babel]
excerpt: Short summary for lists and RSS.
# comments: false
---
```

The filename (minus `.md`) is the URL slug: `content/web/my-post.md` → `/web/my-post/`.

## Site config

[`site.json`](site.json) holds name, social links, Giscus, and the Cloudflare Web Analytics token.

**Comments:** enable Discussions on the GitHub repo, install the [giscus app](https://github.com/apps/giscus), then paste `repo`, `repoId`, `category`, and `categoryId` from [giscus.app](https://giscus.app) into `site.json`. Until those IDs are set, the comments widget is omitted.

**Analytics:** create a Cloudflare Web Analytics site and put the beacon token in `cloudflareBeaconToken`. Until it is set, the beacon is omitted.

## RSS

- `/feed.xml` — all posts
- `/web/feed.xml` — web posts
- `/personal/feed.xml` — personal posts

## Deploy

Push to `main`. GitHub Actions runs `pnpm build` and publishes `dist/` to GitHub Pages (`CNAME`: `nmackey.com`).
