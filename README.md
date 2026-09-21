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
own virtual host. Deployment builds the site and syncs the output directory to that
virtual host's document root.

The site is **not** served from the application's document root: the Laravel front
controller rewrite in `public/.htaccess` must stay out of the request path for
documentation URLs.

### Hostnames

| Hostname | Serves |
| --- | --- |
| `tlcmap.org` | The TLCMap application. This is the main domain and does not move. |
| `docs.tlcmap.org` | The documentation site. |
| `site.tlcmap.org` | The WordPress site, relocated from `docs.tlcmap.org`. |
| `views.tlcmap.org` | TLCMap Views. Unchanged. |

The documentation site takes over `docs.tlcmap.org` and the WordPress site moves to
`site.tlcmap.org`. Both happen in a single cutover, so no interim public hostname is ever
published: the site is authored and reviewed on a staging host excluded from search
indexing, and goes live at its final URL.

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
- Every other legacy WordPress path — to `site.tlcmap.org` at the same path.

Both sets are 301s and are kept indefinitely. Existing `docs.tlcmap.org` URLs appear in
publications, research outputs and third-party links, and must not break.

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

Also in the application:

- The two links in `layout.blade.php` that hardcode `https://docs.tlcmap.org` use the
  relevant configuration value instead.
- `app/ViewConfig/GhapConfig.php` builds documentation links into the popup content of maps
  rendered by TLCMap Views, so those links are part of the same change.

## Contributing

Small corrections and wording changes: use **Edit this page on GitHub** at the foot of any
page. This opens the source file in the GitHub web editor and raises a pull request — no
local setup is needed.

New pages, restructuring and anything touching navigation are done by developers through a
pull request in this repository.

Changes to the TLCMap Views reference documentation are made in the `TLCMapViews`
repository.

Writing rules are in [CLAUDE.md](./CLAUDE.md).
