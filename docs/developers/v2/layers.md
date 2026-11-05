# Layers

Three endpoints cover layers: the catalogue, one layer's metadata, and one layer's records.

| Endpoint | Returns |
| --- | --- |
| [`GET /api/v2/layers`](#the-catalogue) | The public layers, filtered, with figures computed from their records |
| [`GET /api/v2/layers/{id}`](#layer-detail) | One layer's metadata and a summary of its records |
| [`GET /api/v2/layers/{id}/features`](#layer-features) | One layer's records, paged |

Only public layers are served. A private layer is a [`403 LAYER_PRIVATE`](./errors#_403-layer-private)
and one that does not exist is a [`404 LAYER_NOT_FOUND`](./errors#_404-layer-not-found).

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## The catalogue

```
GET https://tlcmap.org/api/v2/layers
```

Lists public layers so that you can find the ones worth reading. Every parameter is optional.
Every filter you give must match.

### Parameters

| Parameter | Default | Meaning |
| --- | --- | --- |
| `q` | none | Text contained in the layer's name, its description or one of its subject keywords, ignoring case. |
| `bbox` | none | `minLon,minLat,maxLon,maxLat`, as for [place search](./places#choosing-records). |
| `polygon` | none | `lon lat,lon lat,…`, as for place search. |
| `date_from`, `date_to` | none | A date in a [form v2 reads](./dates). |
| `include_undated` | `true` | Whether undated records count when a date filter is given. |
| `record_type` | none | The layer's record type, matched exactly, ignoring case. |
| `creator` | none | Text contained in the layer's creator, ignoring case. |
| `has_license` | none | `true` or `false`: whether the layer's `license` has any text. |
| `has_warning` | none | `true` or `false`: whether the layer's `warning` has any text. |
| `min_records` | none | Layers with at least this many records. Counts the whole layer. |
| `sort` | `id` | `id` or `name`. |
| `direction` | `asc` | `asc` or `desc`. |
| `cursor` | none | The `next_cursor` of the previous page. |
| `per_page` | `100` | 1 to 1,000. |

**`bbox`, `polygon`, `date_from`, `date_to` and `include_undated` test records, not extents.**
A layer matches if at least one of its visible records matches every one of them. A layer whose
overall extent overlaps your box but has no record inside it does not match. This is the same
test place search applies, so the catalogue lists exactly the layers that the equivalent place
search draws records from.

`has_license` and `has_warning` report **presence only**: whether there is text, never what it
says. A warning of `"None"` is text, so it counts as present. To read the text, fetch the
[layer detail](#layer-detail).

Layers with no records are listed, with `record_count` 0, unless a record filter or
`min_records` excludes them.

### The response

```json
{
  "query": {
    "…": "…"
  },
  "total": 8,
  "page": {
    "returned": 8,
    "per_page": 100,
    "next_cursor": null,
    "next": null
  },
  "layers": [
    {
      "…": "…"
    }
  ]
}
```

`total` is the number of matching layers. Each entry:

| Field | Value |
| --- | --- |
| `id` | The layer's id |
| `name`, `description`, `creator` | As stored; `null` if empty |
| `record_type` | The layer's record type |
| `record_count` | Records in the whole layer |
| `matching_count` | Records matching the record filters. `null` unless `bbox`, `polygon`, `date_from` or `date_to` was given. |
| `bbox` | `[minLon, minLat, maxLon, maxLat]` of the layer's records, or `null` if none has coordinates |
| `date_range` | `{start, end}` in epoch milliseconds over the layer's dated records, or `null` |
| `undated` | `total`, `no_date` and `unparseable_date` for the whole layer |
| `has_license` | Whether the layer has licence text |
| `has_warning` | Whether the layer has a warning |
| `url` | The layer's page on TLCMap |

`record_count`, `bbox`, `date_range` and `undated` are **computed from the layer's records**.
The extents and dates a contributor declared are not used here. They are on the layer detail,
in `declared`, as a hint only.

The catalogue is for discovery. It reports whether rights text is present; the text itself is on
the layer detail and on every page of the layer's features.

### Example: layers with a record in the Hunter Valley

```
GET /api/v2/layers?bbox=150.8,-33.1,151.4,-32.6
```

```json
{
  "query": {
    "q": null,
    "bbox": [150.8, -33.1, 151.4, -32.6],
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "record_type": null,
    "creator": null,
    "has_license": null,
    "has_warning": null,
    "min_records": null,
    "sort": "id",
    "direction": "asc",
    "cursor": null,
    "per_page": 100
  },
  "total": 8,
  "page": {
    "returned": 8,
    "per_page": 100,
    "next_cursor": null,
    "next": null
  },
  "layers": [
    {
      "id": 84,
      "name": "Australian Prisons",
      "description": "Name, location, begin and end date for prisons in Australia from 1796. Prisons open as at creation data are given 2999 as enddate.",
      "creator": "Dr Alana Piper",
      "record_type": "Other",
      "record_count": 204,
      "matching_count": 1,
      "bbox": [83.037, -43.137, 153.233, 42.319],
      "date_range": {
        "start": -5490892800000,
        "end": 32503679999999
      },
      "undated": {
        "total": 0,
        "no_date": 0,
        "unparseable_date": 0
      },
      "has_license": false,
      "has_warning": false,
      "url": "https://tlcmap.org/layers/84"
    },
    {
      "id": 102,
      "name": "1901 NSW town populations",
      "description": "Populations Table XXVII of the 1901 NSW Census report being the populations of towns and villages in the state",
      "creator": "Australian Data Archive, ANU",
      "record_type": "Other",
      "record_count": 353,
      "matching_count": 3,
      "bbox": [141.234, -37.065, 153.534, -28.3317],
      "date_range": {
        "start": -2177452800000,
        "end": -2114380800001
      },
      "undated": {
        "total": 0,
        "no_date": 0,
        "unparseable_date": 0
      },
      "has_license": false,
      "has_warning": false,
      "url": "https://tlcmap.org/layers/102"
    },
    "…"
  ]
}
```

Eight layers have at least one record in the box (two shown). Layer 84 has 204 records in all,
and one of them is in this box: `record_count` describes the layer, `matching_count` the box.

### Example: filtering on rights and size

Large layers that carry a warning, ordered by name.

```
GET /api/v2/layers?has_warning=true&min_records=10000&sort=name&per_page=2
```

```json
{
  "query": {
    "q": null,
    "bbox": null,
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "record_type": null,
    "creator": null,
    "has_license": null,
    "has_warning": true,
    "min_records": 10000,
    "sort": "name",
    "direction": "asc",
    "cursor": null,
    "per_page": 2
  },
  "total": 1,
  "page": {
    "returned": 1,
    "per_page": 2,
    "next_cursor": null,
    "next": null
  },
  "layers": [
    {
      "id": 461,
      "name": "Weather Stations, BoM",
      "description": "Historical weather stations of the Bureau of Meteorology by start and end date. Rainfall and other can be obtained from the BOM.",
      "creator": null,
      "record_type": "Organisation",
      "record_count": 17917,
      "matching_count": null,
      "bbox": [77.9672, -68.5744, 167.9708, -9.2333],
      "date_range": {
        "start": -4523212800000,
        "end": 1669939199999
      },
      "undated": {
        "total": 0,
        "no_date": 0,
        "unparseable_date": 0
      },
      "has_license": false,
      "has_warning": true,
      "url": "https://tlcmap.org/layers/461"
    }
  ]
}
```

`matching_count` is `null` because no record-level filter was given.

### Example: layers with records in a date range

```
GET /api/v2/layers?date_from=1800&date_to=1850&include_undated=false&per_page=2
```

```json
{
  "query": {
    "q": null,
    "bbox": null,
    "polygon": null,
    "date_from": "1800",
    "date_to": "1850",
    "include_undated": false,
    "record_type": null,
    "creator": null,
    "has_license": null,
    "has_warning": null,
    "min_records": null,
    "sort": "id",
    "direction": "asc",
    "cursor": null,
    "per_page": 2
  },
  "total": 44,
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiYTlmY2U1N2JlNWVjYzY5NiIsImsiOjk5LCJpIjo5OSwibiI6Mn0",
    "next": "https://tlcmap.org/api/v2/layers?date_from=1800&date_to=1850&include_undated=false&per_page=2&cursor=eyJ2IjoxLCJoIjoiYTlmY2U1N2JlNWVjYzY5NiIsImsiOjk5LCJpIjo5OSwibiI6Mn0"
  },
  "layers": [
    {
      "id": 84,
      "name": "Australian Prisons",
      "description": "Name, location, begin and end date for prisons in Australia from 1796. Prisons open as at creation data are given 2999 as enddate.",
      "creator": "Dr Alana Piper",
      "record_type": "Other",
      "record_count": 204,
      "matching_count": 34,
      "bbox": [83.037, -43.137, 153.233, 42.319],
      "date_range": {
        "start": -5490892800000,
        "end": 32503679999999
      },
      "undated": {
        "total": 0,
        "no_date": 0,
        "unparseable_date": 0
      },
      "has_license": false,
      "has_warning": false,
      "url": "https://tlcmap.org/layers/84"
    },
    {
      "id": 99,
      "name": "1833 NSW town populations",
      "description": "Populations of eight NSW towns according to the 1833 Census",
      "creator": "Hugh Craig",
      "record_type": "Other",
      "record_count": 8,
      "matching_count": 8,
      "bbox": [150.751, -33.9317, 152.918, -31.4317],
      "date_range": {
        "start": -4323283200000,
        "end": -4260211200001
      },
      "undated": {
        "total": 0,
        "no_date": 0,
        "unparseable_date": 0
      },
      "has_license": false,
      "has_warning": false,
      "url": "https://tlcmap.org/layers/99"
    }
  ]
}
```

## Layer detail

```
GET https://tlcmap.org/api/v2/layers/{id}
```

A layer's metadata and a summary of its records, without the records. It takes no parameters;
any parameter is a `400`.

Every field is always present, `null` where the stored value is empty or only whitespace. Text
fields are **verbatim**: not trimmed, normalised or interpreted. This includes `license`,
`rights`, `citation` and `warning`.

```
GET /api/v2/layers/206
```

```json
{
  "layer": {
    "id": 206,
    "name": "Music communities",
    "description": "This shows where music groups are located across Australia which are open to older adults",
    "subject_keywords": ["community music", "creative ageing", "music", "music groups"],
    "record_type": "Person",
    "creator": "Helen English",
    "publisher": null,
    "contact": "helen.english@newcastle.edu.au",
    "citation": null,
    "doi": null,
    "source_url": null,
    "linkback": null,
    "license": null,
    "rights": null,
    "language": "English",
    "warning": "None",
    "declared": {
      "latitude_from": null,
      "latitude_to": null,
      "longitude_from": null,
      "longitude_to": null,
      "temporal_from": null,
      "temporal_to": null
    },
    "created": "2022-04-12",
    "created_at": "2022-04-12T10:33:12Z",
    "updated_at": "2022-06-29T04:42:15Z",
    "url": "https://tlcmap.org/layers/206"
  },
  "summary": {
    "total": 52,
    "extent": [115.7544702, -42.88144955, 151.6112744, -31.95200028],
    "no_coordinates_count": 0,
    "date_range": null,
    "undated": {
      "total": 52,
      "no_date": 52,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 52,
      "anps": 0,
      "ncg": 0,
      "text": 0
    }
  }
}
```

| Field | Value |
| --- | --- |
| `id`, `name`, `description` | The layer's id, name and description |
| `subject_keywords` | The layer's keywords, in alphabetical order |
| `record_type` | The layer's record type |
| `creator`, `publisher`, `contact` | As stored |
| `citation`, `doi`, `source_url`, `linkback` | As stored |
| `license`, `rights` | As stored, verbatim |
| `language` | As stored |
| `warning` | As stored, verbatim. The text `"None"` is returned as `"None"`. |
| `declared` | The extents and temporal fields the contributor entered, as stored: `latitude_from`, `latitude_to`, `longitude_from`, `longitude_to`, `temporal_from`, `temporal_to`. A hint only: never used for filtering, and malformed on some layers. |
| `created` | The layer's creation date, `YYYY-MM-DD` |
| `created_at`, `updated_at` | ISO 8601, in UTC |
| `url` | The layer's page on TLCMap |

`summary` is the [summary](./#the-summary) over the layer's records, without `by_layer`.

## Layer features

```
GET https://tlcmap.org/api/v2/layers/{id}/features
```

A layer's records, as the [features of place search](./places#a-feature), in a
FeatureCollection. Records with no coordinates are included with `geometry: null`.

### Parameters

| Parameter | Default | Meaning |
| --- | --- | --- |
| `sort` | `order` | `order` is the contributor's own order in the layer. `id`, `title`, `start` and `end` are as for [place search](./places#output). |
| `direction` | `asc` | `asc` or `desc`. |
| `nulls` | `last` | `first` or `last`: where records with no sort key go. |
| `limit` | none | A whole number of 1 or more. Caps the result at the first N rows in the current order, across pages. |
| `cursor` | none | The `next_cursor` of the previous page. |
| `per_page` | `500` | 1 to 5,000. |

There are no record filters and no `sample` here. To read a layer's records within a region or
date range, use [place search](./places) with `layers` and `bbox` or `date_from` and `date_to`.

### The response

```json
{
  "type": "FeatureCollection",
  "layer": {
    "…": "the layer object, as on layer detail"
  },
  "query": {
    "…": "…"
  },
  "summary": {
    "…": "over the whole layer, without by_layer"
  },
  "page": {
    "…": "…"
  },
  "features": [
    {
      "…": "…"
    }
  ]
}
```

The `layer` object, with its warning and rights text, is on **every page**. A client reading
the feed always has the layer's conditions in front of it. `summary` always describes the whole
layer, not the page.

### Example

```
GET /api/v2/layers/206/features?per_page=2
```

```json
{
  "type": "FeatureCollection",
  "layer": {
    "id": 206,
    "name": "Music communities",
    "description": "This shows where music groups are located across Australia which are open to older adults",
    "subject_keywords": ["community music", "creative ageing", "music", "music groups"],
    "record_type": "Person",
    "creator": "Helen English",
    "publisher": null,
    "contact": "helen.english@newcastle.edu.au",
    "citation": null,
    "doi": null,
    "source_url": null,
    "linkback": null,
    "license": null,
    "rights": null,
    "language": "English",
    "warning": "None",
    "declared": {
      "latitude_from": null,
      "latitude_to": null,
      "longitude_from": null,
      "longitude_to": null,
      "temporal_from": null,
      "temporal_to": null
    },
    "created": "2022-04-12",
    "created_at": "2022-04-12T10:33:12Z",
    "updated_at": "2022-06-29T04:42:15Z",
    "url": "https://tlcmap.org/layers/206"
  },
  "query": {
    "sort": "order",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "cursor": null,
    "per_page": 2
  },
  "summary": {
    "total": 52,
    "extent": [115.7544702, -42.88144955, 151.6112744, -31.95200028],
    "no_coordinates_count": 0,
    "date_range": null,
    "undated": {
      "total": 52,
      "no_date": 52,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 52,
      "anps": 0,
      "ncg": 0,
      "text": 0
    }
  },
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiYmJlZmFlOGZhMGU3YWJkZCIsImsiOjEsImkiOjQyMjMwLCJuIjoyfQ",
    "next": "https://tlcmap.org/api/v2/layers/206/features?per_page=2&cursor=eyJ2IjoxLCJoIjoiYmJlZmFlOGZhMGU3YWJkZCIsImsiOjEsImkiOjQyMjMwLCJuIjoyfQ"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [143.481769, -37.069308]
      },
      "properties": {
        "id": "ta4f5",
        "name": "Avoca U3A",
        "placename": null,
        "description": "Avoca U3A is a voluntary Seniors Group providing educational, recreational and social programs to people in their third age of life (those of us who are retired or are semi-retired)",
        "datasource": "layers",
        "layer_id": 206,
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
        "url": "https://tlcmap.org/places/ta4f5",
        "created_at": "2022-04-12T10:53:09Z",
        "updated_at": "2026-11-01T23:59:11Z",
        "extended_data": {
          "Address": "cnr Thomas and Summers St, Avoca VIC3467",
          "Leaders": "",
          "Music Type": "ukuleles",
          "Time Day": "Tuesdays",
          "Time Hours": "2-4pm",
          "Cost": "gold coin",
          "URL": "https://u3aavoca.org.au/"
        },
        "extended_data_unreadable": false
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [143.7519446, -37.04395108]
      },
      "properties": {
        "id": "ta4f6",
        "name": "Maryborough Community House Ukulele Group",
        "placename": null,
        "description": "Reasonably simple chords. Key of C, G,D. Popular songs from 50s to 80s. Beatles and folk songs.",
        "datasource": "layers",
        "layer_id": 206,
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
        "url": "https://tlcmap.org/places/ta4f6",
        "created_at": "2022-04-12T10:53:09Z",
        "updated_at": "2026-11-01T23:59:11Z",
        "extended_data": {
          "Address": "3 Primrose St, Maryborough VIC 3465",
          "Leaders": "Philip Ashton",
          "Music Type": "ukuleles",
          "Time Day": "Fridays",
          "Time Hours": "12.3",
          "Cost": "",
          "URL": ""
        },
        "extended_data_unreadable": false
      }
    }
  ]
}
```

### Example: sorting by date, undated first

```
GET /api/v2/layers/206/features?sort=start&direction=desc&nulls=first&per_page=2
```

Every record in layer 206 is undated, so every sort key is empty and the records keep their id
order. None is dropped.

```json
{
  "type": "FeatureCollection",
  "layer": {
    "id": 206,
    "name": "Music communities",
    "description": "This shows where music groups are located across Australia which are open to older adults",
    "subject_keywords": ["community music", "creative ageing", "music", "music groups"],
    "record_type": "Person",
    "creator": "Helen English",
    "publisher": null,
    "contact": "helen.english@newcastle.edu.au",
    "citation": null,
    "doi": null,
    "source_url": null,
    "linkback": null,
    "license": null,
    "rights": null,
    "language": "English",
    "warning": "None",
    "declared": {
      "latitude_from": null,
      "latitude_to": null,
      "longitude_from": null,
      "longitude_to": null,
      "temporal_from": null,
      "temporal_to": null
    },
    "created": "2022-04-12",
    "created_at": "2022-04-12T10:33:12Z",
    "updated_at": "2022-06-29T04:42:15Z",
    "url": "https://tlcmap.org/layers/206"
  },
  "query": {
    "sort": "start",
    "direction": "desc",
    "nulls": "first",
    "limit": null,
    "cursor": null,
    "per_page": 2
  },
  "summary": {
    "total": 52,
    "extent": [115.7544702, -42.88144955, 151.6112744, -31.95200028],
    "no_coordinates_count": 0,
    "date_range": null,
    "undated": {
      "total": 52,
      "no_date": 52,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 52,
      "anps": 0,
      "ncg": 0,
      "text": 0
    }
  },
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiODdkODAyNzcwNWY4MWYxMiIsImsiOm51bGwsImkiOjQyNDE0LCJuIjoyfQ",
    "next": "https://tlcmap.org/api/v2/layers/206/features?sort=start&direction=desc&nulls=first&per_page=2&cursor=eyJ2IjoxLCJoIjoiODdkODAyNzcwNWY4MWYxMiIsImsiOm51bGwsImkiOjQyNDE0LCJuIjoyfQ"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [144.9994035, -37.76442816]
      },
      "properties": {
        "id": "ta5af",
        "name": "King Marong",
        "placename": null,
        "description": "African drumming & dancing workshops with master drummer King Marong. Learn how to make, play and tune your own djembe.",
        "datasource": "layers",
        "layer_id": 206,
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
        "url": "https://tlcmap.org/places/ta5af",
        "created_at": "2022-06-29T04:42:15Z",
        "updated_at": "2026-11-01T23:59:11Z",
        "extended_data": {
          "Address": "529-535 High Street, Northcote, Melbourne",
          "Leaders name": "",
          "Music type": "Djembe",
          "Time_Day": "Monday",
          "Time_Hours": "6.30pm-8.30pm",
          "Cost": "",
          "URL": "http://www.kingmarong.com/",
          "Facebook": ""
        },
        "extended_data_unreadable": false
      }
    },
    "…"
  ]
}
```

### Reading the next page

The URL in `page.next` is the same request with `cursor` added. The `page` object of the second page of
a request with `per_page=2&sort=id`:

```
GET /api/v2/layers/206/features?per_page=2&sort=id&cursor=…
```

```json
{
  "page": {
    "returned": 2,
    "per_page": 2,
    "next_cursor": "eyJ2IjoxLCJoIjoiNzZmYTI0MmZiMjJjYzhkMiIsImsiOjQyMjMyLCJpIjo0MjIzMiwibiI6NH0",
    "next": "https://tlcmap.org/api/v2/layers/206/features?per_page=2&sort=id&cursor=eyJ2IjoxLCJoIjoiNzZmYTI0MmZiMjJjYzhkMiIsImsiOjQyMjMyLCJpIjo0MjIzMiwibiI6NH0"
  }
}
```
