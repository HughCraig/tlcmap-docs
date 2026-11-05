# Place search

```
GET https://tlcmap.org/api/v2/places
```

Searches every visible record — the records of public layers and the records of both
gazetteers — and returns them as GeoJSON features, with a [summary](./#the-summary) of the whole
match set.

Every parameter is optional. A request with no parameters at all is allowed and pages through
every visible record. Every filter you give must match (logical AND).

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## Parameters

### Choosing records

| Parameter | Default | Meaning |
| --- | --- | --- |
| `name` | none | A name to search for, up to 200 characters. Tested against **both** `title` and `placename`. |
| `match` | `exact` | How `name` is matched: `exact`, `contains` or `fuzzy`. Only valid with `name`. |
| `sources` | all four | Comma list of `layers`, `anps`, `ncg`, `text`. An unknown value or an empty list is a `400`. Duplicates are allowed. |
| `layers` | none | Comma list of up to 100 positive layer ids. Records must belong to one of them. A missing layer is a [`404`](./errors#_404-layer-not-found), a private one a [`403`](./errors#_403-layer-private). Gazetteer records have no layer, so `layers` excludes them. |
| `bbox` | none | `minLon,minLat,maxLon,maxLat`. Four plain decimal numbers, longitude −180 to 180, latitude −90 to 90, `minLat` no greater than `maxLat`. If `minLon` is greater than `maxLon` the box crosses the antimeridian. |
| `polygon` | none | `lon lat,lon lat,…`. At least three distinct vertices and at most 1,000. The ring is closed for you. An invalid polygon is a [`400 INVALID_GEOMETRY`](./errors#_400-invalid-geometry). A polygon cannot cross the antimeridian; `bbox` can. |
| `date_from`, `date_to` | none | A date in a [form v2 reads](./dates). A record matches if its period overlaps the range. Either may be given alone. `date_from` later than `date_to` is a `400`. |
| `include_undated` | `true` | Whether records with no usable date are kept when a date filter is given. It has no effect without `date_from` or `date_to`. |
| `state`, `lga`, `feature_term`, `record_type` | none | One value each, up to 200 characters, matched exactly and case-insensitively against the whole field. `lga=CESSNOCK` matches `Cessnock`; `lga=Cessnock Council` matches neither. `record_type` is the record's type. |
| `extended_data` | none | A condition over a record's extended data. See [Extended data filters](#extended-data-filters). |

`bbox` and `polygon` together must both match. Records with no coordinates never match a
spatial filter.

### Output

| Parameter | Default | Meaning |
| --- | --- | --- |
| `summary_only` | `false` | `true` returns only `query` and `summary`, and builds no features. |
| `sort` | `id` | `id`, `title`, `start` or `end`. `start` and `end` order by the record's first instant for that side, using the other side if it is missing; undated records have no key and go where `nulls` puts them. |
| `direction` | `asc` | `asc` or `desc`. |
| `nulls` | `last` | `first` or `last`: where records with no sort key go. |
| `limit` | none | A whole number of 1 or more. Caps the result at the first N rows in the current order, across pages. |
| `sample` | none | 1 to 5,000. A pseudo-random sample of the match set. |
| `seed` | generated | With `sample` only; up to 64 characters. |
| `cursor` | none | The `next_cursor` of the previous page. |
| `per_page` | `500` | 1 to 5,000. |

### Matching names

| `match` | A record matches when |
| --- | --- |
| `exact` | `title` or `placename` equals `name`, ignoring case. No wildcards: `%`, `_` and `\` mean themselves. |
| `contains` | `title` or `placename` contains `name`, ignoring case. |
| `fuzzy` | `title` or `placename` has trigram similarity of 0.3 or more to `name`. |

Results are not ranked by similarity; sort order is the order you choose. A fuzzy match
returns records whose text is similar, which includes spellings you did not type.

### Limit and sample

`limit` and `sample` both give a smaller result, in different ways.

- **`limit=N`** is deterministic. With `limit=1200&per_page=500` you get pages of 500, 500 and
  200, then `next_cursor: null`. `summary` and `total` still describe the whole match set.
- **`sample=N`** returns N records chosen pseudo-randomly from the match set, in one page with
  no cursor. `seed` fixes the choice: the same `sample` and `seed` return the same records while
  the data is unchanged. Without a `seed`, the server generates one and echoes it in `query`,
  so you can ask for the same sample again. If there are fewer than N matches you get them all.
  The summary describes the match set, not the sample.

`sample` cannot be combined with `sort`, `direction`, `nulls`, `limit` or `cursor`, and `seed`
needs `sample`. Each is a `400`.

### Extended data filters

`extended_data` filters on the name-and-value pairs a contributor stored with a record. It uses
a strict grammar. Anything that does not parse is a [`400
FILTER_REJECTED`](./errors#_400-filter-rejected) saying where parsing failed and what was
expected; nothing is silently discarded.

```
filter  := clause ( " AND " clause )*          at most 10 clauses; AND in capitals
clause  := field operator value
field   := quoted | bare
value   := quoted | bare
quoted  := "text" or 'text'                    no escapes; use the other quote to include one
```

| Operator | The value must be | A record matches when its field |
| --- | --- | --- |
| `=` | any text | equals it exactly, including case |
| `textmatch` | any text | contains it, ignoring case |
| `>`, `<` | a decimal number | is a decimal number and is greater or less |
| `before` | a date | is a date whose period ends before the value's period begins |
| `after` | a date | is a date whose period begins after the value's period ends |

`=`, `>` and `<` may have spaces either side or none; `textmatch`, `before` and `after` need
spaces. A field name that contains an operator character, or a value that contains ` AND `,
must be quoted. A record where the field is missing, empty or not of the operator's kind does
not match. A record whose stored extended data cannot be read does not match either; it never
makes the request fail.

Dates in `before` and `after` are read as [described on the dates page](./dates).

## The response

```json
{
  "type": "FeatureCollection",
  "query": {
    "…": "…"
  },
  "summary": {
    "…": "…"
  },
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "…",
    "next": "…"
  },
  "features": [
    {
      "…": "…"
    }
  ]
}
```

With `summary_only=true` the response is `{"query": …, "summary": …}` only.

The [summary](./#the-summary) covers the whole match set, and `by_layer` lists every layer the
search drew on with its warning.

### A feature

`geometry` is `Point` with `[longitude, latitude]` as numbers, or `null` for a record without
both coordinates. Such a record is **included**, not dropped, and is counted in
`summary.no_coordinates_count`.

Every property is always present, `null` where the record has nothing.

| Property | Value |
| --- | --- |
| `id` | The record's identifier, such as `tfa77`. Cite this. |
| `name` | The record's title |
| `placename` | The placename |
| `description` | The description, verbatim. It may contain HTML written by the contributor; v2 does not alter it. |
| `datasource` | `layers`, `anps`, `ncg` or `text` |
| `layer_id` | The layer's id, or `null` for a gazetteer record |
| `record_type` | The record type |
| `state`, `lga`, `parish`, `feature_term` | As stored |
| `datestart`, `dateend` | The stored date text, verbatim |
| `udatestart`, `udateend` | Epoch milliseconds (UTC) for `datestart` and `dateend` respectively; `null` where that side is empty or unreadable. Each comes from its own side. See [Dates](./dates). |
| `source` | The record's source text, verbatim |
| `external_url` | The record's external URL |
| `image_url` | The URL of the record's image |
| `glycerine_url` | The record's Glycerine URL |
| `url` | The record's page on TLCMap |
| `created_at`, `updated_at` | ISO 8601, in UTC |
| `extended_data` | An object of field name to value, every field the record holds, values as plain text. `{}` when there are none. |
| `extended_data_unreadable` | `true` only if the stored extended data could not be parsed; then `extended_data` is `{}` |

Extended data is kept inside `extended_data`, so a contributor's field named `description` or
`source` never replaces the built-in property of the same name.

## Examples

### A Hunter Valley search

Records inside a bounding box, two to a page.

```
GET /api/v2/places?bbox=150.8,-33.1,151.4,-32.6&per_page=2
```

```json
{
  "type": "FeatureCollection",
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": [150.8, -33.1, 151.4, -32.6],
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": false,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 2
  },
  "summary": {
    "total": 1318,
    "extent": [150.8, -33.1, 151.4, -32.6],
    "no_coordinates_count": 0,
    "date_range": {
      "start": -4133980800000,
      "end": 32503679999999
    },
    "undated": {
      "total": 1216,
      "no_date": 1216,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 104,
      "anps": 685,
      "ncg": 529,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 84,
        "name": "Australian Prisons",
        "count": 1,
        "warning": null
      },
      {
        "layer_id": 102,
        "name": "1901 NSW town populations",
        "count": 3,
        "warning": null
      },
      "…"
    ]
  },
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiM2ViNzU4N2MyMmViODUyMSIsImsiOjY0MzcsImkiOjY0MzcsIm4iOjJ9",
    "next": "http://tlcmap-ghap.laragon.local/api/v2/places?bbox=150.8%2C-33.1%2C151.4%2C-32.6&per_page=2&cursor=eyJ2IjoxLCJoIjoiM2ViNzU4N2MyMmViODUyMSIsImsiOjY0MzcsImkiOjY0MzcsIm4iOjJ9"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [151.338, -32.8173]
      },
      "properties": {
        "id": "t9a2",
        "name": "Cessnock Correctional Centre",
        "placename": null,
        "description": "While primarily established as a minimum-security prison for men, in 2012 the facilities were updated to include Australia's first purpose-built maximum-security sex offenders unit.",
        "datasource": "layers",
        "layer_id": 84,
        "record_type": "Other",
        "state": null,
        "lga": null,
        "parish": null,
        "feature_term": null,
        "datestart": "1972",
        "dateend": "2999",
        "udatestart": 63072000000,
        "udateend": 32472144000000,
        "source": null,
        "external_url": null,
        "image_url": null,
        "glycerine_url": null,
        "url": "http://tlcmap-ghap.laragon.local/places/t9a2",
        "created_at": "2021-02-17T02:37:20Z",
        "updated_at": "2026-11-01T23:59:02Z",
        "extended_data": {},
        "extended_data_unreadable": false
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [151.284, -32.7983]
      },
      "properties": {
        "id": "t1925",
        "name": "population-Pokolbin-1901",
        "placename": null,
        "description": "655\n        <table>\n\t\t\t<tr><td>Title</td><td>population-Pokolbin-1901</td></tr>\n            \n\t\t\t<tr><td>Placename</td><td>Pokolbin</td></tr>\n            \n\t\t\t<tr><td>ANPS ID</td><td>57041</td></tr>\n            \n\t\t\t<tr><td>Feature term</td><td>locality (bounded)</td></tr>\n            \n\t\t\t<tr><td>Latitude</td><td>-32.79833333</td></tr>\n            \n\t\t\t<tr><td>Longitude</td><td>151.2844444</td></tr>\n            \n\t\t\t<tr><td>State</td><td>NSW</td></tr>\n            \n\t\t\t<tr><td>Census_Placename</td><td>Pokolbin</td></tr>\n            \n\t\t\t<tr><td>County</td><td>Northumberland</td></tr>\n            \n\t\t\t<tr><td>POPULATION.</td><td>655</td></tr>\n            \n\t\t\t<tr><td>Note1_Census</td><td></td></tr>\n            \n\t\t\t<tr><td>Note2_Census</td><td></td></tr>\n            \n\t\t\t<tr><td>Note3_User</td><td></td></tr>\n            \n\t\t\t<tr><td>StartDate</td><td>1901</td></tr>\n            \n\t\t\t<tr><td>EndDate</td><td>1902</td></tr>\n            \n\t\t\t<tr><td>Link</td><td>https://hccda.ada.edu.au/Individual_Census_Tables/NSW/1901/census/tables/NSW-1901-census-02_547-1.html</td></tr>\n            \n\t\t\t<tr><td>Table</td><td>HABITATIONS. TABLE XXVII. The principal Towns and Villages in New South Wales in Alphabetical Order with the Population at the date of each Census 1871-1901 (exclusive of Aborigines).</td></tr>\n            \n\t\t\t<tr><td>Page</td><td>547</td></tr>\n            \n\t\t\t<tr><td>Column</td><td>3</td></tr>\n            \n\t\t\t<tr><td>1891</td><td>329</td></tr>\n            \n\t\t\t<tr><td>1881</td><td></td></tr>\n            \n\t\t\t<tr><td>1871</td><td></td></tr>\n            \n        </table>",
        "datasource": "layers",
        "layer_id": 102,
        "record_type": "Other",
        "state": null,
        "lga": null,
        "parish": null,
        "feature_term": null,
        "datestart": "1901",
        "dateend": "1902",
        "udatestart": -2177452800000,
        "udateend": -2145916800000,
        "source": null,
        "external_url": null,
        "image_url": null,
        "glycerine_url": null,
        "url": "http://tlcmap-ghap.laragon.local/places/t1925",
        "created_at": "2021-06-19T22:59:52Z",
        "updated_at": "2026-11-01T23:58:59Z",
        "extended_data": {
          "1871": "",
          "1881": "",
          "1891": "329",
          "Title": "population-Pokolbin-1901",
          "Placename": "Pokolbin",
          "ANPS ID": "57041",
          "Feature term": "locality (bounded)",
          "Latitude": "-32.79833333",
          "Longitude": "151.2844444",
          "State": "NSW",
          "Census_Placename": "Pokolbin",
          "County": "Northumberland",
          "POPULATION.": "655",
          "Note1_Census": "",
          "Note2_Census": "",
          "Note3_User": "",
          "StartDate": "1901",
          "EndDate": "1902",
          "Link": "https://hccda.ada.edu.au/Individual_Census_Tables/NSW/1901/census/tables/NSW-1901-census-02_547-1.html",
          "Table": "HABITATIONS. TABLE XXVII. The principal Towns and Villages in New South Wales in Alphabetical Order with the Population at the date of each Census 1871-1901 (exclusive of Aborigines).",
          "Page": "547",
          "Column": "3"
        },
        "extended_data_unreadable": false
      }
    }
  ]
}
```

The summary tells you what the two features on this page are part of: 1,318 records, 1,216 of
them undated, drawn from eight layers (two are shown here). Follow `page.next` for the next two
features.

### Only the summary

```
GET /api/v2/places?bbox=150.8,-33.1,151.4,-32.6&summary_only=true
```

```json
{
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": [150.8, -33.1, 151.4, -32.6],
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": true,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 500
  },
  "summary": {
    "total": 1318,
    "extent": [150.8, -33.1, 151.4, -32.6],
    "no_coordinates_count": 0,
    "date_range": {
      "start": -4133980800000,
      "end": 32503679999999
    },
    "undated": {
      "total": 1216,
      "no_date": 1216,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 104,
      "anps": 685,
      "ncg": 529,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 84,
        "name": "Australian Prisons",
        "count": 1,
        "warning": null
      },
      {
        "layer_id": 102,
        "name": "1901 NSW town populations",
        "count": 3,
        "warning": null
      },
      {
        "layer_id": 140,
        "name": "Trove Newspaper Publication Locations",
        "count": 5,
        "warning": null
      },
      "…"
    ]
  }
}
```

### A fuzzy name search

`Wollombe` is a misspelling of Wollombi; `match=fuzzy` still finds it.

```
GET /api/v2/places?name=Wollombe&match=fuzzy&per_page=1
```

```json
{
  "type": "FeatureCollection",
  "query": {
    "name": "Wollombe",
    "match": "fuzzy",
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": null,
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": false,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 1
  },
  "summary": {
    "total": 151,
    "extent": [116.49809, -37.62430573, 153.4011111111111, -17.211666666666666],
    "no_coordinates_count": 1,
    "date_range": {
      "start": -4133980800000,
      "end": 1669939199999
    },
    "undated": {
      "total": 112,
      "no_date": 112,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 40,
      "anps": 62,
      "ncg": 49,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 118,
        "name": "I've been everywhere",
        "count": 2,
        "warning": null
      },
      {
        "layer_id": 140,
        "name": "Trove Newspaper Publication Locations",
        "count": 4,
        "warning": null
      },
      "…"
    ]
  },
  "page": {
    "returned": 1,
    "per_page": 1,
    "next_cursor": "eyJ2IjoxLCJoIjoiZGZmZDAxZjFlY2RiOTI1ZCIsImsiOjEwMDIzLCJpIjoxMDAyMywibiI6MX0",
    "next": "http://tlcmap-ghap.laragon.local/api/v2/places?name=Wollombe&match=fuzzy&per_page=1&cursor=eyJ2IjoxLCJoIjoiZGZmZDAxZjFlY2RiOTI1ZCIsImsiOjEwMDIzLCJpIjoxMDAyMywibiI6MX0"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [150.8927778, -34.42333333]
      },
      "properties": {
        "id": "t2727",
        "name": "Wollongong",
        "placename": null,
        "description": null,
        "datasource": "layers",
        "layer_id": 118,
        "record_type": "Other",
        "state": null,
        "lga": null,
        "parish": null,
        "feature_term": null,
        "datestart": null,
        "dateend": null,
        "udatestart": null,
        "udateend": null,
        "source": null,
        "external_url": null,
        "image_url": null,
        "glycerine_url": null,
        "url": "http://tlcmap-ghap.laragon.local/places/t2727",
        "created_at": "2021-08-06T02:18:06Z",
        "updated_at": "2026-11-01T23:59:09Z",
        "extended_data": {},
        "extended_data_unreadable": false
      }
    }
  ]
}
```

### A date range, excluding undated records

```
GET /api/v2/places?bbox=150.8,-33.1,151.4,-32.6&date_from=1820&date_to=1860&include_undated=false&per_page=1
```

```json
{
  "type": "FeatureCollection",
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": [150.8, -33.1, 151.4, -32.6],
    "polygon": null,
    "date_from": "1820",
    "date_to": "1860",
    "include_undated": false,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": false,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 1
  },
  "summary": {
    "total": 3,
    "extent": [151.139937, -32.938517, 151.253163, -32.889106],
    "no_coordinates_count": 0,
    "date_range": {
      "start": -4133980800000,
      "end": -3780172800001
    },
    "undated": {
      "total": 0,
      "no_date": 0,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 3,
      "anps": 0,
      "ncg": 0,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 379,
        "name": "AusStage Venues",
        "count": 3,
        "warning": null
      }
    ]
  },
  "page": {
    "returned": 1,
    "per_page": 1,
    "next_cursor": "eyJ2IjoxLCJoIjoiNzBlZDUzZTgxMGU1ZWRkNSIsImsiOjY0MTE5LCJpIjo2NDExOSwibiI6MX0",
    "next": "http://tlcmap-ghap.laragon.local/api/v2/places?date_from=1820&date_to=1860&bbox=150.8%2C-33.1%2C151.4%2C-32.6&include_undated=false&per_page=1&cursor=eyJ2IjoxLCJoIjoiNzBlZDUzZTgxMGU1ZWRkNSIsImsiOjY0MTE5LCJpIjo2NDExOSwibiI6MX0"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [151.139937, -32.93726]
      },
      "properties": {
        "id": "tfa77",
        "name": "Governor Gipps Inn",
        "placename": "Governor Gipps Inn",
        "description": "A venue from The Australian Live Performance Database 'AusStage'.",
        "datasource": "layers",
        "layer_id": 379,
        "record_type": "Other",
        "state": "NSW",
        "lga": null,
        "parish": null,
        "feature_term": null,
        "datestart": "1849-03-17",
        "dateend": null,
        "udatestart": -3811881600000,
        "udateend": null,
        "source": null,
        "external_url": "https://www.ausstage.edu.au/pages/venue/14220",
        "image_url": null,
        "glycerine_url": null,
        "url": "http://tlcmap-ghap.laragon.local/places/tfa77",
        "created_at": "2022-11-14T01:43:01Z",
        "updated_at": "2026-11-01T23:59:32Z",
        "extended_data": {
          "original_id": "14220",
          "street": "Negro Street",
          "suburb": "Wollombi",
          "postcode": "2325",
          "web_links": ""
        },
        "extended_data_unreadable": false
      }
    }
  ]
}
```

Without `include_undated=false` the undated records in the box are kept, and `summary.undated`
would count them. See [Dates](./dates#filtering-by-date).

### A seeded sample

```
GET /api/v2/places?bbox=150.8,-33.1,151.4,-32.6&sample=1&seed=docs
```

```json
{
  "type": "FeatureCollection",
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": [150.8, -33.1, 151.4, -32.6],
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": false,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": 1,
    "seed": "docs",
    "cursor": null,
    "per_page": 500
  },
  "summary": {
    "total": 1318,
    "extent": [150.8, -33.1, 151.4, -32.6],
    "no_coordinates_count": 0,
    "date_range": {
      "start": -4133980800000,
      "end": 32503679999999
    },
    "undated": {
      "total": 1216,
      "no_date": 1216,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 104,
      "anps": 685,
      "ncg": 529,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 84,
        "name": "Australian Prisons",
        "count": 1,
        "warning": null
      },
      {
        "layer_id": 102,
        "name": "1901 NSW town populations",
        "count": 3,
        "warning": null
      },
      "…"
    ]
  },
  "page": {
    "returned": 1,
    "per_page": 500,
    "next_cursor": null,
    "next": null
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [151.1511111111111, -32.965]
      },
      "properties": {
        "id": "ab573",
        "name": "Milsoms Arm",
        "placename": "Milsoms Arm",
        "description": "A watercourse about 6 km long. It rises about 2 km NE by E of Crump trig. station and flows generally NW by W into Wollembi Brook.          ",
        "datasource": "anps",
        "layer_id": null,
        "record_type": "Placename",
        "state": "NSW",
        "lga": "CESSNOCK",
        "parish": "CORRABARE",
        "feature_term": "creek",
        "datestart": null,
        "dateend": null,
        "udatestart": null,
        "udateend": null,
        "source": "State Records (TLCM)",
        "external_url": null,
        "image_url": null,
        "glycerine_url": null,
        "url": "http://tlcmap-ghap.laragon.local/places/ab573",
        "created_at": "2023-03-29T06:51:38Z",
        "updated_at": "2023-03-29T06:51:38Z",
        "extended_data": {},
        "extended_data_unreadable": false
      }
    }
  ]
}
```

### An extended data filter

```
GET /api/v2/places?layers=206&extended_data=Cost textmatch coin&summary_only=true
```

```json
{
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": [206],
    "bbox": null,
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": "Cost textmatch coin",
    "summary_only": true,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 500
  },
  "summary": {
    "total": 4,
    "extent": [143.481769, -37.80474176, 144.9885944, -36.85803492],
    "no_coordinates_count": 0,
    "date_range": null,
    "undated": {
      "total": 4,
      "no_date": 4,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 4,
      "anps": 0,
      "ncg": 0,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 206,
        "name": "Music communities",
        "count": 4,
        "warning": "None"
      }
    ]
  }
}
```

(Spaces in `extended_data` are percent-encoded in a real request; most HTTP clients do this for
you.)

### Paging and `limit`

```
GET /api/v2/places?name=Cessnock&match=contains&limit=3&per_page=2
```

The summary describes all 41 matches; `limit` stops the pages after three rows. The page object
shows the cursor and the ready-made URL for the next page.

```json
{
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiZjZhZTQ2ZGI3NWZlM2QxMiIsImsiOjE0MTMwLCJpIjoxNDEzMCwibiI6Mn0",
    "next": "http://tlcmap-ghap.laragon.local/api/v2/places?name=Cessnock&match=contains&limit=3&per_page=2&cursor=eyJ2IjoxLCJoIjoiZjZhZTQ2ZGI3NWZlM2QxMiIsImsiOjE0MTMwLCJpIjoxNDEzMCwibiI6Mn0"
  }
}
```
