# API v2

API v2 is a new, separate API for finding places and layers. It answers the same questions as
the [original API](../), with clearer rules: parameters are checked, errors are honest, nothing
is silently dropped, and every response says what it found and what it left out.

::: warning Unstable until declared stable
v2 is new. Parameter names, response fields and limits may still change, without notice, until
it is declared stable. The original API is unaffected and keeps working as documented in the
rest of this section. Do not build anything that cannot cope with a change here.
:::

| Page | Covers |
| --- | --- |
| [Place search](./places) | `GET /api/v2/places` — find records across every source |
| [Layers](./layers) | `GET /api/v2/layers` and the layer detail and layer feature endpoints |
| [Dates](./dates) | The date forms v2 reads, periods, BCE, and undated records |
| [Errors](./errors) | Every status code and error body |
| [Differences from v1](./differences) | Where v2 answers the same question differently |

## Base URL and endpoints

```
https://tlcmap.org/api/v2
```

| Endpoint | Returns |
| --- | --- |
| `GET /api/v2/places` | Records matching a search, with a summary of the whole match set |
| `GET /api/v2/layers` | The catalogue of public layers |
| `GET /api/v2/layers/{id}` | One layer's metadata and a summary of its records |
| `GET /api/v2/layers/{id}/features` | One layer's records, paged |

`{id}` is digits only; `/api/v2/layers/abc` is a `404`. Only `GET` is routed. `OPTIONS` is
answered for cross-origin preflight; any other method is a `405`.

The examples on these pages were produced by running each request against a development copy of
the TLCMap application, not written by hand. Where a response is long, whole features or array
entries are removed and the cut is marked with a `"…"` entry. No value is edited. URLs inside
responses (`url`, `next`) are built from the host that answered, so the examples show a local
host where production shows `https://tlcmap.org`.

## JSON only, and no redirects

Every response is JSON, `Content-Type: application/json; charset=utf-8`. There is no `format`
parameter and no KML or CSV. Strings are encoded with unescaped slashes and Unicode, and the
body is not pretty-printed.

A v2 response is **never a redirect**. Where the original API sends a client to an HTML page,
v2 returns a status code and a [JSON error body](./errors).

## Strict parameters

Each endpoint has a fixed list of parameters. A request that breaks any of these rules is a
`400 INVALID_PARAMETER` naming the parameter, the rule and what is accepted:

- an **unknown** parameter, including a misspelt one;
- a **repeated** or array parameter (`?sources=anps&sources=ncg`, `?layers[]=1`);
- an **empty** value (`?bbox=`) — an empty value is an error, never a silently absent filter;
- a value of the wrong type, out of range, or not one of the allowed values;
- an invalid combination, such as `match` without `name`.

Names are `snake_case` and case-sensitive. Booleans are exactly `true` or `false`. Text values
are limited to 200 characters.

## The query is echoed

Every successful response carries `query`: every parameter the endpoint accepts, with the value
it was actually run with. Defaults are applied, filters you did not give are `null`, lists are
arrays and numbers are numbers. You never have to know the defaults to read what was searched.

```json
"query": {
  "name": "Wollombi",
  "match": "exact",
  "sources": ["layers", "anps", "ncg", "text"],
  "include_undated": true,
  "per_page": 500,
  "…": "…"
}
```

`cursor` is echoed as given, and `seed` as used.

## Paging

Lists are paged with **cursors**, never offsets. Every list response carries:

```json
"page": { "returned": 2, "per_page": 2, "next_cursor": "eyJ2…", "next": "https://tlcmap.org/api/v2/…&cursor=eyJ2…" }
```

| Field | Meaning |
| --- | --- |
| `returned` | Rows in this response |
| `per_page` | The page size used |
| `next_cursor` | The cursor for the next page, or `null` on the last page |
| `next` | The full URL of the next page — this request with `cursor` set — or `null` on the last page |

To read every page, request the URL in `next` until it is `null`.

