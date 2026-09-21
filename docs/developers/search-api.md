# Search API

Two endpoints run the same query engine over the same data.

| Endpoint | Use it for |
| --- | --- |
| `GET /places` | A specific result set, up to 5,000 records. Searches every source. |
| `GET /api` | Harvesting. Pages through any number of matches, but omits contributed layers. |

They take the same parameters, with the differences noted below. `GET /places/{id}/{format}`
resolves a single place.

```
https://tlcmap.org/places?format=json&fuzzyname=Wollombi
https://tlcmap.org/places/a1353c/json
https://tlcmap.org/api?format=json&fuzzyname=Wollombi&per_page=100&page=1
```

`format` is required. Without it, `/places` redirects to the home page and hands your
query to the browser interface; `/api` redirects to the home page outright. The accepted
values are `json`, `kml`, `csv` — and on `/places` also `rocrate`. See [Output
formats](./formats).

## Searching by name

Four parameters search names, and they differ in more than strictness.

| Parameter | Matches |
| --- | --- |
| `name` | `title` equal to the value, case-insensitively. **Placename is not searched.** |
| `containsname` | `title` or `placename` containing the value |
| `fuzzyname` | `title` or `placename` containing the value, *or* similar to it by trigram similarity |
| `subquery` | A substring of any of `placename`, `description`, `lga`, `state`, `feature_term`, `latitude`, `longitude`, `source`, `dataset_id` or the internal `id` |

`name` is the one that surprises people. It compares against `title` alone, so a gazetteer
record whose `placename` is *Wollombi* but whose `title` differs will not match. Reach for
`containsname` unless you know you have the exact title.

Only one of the three name parameters applies; if you send several, `name` wins, then
`fuzzyname`, then `containsname`.

Add `searchdescription=on` to widen any of them to the record's `description` as well.

`subquery` is a separate filter and combines with the others, which makes it useful for
narrowing: `?fuzzyname=Wollombi&subquery=creek`.

### Searching many names at once

`names`, `fuzzynames` and `containsnames` take a comma-separated list and match the same
way as their singular counterparts:

```
https://tlcmap.org/places?format=json&containsnames=Wollombi,Broke,Bulga
```

Names are trimmed, and empty entries are dropped. If every entry is empty, the search
returns nothing rather than everything.

### Trove-style aliases

A few parameters are accepted under Trove's names, for clients written against that API:

| Alias | Means |
| --- | --- |
| `q` | `fuzzyname` |
| `exactq` | `name` |
| `encoding` | `format` |
| `n` | `paging` |
| `l-lga` | `lga` |
| `l-place` | `state` |
| `s` | `from` |
| `e` | `to` |

## Choosing sources

TLCMap holds places from four sources. Send any of these parameters — the value is
ignored, presence is what counts — to restrict the search to those sources. Send none and
all four are searched.

| Parameter | Source | ID prefix |
| --- | --- | --- |
| `searchausgaz` | ANPS Gazetteer | `a` |
| `searchncg` | Composite Gazetteer of Australia | `n` |
| `searchpublicdatasets` | Public contributed layers | `t` |
| `searchgeocoder` | Places extracted from uploaded texts | `t` |

The last is not offered in the browser interface, but it works here. Note that it shares
the `t` prefix with contributed layers, so the prefix tells you a record is user-derived,
not which of the two it came from.

`/api` always excludes the last two. It serves the two gazetteers and nothing else,
whatever you pass.

## Identifiers

| Parameter | Selects |
| --- | --- |
| `id` | One record by its TLCMap ID, e.g. `a1353c`. `gotoid` is a synonym. |
| `anps_id` | An ANPS record by its original ANPS identifier |
| `dataitemid` | One record by its internal numeric database ID |
| `from`, `to` | A range of internal numeric database IDs |

Prefer `id`. The internal numeric IDs are an implementation detail — they are not stable
across data reloads and they are not what appears in exports.

For a single record, the path form is cleaner and is the citable URL:

```
https://tlcmap.org/places/a1353c/json
https://tlcmap.org/places/a1353c/kml
https://tlcmap.org/places/a1353c/csv
```

## Filtering

| Parameter | Effect |
| --- | --- |
| `recordtype` | Exact record type: `Placename`, `Event`, `Person`, `Journey`, `Site`, `Organisation`, `Media`, `Text`, `Other` |
| `searchlayers` | Comma-separated layer IDs. Restricts results to those layers. |
| `state` | Exact match on the state field |
| `lga` | Exact match on the Local Government Area |
| `feature_term` | One or more feature terms, separated by **semicolons** |
| `extended_data` | A condition over a record's extended data — see below |

`state`, `lga` and `feature_term` are exact matches, not substrings. The values are drawn
from the gazetteer's own vocabulary, so `lga=CESSNOCK` matches and `lga=Cessnock Council`
does not.

### Extended data

Records carry arbitrary name-and-value pairs alongside the defined fields. `extended_data`
queries them:

```
extended_data=Capacity > 200
extended_data=Description textmatch wreck
extended_data=Opened after 1900
```

The grammar is `field condition value`, with the conditions `textmatch`, `=`, `>`, `<`,
`before` and `after`. Join several with ` AND `.

