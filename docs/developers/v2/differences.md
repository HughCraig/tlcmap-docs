# Differences from v1

The [original API](../) is not versioned in its URLs; "v1" here means the API documented in the
rest of this section. v2 answers the same questions, and in several places answers them
differently on purpose. Where you move a client from v1 to v2, check each of these.

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## The answers differ

Each of these changes what a request returns.

| Behaviour | v1 does | v2 does |
| --- | --- | --- |
| Name search | `name` compares against `title` only; a gazetteer record whose `placename` is the name you typed is missed. | `name` is tested against **both** `title` and `placename`, in every `match` mode. |
| Dated searches | Records with no dates are removed from a search with `datefrom` or `dateto`, without saying so. | Undated records are **kept** by default (`include_undated=true`) and dropped only with `include_undated=false`. The summary counts them either way. |
| `sort` | Giving `sort` any value drops every record with no start or end date. | **No sort removes a record.** Records with no sort key go first or last, as `nulls` says. |
| `limit` | Takes a random sample of the matches, so the same request returns different records. | `limit` is deterministic: the first N rows in the current order, across pages. Random sampling is the separate, seedable `sample` parameter. |
| Extended data in output | Merged into the same object as the defined fields, so a contributor's field called `description` or `source` overwrites the built-in one. Values may carry HTML. | Kept in an `extended_data` object, as plain text. A contributor's field never replaces a built-in property. |
| `udateend` | In search output it is computed from the start date, so it equals `udatestart`. | `udatestart` and `udateend` each come from their own date. |
| Dates and time zones | Read in Sydney local time. A BCE year such as `-400` is misread as a relative expression and comes back as roughly the current time. Failures come back as `0` or `null`. | Read in UTC by a fixed rule. `-400` is 400 BCE. An unreadable date is `null` and is counted. See [Dates](./dates). |
| Records without coordinates | The layer feed leaves them out. | Included with `geometry: null`, and counted in `summary.no_coordinates_count`. |
| Status codes | `200` with an empty or warning-only FeatureCollection for a private or missing layer; `302` redirects for a missing `format` or a large search; `500` for missing analysis parameters. | `403 LAYER_PRIVATE`, `404 LAYER_NOT_FOUND`, and `400` for a bad request. No redirects. See [Errors](./errors). |
| The 5,000 ceiling | A search that matches more than 5,000 records is redirected to an HTML page. | There is no ceiling on the match set. Results are paged with cursors; `per_page` is capped at 5,000 for one page, and `sample` at 5,000. |
| Empty values in a layer | Empty fields are removed from the output, so absence and emptiness look the same. | Every field is always present, `null` where the stored value is empty or whitespace. |
| Warnings | A layer's `warning` is part of its layer metadata. | The layer's `warning` is returned verbatim in `summary.by_layer` on every place search, so a result never travels without the warnings of the layers it draws on, and in `layer` on layer detail and on every page of layer features. |
| Summary of a result | A search reports a total in `/api`, and nothing about dates or coordinates. | Every search carries a summary of the whole match set: extent, date range, undated and unparseable counts, counts by source and by layer. |
| Layer catalogue | `/layers/json` lists every public layer, with no filters, and includes the contributor's declared extent fields. | A filterable catalogue whose `record_count`, `bbox`, `date_range` and `undated` are computed from the layer's records. Declared fields are only a hint, on layer detail. |
| Spatial search of layers | The layer listing takes no spatial filter. | `bbox` and `polygon` on the catalogue match a layer only if one of its records is inside. |
| Layer statistics | The figures exist only on the HTML page `/layers/{id}/basicstatistics`; the JSON endpoint returns the geometry only. On the page, area is square degrees multiplied by 10,000, the centroid is the centre in the degree plane, and median and mean dates are over the start and end date strings pooled together. | [`/layers/{id}/statistics`](./statistics) returns the figures as JSON. `area_km2` is the geodesic area of the convex hull on the spheroid, in square kilometres. The centroid is on the spheroid. `median_date` and `mean_date` are over each record's period midpoint, as exact integers in epoch milliseconds. |
| Undefined figures | A figure that cannot be computed is shown as the text `Not Available`, or left out. | The figure is `null` and the request succeeds. `basis` says what each figure was computed over. |
| Vocabulary | No endpoint; the values of a field can only be found by searching. | [`/vocabulary`](./vocabulary) lists a field's values with counts, and each `value` is the exact filter for that field. |

## The request rules differ

| Behaviour | v1 does | v2 does |
| --- | --- | --- |
| Parameters | Unknown parameters are ignored. | An unknown, repeated or empty parameter is a `400` naming it. |
| Names | Run together: `datefrom`, `dateto`, `fuzzyname`, `containsname`, `paging`. | `snake_case`: `date_from`, `date_to`, `name` with `match`, `per_page`, `include_undated`, `record_type`, `feature_term`, `extended_data`, `summary_only`. |
| Paging | `page` and `per_page` offsets on `/api`; none on `/places`. | Opaque cursors on every list, with `page.next` as a ready URL. A cursor belongs to its query. |
| Output format | `format` selects `json`, `kml`, `csv` and, on search, `rocrate`. | JSON only. There is no `format` parameter. |
| Booleans | Presence of a parameter can switch a behaviour on. | `true` or `false`, nothing else. |
| The query | Not echoed. | Echoed in full, with defaults applied. |
| Rate limit | Shares one counter per address with the rest of the web application. | Its own counter, interim 60 requests a minute. |

## Not carried forward

These v1 parameters and outputs do not exist in v2. Asking for one is a `400`.

- `names`, `fuzzynames`, `containsnames` (lists of names), `subquery`, `searchdescription`
- `anps_id`, `from` and `to`, `viewBbox`, `chunks`, `download`
- The Trove-style aliases (`q`, `exactq`, `encoding`, `n`, `l-lga`, `l-place`, `s`, `e`) `q` is still a parameter of the layer catalogue, where it means something else.
- `line` on layer features. A client draws a route or timeline from the ordered points.
- The advanced analysis statistics (clustering, closeness, temporal clustering and the rest). v2
  reports a layer's basic statistics only; the advanced analyses stay on the original API for now.
- KML, CSV and RO-Crate output. The analysis endpoints and the layer and multilayer feeds of
  the original API are unchanged and are not part of v2.

v2 does not replace the original API yet. Both are served, and the original API's documentation
is unchanged.
