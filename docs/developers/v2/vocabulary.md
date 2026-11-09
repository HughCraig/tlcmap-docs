# Vocabulary

```
GET https://tlcmap.org/api/v2/vocabulary
```

Lists the distinct values of one field among the records a set of filters selects, each with
its record count. These are the valid values for that field's exact-match filter in [place
search](./places), and the groups a summary by that field can be built from.

`field` is required. Every other parameter is optional. The record filters are place search's,
and a request with no filter at all groups every visible record.

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## Parameters

| Parameter | Default | Meaning |
| --- | --- | --- |
| `field` | none, **required** | The field to list: `feature_term`, `state`, `lga`, `parish` or `record_type`. A missing `field` is a `400` with rule `required`; an unknown value is a `400` naming the five it accepts. |
| `name`, `match`, `sources`, `layers`, `bbox`, `polygon`, `date_from`, `date_to`, `include_undated`, `state`, `lga`, `parish`, `feature_term`, `record_type`, `extended_data` | none | Place search's record filters, with the same rules, defaults and errors. See [Place search](./places#parameters). Only the records the filters select are grouped. |
| `sort` | `value` | `value` or `record_count`. |
| `direction` | `asc` | `asc` or `desc`. |
| `cursor` | none | The `next_cursor` of the previous page. |
| `per_page` | `1000` | 1 to 10,000. A larger value is a `400`, not a silent cap. |

