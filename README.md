# TLCMap Documentation

Source of the TLCMap documentation site, built with [VitePress](https://vitepress.dev/).

## Scope

The documentation site covers:

- **User guide** — getting started, guides, tutorials, FAQs.
- **Developer documentation** — Web Services API, data and date formats, import/export
  standards, RO-Crate, TLCMap compliance.
- **TLCMap Views** — an overview page that introduces the views and links out to the
  reference documentation held in the `TLCMapViews` repository.

General and institutional content stays on the WordPress site. It is not migrated.

| Content | Home | Source |
| --- | --- | --- |
| User guide, FAQs, tutorials | Documentation site | This repository |
| Web Services API, data formats, RO-Crate, compliance | Documentation site | This repository |
| TLCMap Views overview | Documentation site | This repository |
| TLCMap Views reference | `TLCMapViews` repository on GitHub | `TLCMapViews` repository |
| About, acknowledgement of First Australians, partners, researchers, research outputs, updates, newsletter, contact, Conditions of Use, core data sources | WordPress site | WordPress |

The WordPress "Tools" pages remain as short landing pages that link into the
documentation site, rather than duplicating its content.

## Site

A VitePress static site. Content is authored in Markdown, built to static HTML, and
served as files — there is no application runtime in production.

```
docs/
  .vitepress/
    config.*          site config, navigation, sidebar, edit links
  index.md            documentation home
  guide/              user guide
  developers/         developer documentation
  views/              TLCMap Views overview
```

### Information architecture

Two content sections, split by audience, plus the Views pointer. There is no separate
top-level division for concepts or reference: at this size a third tower only makes the
reader guess which of three places holds an answer. Concepts open the guide, and the FAQs
and glossary close it.

Sidebar groups are grouping only. Page URLs stay one level deep under each section, so a
page can be regrouped without breaking its URL.

**Guide** (`/guide/`)

| Group | Pages |
| --- | --- |
| Start here | `/guide/` (what TLCMap is), `concepts`, `accounts` |
| Finding places | `search`, `search-area-and-date`, `results`, `saved-searches` |
| Adding your own data | `prepare-data`, `create-layer`, `edit-records`, `texts` |
| Organising and sharing | `collections`, `sharing`, `exporting`, `visualising` |
| Analysing | `analysis` |
| Reference | `faqs`, `glossary` |

**Developers** (`/developers/`)

`/developers/` (access, CORS, paging limits), `search-api`, `layers-api`, `analysis-api`,
`formats`, `data-model`, `ro-crate`.

**TLCMap Views** (`/views/`) — one overview page, linking out to the repository.

Administration functions are not documented; the audience is TLCMap staff only.

Two rules keep the structure from drifting:

1. **Each field and parameter is documented once.** The guide owns what goes into a file
   you upload; the developer documentation owns what comes back out of an endpoint. Where
   a reader of one needs the other, link rather than restate. The record fields are
   defined once, in `/developers/data-model/`.
2. **A page earns its existence by being linkable.** Something only ever read in sequence
   with its neighbour is a heading, not a page.

### TLCMap Views

The Views reference documentation stays in the `TLCMapViews` repository under
`documentation/`, and is read there on GitHub. It is not mirrored, copied or built into
this site. It is edited in the same pull request as the code it describes, which is what
keeps it accurate, and GitHub serves the version matching any given release tag.

This site carries one hand-written overview page at `/views/`, so that the views are
discoverable through the site navigation and search. It covers what TLCMap Views is, the
available views and their URLs, and how to embed one, then links to the reference
documentation in the `TLCMapViews` repository for the full GeoJSON feed and display
configuration detail.

### Versioning

The site is not versioned. It documents the current production release of the TLCMap
application. The Web Services API is not versioned.

TLCMap Views is versioned independently through its own release tags, which is another
reason its reference documentation stays in that repository rather than on this site.

## Hosting

The built site is served by Apache on the same server as the TLCMap application, from its
own virtual host.

The repository is cloned to `/var/www/tlcmap-docs` and built there. Only the build output
is served — the document root is `docs/.vitepress/dist` inside the clone — so the working
tree, `.git` and `node_modules` all sit outside the web path.

```
/var/www/tlcmap-docs/               the clone, not served
  deploy/robots-noindex.txt         aliased to /robots.txt on the interim host
  docs/.vitepress/dist/             the document root
```

The site is **not** served from the application's document root: the Laravel front
controller rewrite in `public/.htaccess` must stay out of the request path for
documentation URLs. Check too that no other virtual host, the default one included, serves
`/var/www/tlcmap-docs` itself — that would publish the source and the git history.

### Deploying

The server needs Node, to the version in [Development](#development). To release:

```
cd /var/www/tlcmap-docs
git pull
npm ci
npm run build
```

No Apache reload is needed; the files are replaced under the running server.

The build empties the output directory before writing it, so for the few seconds it takes,
the site returns 404s. That is tolerable for documentation. If it ever matters, build
somewhere else and swap the result into place rather than building over the live copy.

`npm run build` fails on a link to a page that does not exist, so a broken release stops at
the build rather than reaching the document root — but it stops *after* the directory has
been emptied. Run the build locally before pushing.

### Hostnames

| Hostname | Serves |
| --- | --- |
| `tlcmap.org` | The TLCMap application. This is the main domain and does not move. |
| `guide.tlcmap.org` | The documentation site, until the cutover. |
| `docs.tlcmap.org` | The WordPress site now; the documentation site after the cutover. |
| `site.tlcmap.org` | The WordPress site, relocated from `docs.tlcmap.org`. Does not exist yet. |
| `views.tlcmap.org` | TLCMap Views. Unchanged. |

Deployment happens in two stages.

**Now.** The documentation site goes live at `guide.tlcmap.org`. `docs.tlcmap.org` keeps
serving WordPress and nothing else moves. The interim host is kept out of search — see
[Indexing](#indexing) — so that nothing has to be migrated later, and it carries no legacy
redirects, because no existing link points at it.

**At the cutover.** The documentation site takes over `docs.tlcmap.org`, the WordPress site
moves to `site.tlcmap.org`, and `guide.tlcmap.org` becomes a permanent redirect to
`docs.tlcmap.org` at the same path. These happen together, in one change.

`docs.tlcmap.org` is the durable address, and it is the one to put anywhere permanent —
publications, printed material, the application's configuration. It does not serve the
documentation yet, so until the cutover there is nothing to cite: share
`guide.tlcmap.org` for reading and reviewing, and keep it out of anything that outlives
the cutover. Links made to it do keep working afterwards, through the redirect.

### Server configuration

The virtual hosts are version-controlled, one per stage:

| File | Enable |
| --- | --- |
| [`deploy/guide.tlcmap.org.conf`](./deploy/guide.tlcmap.org.conf) | Now. The interim host. No legacy redirects, and kept out of search. |
| [`deploy/docs.tlcmap.org.conf`](./deploy/docs.tlcmap.org.conf) | At the cutover. Carries the legacy redirects below, and redirects `guide.tlcmap.org` here. |

Enable one or the other, never both. Both need `rewrite`, `headers` and `deflate`:

```
sudo a2enmod rewrite headers deflate
```

The one rule that cannot be omitted is the extensionless rewrite. The site is built with
`cleanUrls`, so a page is linked as `/guide/accounts` but written to disk as
`guide/accounts.html`. Apache has to map one to the other, or every internal link on the
site returns 404. The rest of the virtual host — the themed 404 page, cache lifetimes and
compression — is worth having but nothing breaks without it.

Rules live in the virtual host rather than in an `.htaccess` file, so the document root
holds only the built site and `AllowOverride` stays `None`.

#### Indexing

`docs/public/robots.txt` is the file for the final hostname: it allows crawling and points
at `sitemap.xml`, which the build generates from `sitemap.hostname` in the site
configuration. Both name `docs.tlcmap.org`, because that is where the documentation is
meant to be found.

The interim host overrides both. `deploy/guide.tlcmap.org.conf` does three things: it
aliases `/robots.txt` to [`deploy/robots-noindex.txt`](./deploy/robots-noindex.txt), which
disallows everything; it denies `sitemap.xml`; and it sets `X-Robots-Tag: noindex,
nofollow` on every response. The `robots.txt` stops well-behaved crawlers fetching at all,
and the header covers a crawler that ignores it, or one that reaches a page from a link
somewhere else. Nothing indexed under `guide.tlcmap.org` means nothing to migrate at the
cutover.

The alias reads the file from the clone rather than a copy placed beside it, so editing it
here and pulling is the whole of changing it. It sits outside the document root, so it is
reachable only through the alias.

The same override suits any staging host.

### Paths

The `/help/` prefix used by the WordPress site is dropped. Sections live at the site root:

| WordPress (old) | Documentation site (new) |
| --- | --- |
| `/help/` | `/` |
| `/help/guides/`, `/help/guides/guide/` | `/guide/` |
| `/help/faqs/` | `/guide/faqs/` |
| `/help/developers/` | `/developers/` |
| — | `/views/` |

### Redirects

After the cutover the `docs.tlcmap.org` virtual host serves the documentation site and
also owns the redirects for everything that used to live there:

- `/help/*` — to the corresponding documentation path above.
- The legacy WordPress paths — to `site.tlcmap.org` at the same path.

Both sets are 301s and are kept indefinitely. Existing `docs.tlcmap.org` URLs appear in
publications, research outputs and third-party links, and must not break.

The WordPress paths are named one by one in the virtual host rather than caught by a
fallback, because Apache cannot tell a legacy WordPress path from a typo: a fallback would
send every unknown URL to WordPress and the documentation site could never show its own
404 page. The list is `/about/`, `/contact/`, `/first-australians/`, `/core-data/`,
`/partners/`, `/researchers/`, `/research-outputs/`, `/updates/` and `/newsletter/`.
Anything else on the WordPress site needs adding to it.

### Application integration

`TLCMAP_DOC_URL` is currently the base URL of the WordPress site, not of the
documentation. The application uses it for 30 links across 9 files: 17 documentation links
under `/help/`, and 13 links to WordPress pages such as `/about/`, `/contact/`,
`/first-australians/`, `/core-data/` and `/about/conditionsofuse/`. Pointing it at the
documentation site alone would break the second group.

It is therefore split in two:

| Setting | Value | Used for |
| --- | --- | --- |
| `TLCMAP_DOC_URL` | `https://docs.tlcmap.org/` | the 17 documentation links, repointed to the paths above |
| `TLCMAP_SITE_URL` | `https://site.tlcmap.org/` | the 13 WordPress links |

Both values belong to the cutover. Neither host serves its new content before then, so the
application change is part of the cutover rather than something to do now. Pointing
`TLCMAP_DOC_URL` at `https://guide.tlcmap.org/` in the meantime would work — the interim
host is hidden from search engines, not from people — but it means setting the value
twice.

Also in the application:

- The two links in `layout.blade.php` that hardcode `https://docs.tlcmap.org` use the
  relevant configuration value instead.
- `app/ViewConfig/GhapConfig.php` builds documentation links into the popup content of maps
  rendered by TLCMap Views, so those links are part of the same change.

## Development

Requires Node 18, or 20 and above — the constraint comes from the Vite release VitePress
bundles.

```
npm install
npm run dev
```

`npm run dev` serves the site at `http://localhost:5173` and reloads on save.

| Script | |
| --- | --- |
| `npm run dev` | Serve locally, with hot reload |
| `npm run build` | Build to `docs/.vitepress/dist` |
| `npm run preview` | Serve the built output, to check it before it is deployed |

The build fails on a link to a page that does not exist, so it doubles as the link check.
Run it before opening a pull request.

## Contributing

Small corrections and wording changes: use **Edit this page on GitHub** at the foot of any
page. This opens the source file in the GitHub web editor and raises a pull request — no
local setup is needed.

New pages, restructuring and anything touching navigation are done by developers through a
pull request in this repository.

Changes to the TLCMap Views reference documentation are made in the `TLCMapViews`
repository.

Writing rules are in [CLAUDE.md](./CLAUDE.md).