::: warning
**The spaces are required**, and a condition that cannot be parsed is discarded silently
rather than reported. `Capacity>200` is not an error — it is ignored, and you get every
record in the result set back as though you had not filtered at all. Check the count.
:::

`textmatch` is a case-insensitive substring match. `=` is exact. `>` and `<` apply only to
values that are entirely digits; anything else is treated as not matching. `before` and
`after` accept `YYYY`, `YYYY-MM` or `YYYY-MM-DD` on both sides and compare the two as
dates. Field names are matched exactly, including case, and a name containing anything
but letters, digits, underscores and spaces is rejected.

## Searching an area

| Parameter | Format |
| --- | --- |
| `bbox` | `min_long,min_lat,max_long,max_lat` |
| `polygon` | `long lat, long lat, …` — space between the pair, comma between the points |
| `viewBbox` | Same as `bbox`, applied after counting — see below |

```
?bbox=151.0,-33.0,151.2,-32.8
?polygon=151.0 -33.0,151.2 -33.0,151.2 -32.8,151.0 -32.8,151.0 -33.0
```

Two things to get right:

- **Longitude comes first** in both, which is the GeoJSON convention and the opposite of
  the way coordinates are usually spoken.
- **The polygon ring must be closed.** The last point has to repeat the first. TLCMap
  passes the ring to PostGIS as written and does not close it for you.

A bounding box whose `min_long` is greater than its `max_long` is read as crossing the
180th meridian, and matches longitudes outside the pair rather than between them. Polygon
searches test each point at its own longitude and at ±360°, so a polygon spanning the
antimeridian works without special handling.

`viewBbox` narrows the returned features but is applied *after* the total is counted, so
in `/api` output the `total` reflects the query without it. It exists for the map
interface, which needs a count for the whole query and features for the visible area.

## Searching by date

`datefrom` and `dateto` take a date in any of the formats TLCMap accepts (see [Date
formats](./formats#dates)). A record matches if its own period **overlaps** the range at
any point — it does not have to fall inside it.

Either bound may be given alone.

::: warning
Records with no dates at all are excluded from a dated search. They are not treated as
"unknown, therefore possibly in range" — they are filtered out before the comparison. Most
gazetteer records are undated, so adding a date bound to a gazetteer search can cut the
result count by an order of magnitude.
:::

## Sorting

| Parameter | Effect |
| --- | --- |
| `sort` | `start` or `end` orders by start or end date. Any other value sorts the page by that field name. |
| `direction` | `asc` or `desc`, used with a field-name `sort` |

::: warning
Setting `sort` at all — to any value — drops every record that has no start or end date,
because the ordering is applied in the database before the page is built. A search
returning 216 records unsorted returns 55 with `sort=title`. If you need all the records,
sort them yourself after fetching.
:::

Without `sort`, results from a `fuzzyname` or `containsname` search come back ranked by
closeness to the search term: exact matches first, then names starting with the term, then
names containing it, then by string similarity.

## Paging and limiting

| Parameter | Endpoint | Effect |
| --- | --- | --- |
| `paging` | `/places` | Page size. Capped at 5,000. |
| `page` | both | Page number, from 1 |
| `per_page` | `/api` | Page size |
| `limit` | both | Take a **random sample** of this many records |

`/places` pages normally within the 5,000-record ceiling:

```
https://tlcmap.org/places?format=json&fuzzyname=Wollombi&paging=50&page=3
```

But the ceiling is checked against the *total* number of matches, not the page size. A
query matching 94,000 records is refused even with `paging=10`; you get a `302` to
`/maxpaging`, which is an HTML page.

`limit` escapes that, because it shrinks the result set before the check — but it samples
randomly, so consecutive identical requests return different records. Use it for a
representative scatter, never for a result set you intend to page through or compare.

### Paged harvesting with `/api`

`/api` is the endpoint for reading a lot of data. It has no 5,000-record ceiling, and its
response carries the information needed to walk the whole result set:

```
https://tlcmap.org/api?format=json&containsname=creek&per_page=100&page=1
```

```json
{
  "type": "FeatureCollection",
  "features": [ … ],
  "total": 94615,
  "next": "https://tlcmap.org/api?format=json&containsname=creek&page=2&per_page=100"
}
```

`total` is the number of matching records. `next` and `prev` are complete URLs, absent at
the ends of the range. Follow `next` until it is missing.

The trade-off is coverage: `/api` serves the ANPS and Composite gazetteers only. To
harvest contributed data, read the layers instead — see [Layers and collections
API](./layers-api).

## Other output parameters

| Parameter | Effect |
| --- | --- |
| `download` | Any value adds a `Content-Disposition: attachment` header to JSON and KML output. CSV always downloads. |
| `line` | Appends a `LineString` feature joining the points in order. `line=time` orders them by date first. |

`line=time` carries the same consequence as `sort`: undated records are dropped.

## Parameters that do nothing

These are accepted and quietly ignored. They appear in older documentation and in URLs
found in the wild:

`parish`, `source`, `circle`, `locationbias`.

`chunks`, which was meant to split a large download into a zip of numbered files, currently
returns a server error. Do not use it.