- **The cursor is opaque.** Do not build, edit or inspect one.
- **A cursor belongs to its query.** A cursor sent with any different parameter is a `400`.
  `per_page` is the one exception: it may change between pages.
- **Paging is stable.** While the data is unchanged, paging visits every matching row exactly
  once, at any depth. A row added or removed mid-way affects only its own position.
- `total` and the `summary` are recomputed on every page and describe the match set as it is at
  that request.

`per_page` defaults and limits: 500 (maximum 5,000) on places and layer features; 100 (maximum
1,000) on the catalogue. A larger value is a `400`, not a silent cap.

### Ordering

`sort` chooses the order, `direction` is `asc` (default) or `desc`, and `nulls` is `first` or
`last` (default `last`) and places records whose sort key is empty. The catalogue has no
`nulls` parameter. The record id always breaks ties, in the same direction, so every order is
total and repeatable.

**No sort removes a record.** A record with no usable date still appears when you sort by
`start` or `end`; `nulls` puts it first or last.

### `limit` and `sample`

`limit=N` caps a result at the first N rows in the current order, across pages. It is
deterministic: the same request returns the same N rows. `total` and `summary` still describe
the whole match set. `sample` is the random alternative; see [Place
search](./places#limit-and-sample).

## The summary

Place search, layer detail and layer features carry a `summary` computed over the **whole match
set** — not the page, not the `limit`, not the sample. It states what was found and what could
not be placed:

| Field | Meaning |
| --- | --- |
| `total` | Records in the match set |
| `extent` | `[minLon, minLat, maxLon, maxLat]` of the records with coordinates, or `null` |
| `no_coordinates_count` | Matching records with no coordinates. They are in the results with `geometry: null` |
| `date_range` | `{start, end}` in epoch milliseconds: the span of the periods the dated records cover, or `null` if none is dated |
| `undated` | Records with no usable date: `total`, split into `no_date` and `unparseable_date` |
| `unparseable_dates` | Records with at least one date field whose text could not be read, dated or not |
| `by_source` | The count for each of `layers`, `anps`, `ncg`, `text`; all four keys are always present |
| `by_layer` | Place search only. One entry per layer the match set draws on: `layer_id`, `name`, `count` and the layer's `warning` verbatim, or `null` |

Nothing is dropped without being counted. See [Dates](./dates) for how a record comes to be
undated.

### Warnings travel with the results

A layer's `warning` is text its contributor wrote, often about cultural sensitivity or data
quality. v2 returns it **verbatim** — never trimmed, summarised or interpreted — in `by_layer`
on every place search and in the `layer` object on layer detail and on every page of layer
features. `null` means the field is empty or only whitespace; the text `"None"` is returned as
`"None"`.

The same applies to `license`, `rights`, `citation` and every other text field of a layer. v2
reports them; it does not tell you whether you may reuse the data. That is for the layer's
contributor and its text to say.

## Visibility

v2 serves records from the public layers and from the gazetteers. Private layers are never
served and no parameter widens this. Asking for one by id is a [`403
LAYER_PRIVATE`](./errors#_403-layer-private), and a layer that does not exist is a [`404
LAYER_NOT_FOUND`](./errors#_404-layer-not-found); a requested layer is never silently dropped
from a result.

## Cross-origin requests

Every v2 response, errors included, carries:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

A v2 URL can be fetched straight from browser JavaScript on any site. No credentials are sent
or accepted.

## Rate limit

There is an interim limit of **60 requests a minute per address**. v2 keeps its own counter,
separate from the original API's. Responses carry `X-RateLimit-Limit` and
`X-RateLimit-Remaining`; past the limit a request is a [`429
RATE_LIMITED`](./errors#_429-rate-limited) with a `Retry-After` header.

This is a provisional value. Deliberate limits will replace it. Cache what you fetch.

## Status

v2 is unstable until declared stable (see the warning at the top). The original API remains the
documented, stable interface.
