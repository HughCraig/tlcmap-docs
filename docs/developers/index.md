# Developer documentation

TLCMap publishes its data over plain HTTP. Every public place, layer and multilayer has a
URL that returns GeoJSON, KML or CSV, and the search page has a machine-readable twin that
takes the same query parameters. There is no client library to install and nothing to
register for.

This section documents those URLs. If you are looking for how to *use* TLCMap through the
browser, start with the [user guide](/guide/).

| Page | Covers |
| --- | --- |
| [Search API](./search-api) | Querying places across all sources |
| [Layers and collections API](./layers-api) | Reading a layer or multilayer, and listing what is public |
| [Analysis API](./analysis-api) | Statistics, clustering and closeness results |
| [Output formats](./formats) | The GeoJSON, KML and CSV that come back |
| [Data model](./data-model) | What a record holds, and what the field names mean |
| [RO-Crate](./ro-crate) | The packaged export for deposit in a repository |

## Base URL

```
https://tlcmap.org
```

All examples on these pages use that host. Every endpoint is a `GET`.

## Authentication

There is none. The API serves public data only, and it serves it to anyone.

A layer is public or it is not. Private layers, and the layers shared with you through a
share link, are reachable only through the browser while you are logged in — there is no
token or key that will expose them to a script. Requesting a private layer's feed returns
a valid, empty response rather than an error (see [Missing and private
layers](./layers-api#missing-and-private-layers)).

## Cross-origin requests

The feed routes send:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

So a TLCMap feed can be fetched directly from browser JavaScript on any site. This covers
the search output, the layer and multilayer feeds, and the analysis JSON. The HTML pages
and the `/download` variants do not send those headers, because they are not meant to be
read by a script.

## Result limits

The application refuses to build a single response larger than **5,000 records**.

This is not a paging window — it is a check on the *total* number of matches. When a
search would match more, `/places` replies with a `302` to `/maxpaging`, an HTML page
explaining the limit. A client that follows redirects will receive that page with a `200`,
so a naive script sees HTML where it expected GeoJSON.

::: tip
If you are harvesting rather than fetching a known result set, use
[`/api`](./search-api#paged-harvesting-with-api) instead. It pages properly through any
number of matches with `per_page` and `page`, and reports the total. Its one restriction is
that it serves the two gazetteers only, not contributed layers.
:::

Within the limit, `/places` pages normally: `paging` sets the page size and `page` selects
the page.

The `limit` parameter is a different thing again, and it is worth knowing before you rely
on it. It takes a **random sample** of the matches — `shuffle()` then `take()` — so the
same request twice returns different records. It is there to thin a dense map, not to
truncate a result set.

## Errors

There is no error envelope, and very little use of status codes. Expect:

| Situation | What comes back |
| --- | --- |
| A search that matches more than 5,000 records | `302` to `/maxpaging` (HTML) |
| A layer or multilayer that is private or does not exist | `200` with a FeatureCollection carrying a warning and no features |
| A place ID that does not exist | `200` with an empty FeatureCollection |
| An analysis called without its required parameters | `500` |
| A format other than `json`, `csv` or `kml` on `/api` | `302` to the home page |

Check the shape of what you get rather than the status code. In particular, a response
with `features: []` is the normal way TLCMap says *nothing here*, whether that is because
the query matched nothing or because the layer is private.

## Versioning

The API is not versioned. It documents and serves the current production release, and
these pages are updated when that release changes. If you need a stable snapshot of data,
take an [RO-Crate](./ro-crate) rather than depending on the live feed.

## A note on "GHAP"

TLCMap was previously called GHAP, and the name survives in a few field names and export
labels that cannot be changed without breaking existing clients: `ghap_id` in CSV exports,
`ghap_url` in layer metadata, and the `GHAP search results` title on an exported search
crate. They mean TLCMap. New work should not use the old name anywhere else.

## Citing and courtesy

Layers are contributed by many different people under their own licences. Each layer
carries its own `creator`, `license`, `rights` and `citation` in its
[metadata](./layers-api#layer-metadata) — read those before redistributing, and cite the
layer rather than the site.

The API is served by the same machine as the application, and there is no rate limiting
to protect it. Cache what you fetch, ask for what you need, and do not poll a feed that
changes a few times a year.