Filtering on the listed field itself is allowed and yields at most one entry. There is no
`nulls`, because no sort key here is ever empty, and there is no `limit`, `sample` or
`summary_only`. As everywhere in v2, an unknown, repeated or empty parameter is a
[`400`](./errors#_400-invalid-parameter). A `layers` id that does not exist is a [`404
LAYER_NOT_FOUND`](./errors#_404-layer-not-found), and a private one a [`403
LAYER_PRIVATE`](./errors#_403-layer-private). Only gazetteer records and the records of public
layers are ever grouped, as in place search.

## The response

```json
{
  "query": { "field": "feature_term", "bbox": [150.8, -33.1, 151.4, -32.6], "…": "…" },
  "total": 59,
  "records": { "total": 1318, "with_value": 1214, "without_value": 104 },
  "page": { "returned": 59, "per_page": 1000, "next_cursor": null, "next": null },
  "values": [
    {
      "value": "state forest",
      "record_count": 14,
      "spellings": [
        { "value": "state forest", "record_count": 8 },
        { "value": "State forest", "record_count": 6 }
      ]
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `query` | Every parameter, with the value it was run with, as everywhere in [v2](./#the-query-is-echoed). `field` comes first. |
| `total` | The number of entries across all pages: the number of distinct values among the matching records. |
| `records` | The match set the entries were grouped from. See [Records without a value](#records-without-a-value). |
| `page` | [Paging](./#paging): `returned`, `per_page`, `next_cursor` and `next`. |
| `values` | The entries on this page. |

Every key is always present.

## Grouping

Records are grouped on a **key**: the stored value with the whitespace around it removed
(space, tab, carriage return and line feed), compared ignoring case. For `record_type` the value
is the record's type. This is the same comparison the field's filter makes, so an entry is exactly
the set of records its value selects.

Each entry has:

| Field | Meaning |
| --- | --- |
| `record_count` | The records whose key is this entry's. |
| `spellings` | Every distinct way the value is stored among those records, **verbatim**: padding and case as stored. Each has its own `record_count`. They are ordered by count, largest first, then by value in plain byte order, and the counts add up to the entry's `record_count`. |
| `value` | The first spelling, with the surrounding whitespace removed. This is the one value in the response that is trimmed. |

In the first example below, `state forest` is stored two ways in the Hunter Valley: `state
forest` for 8 records and `State forest` for 6. They are one entry of 14 records, and `value` is
the more common spelling. `spellings` is for a client that must say how the data is actually
written; most clients can ignore it.

## Records without a value

A record whose field is empty, only whitespace, or null cannot be placed in any entry. It is
never listed as an entry whose `value` is `""`. It is counted instead:

| `records` field | Meaning |
| --- | --- |
| `total` | Every record the filters select. |
| `with_value` | Records that have a value for `field`, and so belong to an entry. |
| `without_value` | The rest: `total` minus `with_value`. |

`records` describes the whole match set, not the page, and is computed on every page. The
`record_count`s of all entries, over all pages, add up to `with_value`. Report `without_value`
whenever you report a grouping: it is what the grouping cannot place.

## Order and paging

`sort=value` (the default) orders entries by their key, the lower-cased value, in plain byte order
rather than the database's collation, so the order never depends on the server's locale:
`[Unknown]` comes before `ACT` in the states example because `[` sorts before `a`.
`sort=record_count` orders by the count, and entries with the same count are ordered by their
key in the same direction. Every order is therefore total and repeatable.

Paging is by [cursor](./#paging), like every list: request `page.next` until it is `null`. A
cursor belongs to its query; one from place search, from another `field`, or from a different
`sort` or `direction` is a `400`. While the data is unchanged, every entry is served exactly
once. `per_page` defaults to 1,000 and is capped at 10,000.

## Passing a value back

A `value` is exactly what the field's filter expects. For any filters, take an entry from the
vocabulary and give its `value` as the filter for the same field in place search, with the same
other filters: the result's `summary.total` is the entry's `record_count`.

The filter ignores case and the whitespace around a stored value, and compares the whole value
without wildcards, so `state forest` and `State forest` both select all 14 records. See
[Place search](./places#matching-whole-values).

## Examples

### Feature terms in the Hunter Valley

The feature terms of the records inside a bounding box. There are 59, in one page; only some are
shown.

```
GET /api/v2/vocabulary?field=feature_term&bbox=150.8,-33.1,151.4,-32.6
```

```json
{
  "query": {
    "field": "feature_term",
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
    "parish": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "sort": "value",
    "direction": "asc",
    "cursor": null,
    "per_page": 1000
  },
  "total": 59,
  "records": {
    "total": 1318,
    "with_value": 1214,
    "without_value": 104
  },
  "page": {
    "returned": 59,
    "per_page": 1000,
    "next_cursor": null,
    "next": null
  },
  "values": [
    {
      "value": "aerodrome",
      "record_count": 1,
      "spellings": [
        {
          "value": "aerodrome",
          "record_count": 1
        }
      ]
    },
    {
      "value": "airport",
      "record_count": 1,
      "spellings": [
        {
          "value": "airport",
          "record_count": 1
        }
      ]
    },
    "…",
    {
      "value": "state forest",
      "record_count": 14,
      "spellings": [
        {
          "value": "state forest",
          "record_count": 8
        },
        {
          "value": "State forest",
          "record_count": 6
        }
      ]
    },
    "…"
  ]
}
```

Of the 1,318 records in the box, 1,214 have a feature term and 104 do not. `state forest` is one
entry of 14 records stored in two spellings. Passing it back gives the same 14:

```
GET /api/v2/places?bbox=150.8,-33.1,151.4,-32.6&feature_term=state%20forest&summary_only=true
```

returns a `summary` whose `total` is `14`.

### An unfiltered list of states

With no filter, every visible record is grouped. Only some of the 12 entries are shown.

```
GET /api/v2/vocabulary?field=state
```

```json
{
  "query": {
    "field": "state",
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": null,
    "polygon": null,
    "date_from": null,
    "date_to": null,
    "include_undated": true,
    "state": null,
    "lga": null,
    "parish": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "sort": "value",
    "direction": "asc",
    "cursor": null,
    "per_page": 1000
  },
  "total": 12,
  "records": {
    "total": 681827,
    "with_value": 639213,
    "without_value": 42614
  },
  "page": {
    "returned": 12,
    "per_page": 1000,
    "next_cursor": null,
    "next": null
  },
  "values": [
    {
      "value": "[Unknown]",
      "record_count": 3,
      "spellings": [
        {
          "value": "[Unknown]",
          "record_count": 3
        }
      ]
    },
    {
      "value": "ACT",
      "record_count": 2513,
      "spellings": [
        {
          "value": "ACT",
          "record_count": 2513
        }
      ]
    },
    "…",
    {
      "value": "NSW",
      "record_count": 173378,
      "spellings": [
        {
          "value": "NSW",
          "record_count": 173378
        }
      ]
    },
    "…"
  ]
}
```

`records.without_value` is 42,614: the records with no state. The values are listed as the data
holds them, including `FED`, `NFK`, `O/S` and `[Unknown]`.

### Parishes, by record count

Parishes in the Hunter Valley, the most common first, three to a page. `CORRABARE` and `CESSNOCK`
each have 27 records, so the tie is broken by key, descending, and `CORRABARE` comes first. 781 of
the 1,318 records have no parish. Request `page.next` for the next three.

```
GET /api/v2/vocabulary?field=parish&bbox=150.8,-33.1,151.4,-32.6&sort=record_count&direction=desc&per_page=3
```

```json
{
  "query": {
    "field": "parish",
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
    "parish": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "sort": "record_count",
    "direction": "desc",
    "cursor": null,
    "per_page": 3
  },
  "total": 55,
  "records": {
    "total": 1318,
    "with_value": 537,
    "without_value": 781
  },
  "page": {
    "returned": 3,
    "per_page": 3,
    "next_cursor": "eyJ2IjoxLCJoIjoiNGUyYjhjNDAyYjliNjY3ZSIsImsiOiIwMDAwMDAwMDAwMDAwMDAwMDI2IGJ1cnJhZ3VycmEiLCJpIjowLCJuIjozfQ",
    "next": "https://tlcmap.org/api/v2/vocabulary?field=parish&bbox=150.8%2C-33.1%2C151.4%2C-32.6&per_page=3&sort=record_count&direction=desc&cursor=eyJ2IjoxLCJoIjoiNGUyYjhjNDAyYjliNjY3ZSIsImsiOiIwMDAwMDAwMDAwMDAwMDAwMDI2IGJ1cnJhZ3VycmEiLCJpIjowLCJuIjozfQ"
  },
  "values": [
    {
      "value": "CORRABARE",
      "record_count": 27,
      "spellings": [
        {
          "value": "CORRABARE",
          "record_count": 27
        }
      ]
    },
    {
      "value": "CESSNOCK",
      "record_count": 27,
      "spellings": [
        {
          "value": "CESSNOCK",
          "record_count": 27
        }
      ]
    },
    {
      "value": "BURRAGURRA",
      "record_count": 26,
      "spellings": [
        {
          "value": "BURRAGURRA",
          "record_count": 26
        }
      ]
    }
  ]
}
```
