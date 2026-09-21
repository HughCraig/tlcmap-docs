# Analysis API

TLCMap runs five analyses over a layer. Each has a page in the browser, and most have a
JSON endpoint that returns the result as GeoJSON ready to draw on a map.

These are described from the reader's side in [Analysing a layer](/guide/analysis). This
page covers the endpoints, their parameters and the shape of what comes back.

| Analysis | JSON endpoint |
| --- | --- |
| [Basic statistics](#basic-statistics) | `/layers/{id}/basicstatistics/json` |
| Advanced statistics | *none* — see below |
| [DBScan clustering](#dbscan) | `/layers/{id}/clusteranalysis/dbscan/json` |
| [KMeans clustering](#kmeans) | `/layers/{id}/clusteranalysis/kmeans/json` |
| [Temporal clustering](#temporal-clustering) | `/layers/{id}/temporalclustering/json` |
| [Closeness analysis](#closeness-analysis) | `/layers/{id}/closenessanalysis/json` |

All of them require the layer to be public. The same analyses exist for your own private
layers under `/myprofile/mydatasets/{id}/…`, but those routes need a logged-in session and
are not usable from a script.

Every endpoint except closeness analysis also has a `/download` variant, which returns the
same JSON with a `Content-Disposition` header and a filename derived from the layer name.

Analyses are computed on request. Nothing is cached, and a large layer takes a while.

## Error behaviour

The analysis endpoints validate loosely. A missing required parameter produces a `500`,
not a `400` — the parameter is read before it is checked. Send every required parameter,
including the ones whose value is empty.

## Basic statistics

```
GET /layers/{id}/basicstatistics/json
```

No parameters.

::: warning
This endpoint returns the **geometry only** — the convex hull, centroid, bounding box and
most central place, as drawable features. The statistics themselves (total places, area,
density, distribution, date range, median and average date) are calculated for the HTML
page at `/layers/{id}/basicstatistics` and are not available as JSON.
:::

The response is a FeatureCollection with the layer's metadata and up to six features,
identified by the `name` property:

| `name` | Geometry |
| --- | --- |
| `Convex Hull` | Point — the hull's first vertex |
| `Convex Hull Polygon` | LineString — the hull |
| `Centroid` | Point |
| `Bounding Box` | Point — the box's first corner |
| `Bounding Box Polygon` | LineString — the box |
| `Most central place` | Point |

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "layerid": 1091,
    "name": "Ngarinyman materials",
    "description": "Text file with entries for Ngarinyman dictionary.",
    "warning": null,
    "ghap_url": "https://tlcmap.org/publicdatasets/1091",
    "linkback": "https://catalog.paradisec.org.au/repository/CJ1"
  },
  "features": [ … ],
  "display": { … }
}
```

The hull and box are computed with PostGIS `ST_ConvexHull` and `ST_Extent` over the
layer's points.

## Advanced statistics

There is no JSON endpoint. Advanced statistics — the pairwise and nearest-neighbour
distance summaries — exist only as the HTML page at `/layers/{id}/advancedstatistics`.

It compares every place against every other, so the cost grows with the square of the
layer size.

## Clustering

Both clustering endpoints return the same structure: a set of FeatureCollections, one per
cluster, under a `datasets` key. This is the format the TLCMap viewer reads for multiple
layers, so the result can be handed straight to a map.

```json
{
  "display": { "info": { "title": "DBSCAN Clustering of layer …" } },
  "datasets": [
    {
      "name": "Cluster 4",
      "type": "FeatureCollection",
      "features": [ … ],
      "display": { … }
    }
  ]
}
```

Each feature carries the whole record, plus the cluster it landed in:

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": ["114.8718874", "-29.11780431"] },
  "properties": {
    "Cluster_Id": 4,
    "ghap_id": "t70d2",
    "title": "Land  (29deg7')",
    "latitude": "-29.11780431",
    "longitude": "114.8718874",
    "layer_id": 152,
    "record_type": "Other",
    "linkback": null,
    "Description": "…",
    "Start Date": "08/06/1657",
    "End Date": "08/06/1657"
  },
  "display": { "popup": { "links": [ … ] } }
}
```

Note that the property names here follow the CSV export convention — `ghap_id`,
`layer_id`, `record_type` — rather than the GeoJSON feed convention used elsewhere. See
[Field names](./formats#field-names).

Coordinates are strings in this output, not numbers.

### DBScan

```
GET /layers/{id}/clusteranalysis/dbscan/json?distance=100&minPoints=3
```

| Parameter | |
| --- | --- |
| `distance` | Required. Numeric and greater than zero. |
| `minPoints` | Minimum number of neighbours for a place to anchor a cluster |

Density-based clustering via PostGIS `ST_ClusterDBSCAN`. Places too isolated to join a
cluster are left unassigned.

::: warning
`distance` is labelled kilometres in the interface, but it is divided by 100 and passed to
PostGIS as a distance in **degrees** on a geometry, not a measured ground distance. So
`distance=100` means one degree, roughly 111 km north–south, and progressively less than
that east–west the further the layer sits from the equator. Treat the number as a dial to
turn, not as a measurement.
:::

### KMeans

```
GET /layers/{id}/clusteranalysis/kmeans/json?numClusters=5&withinRadius=
```

| Parameter | |
| --- | --- |
| `numClusters` | Required. How many clusters to produce. |
| `withinRadius` | Optional, but must be present. Discards any cluster with a place further than this from the cluster's centroid. |

Partitioning via PostGIS `ST_ClusterKMeans`. Every place is assigned to a cluster, so
`withinRadius` is the only way to reject a cluster that exists because the algorithm had
to put those places somewhere.

Send `withinRadius=` empty rather than omitting it.

## Temporal clustering

```
GET /layers/{id}/temporalclustering/json?year=10&day=0
```

| Parameter | |
| --- | --- |
| `year` | Years component of the gap size |
| `day` | Days component of the gap size |

The two are added together into a single interval. Records are sorted by start date, and a
new cluster begins wherever the gap to the next date exceeds that interval.

The response has the same `{display, datasets}` shape as the clustering endpoints.

Records with no start date are dropped — `dateend` alone is not enough. On a layer whose
dates TLCMap cannot parse, `datasets` comes back empty rather than as an error.

Dates are converted to a decimal year for comparison, with months approximated at 30.44
days, so the interval is not exact to the day.

## Closeness analysis

```
GET /layers/{id}/closenessanalysis/json?targetLayer=1091
```

| Parameter | |
| --- | --- |
| `targetLayer` | Required. The ID of a **public** layer to compare against. |

The layer in the path is the source; `targetLayer` is what it is measured against. For
each place in the source, the distance to the nearest place in the target is found, and
three pairs are returned.

The response is a flat FeatureCollection of nine features — for each of the three pairs, a
point in the source layer, a point in the target layer, and the line between them:

| Line `name` | Joins |
| --- | --- |
| `Shortest minimum Line` | The closest the source layer comes to the target |
| `Longest minimum Line` | The source place furthest from anything in the target |
| `Max distance line` | The two most distant places across both layers |

The line features carry a `distance` property as a string with a `km` suffix, for example
`"12.4213 km"`. The point features carry only `name`, `latitude` and `longitude`.

Distances are true geodesic distances, computed with `ST_Distance` over geography.

::: warning
This is a cross join: every place in the source is compared against every place in the
target. Two layers of a thousand places each mean a million comparisons. Expect a long
wait, or a timeout, on large layers.
:::
