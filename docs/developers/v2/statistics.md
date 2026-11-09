# Layer statistics

```
GET https://tlcmap.org/api/v2/layers/{id}/statistics
```

A layer's figures: how many records it has, where they lie, how much ground they cover, when
they date from, and which feature terms they carry. They are computed from all of the layer's
records at the time of the request, by the server. Nothing is estimated, and nothing is
rounded.

It takes no parameters; any parameter is a [`400`](./errors#_400-invalid-parameter). There is no
`query` echo, as on [layer detail](./layers#layer-detail). `{id}` is digits only. A private layer
is a [`403 LAYER_PRIVATE`](./errors#_403-layer-private) and one that does not exist a [`404
LAYER_NOT_FOUND`](./errors#_404-layer-not-found).

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## The response

```json
{
  "layer": { "id": 461, "name": "…", "warning": "…", "url": "…" },
  "statistics": {
    "count": 17917,
    "basis": { "records": 17917, "with_coordinates": 17917, "dated": 17917 },
    "extent": [77.9672, -68.5744, 167.9708, -9.2333],
    "centroid": [141.6124756254918, -31.326447147130587],
    "convex_hull": { "type": "Polygon", "coordinates": ["…"] },
    "area_km2": 34487726.86391905,
    "density_per_km2": 0.0005195181483168352,
    "date_range": { "start": -4523212800000, "end": 1669939199999 },
    "median_date": -118368000001,
    "mean_date": -163806404734,
    "undated": { "total": 0, "no_date": 0, "unparseable_date": 0 },
    "unparseable_dates": 0,
    "feature_terms": { "with_value": 0, "without_value": 17917, "values": [] }
  }
}
```

Every key is always present.

`layer` identifies the layer and carries its `warning` **verbatim**, as the
[summary](./#warnings-travel-with-the-results) does: `null` only when the field is empty or only
whitespace, so the text `"None"` is returned as `"None"`. Keep the warning beside any figure you
quote from this response. The layer's `license`, `rights` and `citation` are on [layer
detail](./layers#layer-detail).

## What the figures were computed over

`basis` states it:

| Field | Meaning |
| --- | --- |
| `records` | Records in the layer. Equal to `count`. |
| `with_coordinates` | Records that have coordinates. The spatial figures are computed over these. |
| `dated` | Records with a usable date. The date figures are computed over these. See [Dates](./dates). |

A figure that is undefined for a layer is `null`, and the request still succeeds. There is no
"not enough records" error: a layer of two records still reports its count, extent and dates. An
empty layer reports `count: 0`, a `basis` of zeros, `undated` counts of zero, `feature_terms` with
zero counts and no values, and every other figure `null`.

## Spatial figures

| Figure | Definition | `null` when |
| --- | --- | --- |
| `extent` | `[minLon, minLat, maxLon, maxLat]` of the records with coordinates, as in the [summary](./#the-summary). | no record has coordinates |
| `centroid` | `[lon, lat]`: the centre of the records' locations, measured on the surface of the earth's spheroid. | no record has coordinates |
| `convex_hull` | The smallest convex shape that holds every record with coordinates, as a GeoJSON geometry. A `Polygon`, or a `Point` or `LineString` when the records are at one location or in a straight line. | no record has coordinates |
| `area_km2` | The area of the convex hull in square kilometres, measured on the spheroid (geodesic area). `0` when the hull is a `Point` or `LineString`. | no record has coordinates |
| `density_per_km2` | `with_coordinates` divided by `area_km2`. | `area_km2` is `0` or `null` |

The hull is drawn in the longitude and latitude plane, with straight edges there, and its area is
measured on the spheroid. Neither the centroid nor the area is in square degrees, which shrink
with latitude. The centroid is not the centre of the extent.

::: warning The antimeridian
A layer whose records lie on both sides of the 180th meridian gets an extent and a hull that wrap
the wrong way round the world: from the far west to the far east, across everything between.
The [summary](./#the-summary) extent has the same limitation. Its `area_km2` and
`density_per_km2` are not meaningful for such a layer. This is a known limitation of v2.
:::

Spatial figures are returned as computed, not rounded.

## Date figures

All dates are epoch milliseconds (UTC) as JSON integers, negative before 1970. They are computed
over the records with a usable date, and each of those has a period with a first and a last
instant: `1856` is the whole of that year. See [Dates](./dates).

| Figure | Definition | `null` when |
| --- | --- | --- |
| `date_range` | `{start, end}`: the earliest first instant and the latest last instant of any dated record, as in the [summary](./#the-summary). | no record is dated |
| `median_date` | The median of the records' midpoints (below). For an even count, the whole number just below the mean of the two middle values. | no record is dated |
| `mean_date` | The whole number just below the mean of the records' midpoints. | no record is dated |
| `undated` | `{total, no_date, unparseable_date}`, as in the [summary](./#the-summary): records with no usable date, and why. | never |
| `unparseable_dates` | Records with at least one date field whose text could not be read, dated or not. | never |

### The midpoint rule

A record names a period, not an instant, so each dated record contributes one value to the median
and the mean: the **midpoint** of its period. A record dated `1856` contributes the middle of
that year, −3,581,712,000,001 (one millisecond before 2 July 1856 00:00 UTC). A record dated
`1820` to `1860` contributes the middle of that span. Taking each record's first instant instead
would pull every figure early by half the length of each period.

The midpoint, the mean and the median are exact whole numbers. "Just below" means rounded toward
earlier dates (toward negative infinity), also for dates before 1970. Nothing passes through a
floating-point number, which cannot hold every date v2 reads exactly. `date_range` and the
`undated` counts are the same figures as in the layer's [summary](./#the-summary), so a layer
reports one set of numbers wherever you ask.

## Feature terms

`feature_terms` is the layer's `feature_term` [vocabulary](./vocabulary), grouped by the same rule
and in the same shape:

| Field | Meaning |
| --- | --- |
| `with_value` | Records in the layer that have a feature term. |
| `without_value` | Records that have none. |
| `values` | The entries: `value`, `record_count` and `spellings`, as in the [vocabulary](./vocabulary#grouping). Ordered by `record_count`, largest first, then by value. All of them; there is no paging. |

The same entries, paged, are `GET /api/v2/vocabulary?field=feature_term&layers={id}`.

## Examples

### A layer with no dated records

Layer 206 has 52 records, all with coordinates and none with a date. The date figures are `null`,
`basis.dated` is `0`, and all 52 records are counted under `undated.no_date`. Its `warning` is the
text `None`, returned as it is stored. Of the 52 records, 3 have a feature term.

```
GET /api/v2/layers/206/statistics
```

```json
{
  "layer": {
    "id": 206,
    "name": "Music communities",
    "warning": "None",
    "url": "https://tlcmap.org/layers/206"
  },
  "statistics": {
    "count": 52,
    "basis": {
      "records": 52,
      "with_coordinates": 52,
      "dated": 0
    },
    "extent": [115.7544702, -42.88144955, 151.6112744, -31.95200028],
    "centroid": [143.96601571022015, -37.20876404770458],
    "convex_hull": {
      "type": "Polygon",
      "coordinates": [
        [
          [147.3253124, -42.88144955],
          [115.7544702, -32.03374116],
          "…",
          [147.3253124, -42.88144955]
        ]
      ]
    },
    "area_km2": 2139082.210203698,
    "density_per_km2": 2.43094911228532e-5,
    "date_range": null,
    "median_date": null,
    "mean_date": null,
    "undated": {
      "total": 52,
      "no_date": 52,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "feature_terms": {
      "with_value": 3,
      "without_value": 49,
      "values": [
        {
          "value": "community choir",
          "record_count": 1,
          "spellings": [
            {
              "value": "community choir",
              "record_count": 1
            }
          ]
        },
        {
          "value": "community orchestra",
          "record_count": 1,
          "spellings": [
            {
              "value": "community orchestra",
              "record_count": 1
            }
          ]
        },
        {
          "value": "folk and jazz",
          "record_count": 1,
          "spellings": [
            {
              "value": "folk and jazz",
              "record_count": 1
            }
          ]
        }
      ]
    }
  }
}
```

The records stretch from Western Australia to Tasmania, so the hull is large (about 2.1 million
square kilometres) and the density low. Only some of the hull's points are shown.

### A layer with dated records

Layer 461, the Bureau of Meteorology's weather stations, has 17,917 records, all dated. Its warning
says how the dates were made; it travels with every figure.

```
GET /api/v2/layers/461/statistics
```

```json
{
  "layer": {
    "id": 461,
    "name": "Weather Stations, BoM",
    "warning": "Dates in the original data included month and year only, the day '01' has been added to all.",
    "url": "https://tlcmap.org/layers/461"
  },
  "statistics": {
    "count": 17917,
    "basis": {
      "records": 17917,
      "with_coordinates": 17917,
      "dated": 17917
    },
    "extent": [77.9672, -68.5744, 167.9708, -9.2333],
    "centroid": [141.6124756254918, -31.326447147130587],
    "convex_hull": {
      "type": "Polygon",
      "coordinates": [
        [
          [77.9672, -68.5744],
          [96.8181, -12.1744],
          "…",
          [77.9672, -68.5744]
        ]
      ]
    },
    "area_km2": 34487726.86391905,
    "density_per_km2": 0.0005195181483168352,
    "date_range": {
      "start": -4523212800000,
      "end": 1669939199999
    },
    "median_date": -118368000001,
    "mean_date": -163806404734,
    "undated": {
      "total": 0,
      "no_date": 0,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "feature_terms": {
      "with_value": 0,
      "without_value": 17917,
      "values": []
    }
  }
}
```

`date_range` runs from 1 September 1826 to the last millisecond of 1 December 2022: the layer's
dates are single days, the first of a month (the warning says the day was added), and a day's
period ends on its last millisecond. `median_date` is
−118,368,000,001 (the last millisecond of 1 April 1966), and `mean_date` is −163,806,404,734
(23 October 1964, about two hours after midnight). The two are not the same because the mean is
pulled by the early records. No `feature_terms` are held for this layer, so `values` is empty and
`without_value` counts every record. Only some of the hull's points are shown.
