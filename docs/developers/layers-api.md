# Layers and collections API

A **layer** is a set of contributed place records published together with its own
metadata. A **multilayer** groups several layers, and optionally saved searches, so they
can be read and cited as one thing. Both are public or private; only public ones are
served here.

Layers are the right way to harvest contributed data. The
[search API](./search-api) reaches the same records, but a layer feed gives you the whole
set in one request along with the metadata you need to attribute it.

## Listing what is public

| Endpoint | Returns |
| --- | --- |
| `GET /layers/json` | Every public layer, metadata only |
| `GET /layers/kml` | The same, as KML placemarks |
| `GET /layers/csv` | The same, as CSV |
| `GET /multilayers/json` | Every public multilayer |
| `GET /multilayers/kml` | The same, as KML |
| `GET /multilayers/csv` | The same, as CSV |

These are the catalogue. They list the layers, not their contents — no place records are
included. `/layers/json` is a flat JSON array:

```json
[
  {
    "layerid": 152,
    "name": "The Wreck Of The Ship \"De Vergulde Draeck\" On The Southland",
    "description": "Places mentioned in the text of …",
    "creator": "Dan Price and Bill Pascoe for C21CH",
    "publisher": "Wikisource / Hakluyt Society",
    "contact": "tlcmap@newcastle.edu.au",
    "citation": "…",
    "doi": null,
    "latitude_from": null,
    "latitude_to": null,
    "longitude_from": null,
    "longitude_to": null,
    "language": null,
    "license": null,
    "rights": null,
    "temporal_from": null,
    "temporal_to": null,
    "created": null,
    "warning": null,
    "allowanps": false,
    "source_url": null,
    "ghap_url": "https://tlcmap.org/publicdatasets/152",
    "linkback": null
  }
]
```

There is no paging — the whole catalogue comes back at once, a few thousand entries. Fetch
it once and cache it.

::: tip
`ghap_url` uses the old `publicdatasets` path. It still resolves, but the current form is
`https://tlcmap.org/layers/{id}`.
:::

## Reading a layer

| Endpoint | Returns |
| --- | --- |
| `GET /layers/{id}/json` | GeoJSON: the layer's metadata and every record |
| `GET /layers/{id}/kml` | KML |
| `GET /layers/{id}/csv` | CSV |
| `GET /layers/{id}/ro-crate` | A zipped [RO-Crate](./ro-crate) |

Appending `/download` to the `json`, `kml` or `csv` form adds a `Content-Disposition`
header so a browser saves the file rather than displaying it. The data is identical, but
the download variants do not send CORS headers.

```
https://tlcmap.org/layers/152/json
https://tlcmap.org/layers/152/csv/download
```

The GeoJSON is described in full under [Output formats](./formats#geojson). Its shape:

```json
{
  "type": "FeatureCollection",
  "metadata": { … },
  "features": [ … ],
  "display": { … },
  "dataset_id": 152
}
```

### Parameters

| Parameter | Effect |
| --- | --- |
| `metadata` | Return only the `metadata` object and stop. No features are built. |
| `sort` | `start` or `end`: order records by start or end date |
| `line` | Append a `LineString` joining the records. `line=time` orders by date first. |
| `textmap` | For a layer derived from an uploaded text, include the text and its offsets |

Presence is what counts for `metadata`, `line` and `textmap` — `?metadata` alone is
enough.

`?metadata` is the cheap way to check a layer's licence, creator and extent before
deciding whether to fetch it.

::: warning
`sort` drops any record with neither a start nor an end date, because the ordering
requires a date to sort on. The same applies to `line=time`. If you need every record,
sort after fetching.
:::

With `sort`, a record that has only one of the two dates has the other filled in from it,
so that downstream timeline views always receive a complete interval.

### Text layers

A layer created by geoparsing an uploaded text can return the text alongside the places:

```
https://tlcmap.org/layers/2377/json?textmap
```

This adds three keys to the FeatureCollection:

| Key | Holds |
| --- | --- |
| `textcontent` | The full text, as uploaded |
| `textID` | The internal text identifier |
| `textcontexts` | One entry per placename occurrence, giving its position in the text |

Each entry in `textcontexts` carries character offsets into `textcontent`:

```json
{
  "id": 1970,
  "dataitem_uid": "tde5ea",
  "text_id": 9,
  "start_index": 169,
  "end_index": 178,
  "sentence_start_index": 169,
  "sentence_end_index": 179,
  "line_index": 7,
  "line_word_start_index": 0,
  "line_word_end_index": -1,
  "linked_dataitem_uid": "tde0fe"
}
```

`dataitem_uid` is the record for that occurrence. `linked_dataitem_uid` points to the
place record it was resolved to, which is how several mentions of the same place are tied
together. The index pairs let you highlight the mention, its sentence and its line.

## Reading a multilayer

| Endpoint | Returns |
| --- | --- |
| `GET /multilayers/{id}/json` | The multilayer's metadata and a list of its layers |
| `GET /multilayers/{id}/kml` | Every record in every layer, as one KML document |
| `GET /multilayers/{id}/csv` | Every record in every layer, as one CSV |
| `GET /multilayers/{id}/ro-crate` | A zipped [RO-Crate](./ro-crate) with one directory per layer |

The JSON is a manifest, not a merged feature collection:

```json
{
  "metadata": {
    "id": 4,
    "name": "Deeming publication distribution",
    "description": "…",
    "creator": "See the component layers for creators",
    "publisher": "Hugh Craig",
    "url": "https://tlcmap.org/publiccollections/4"
  },
  "display": { … },
  "datasets": [
    { "name": "Frederick Deeming", "jsonURL": "https://tlcmap.org/layers/159/json", "display": { … } },
    { "name": "Trove Newspaper Publication Locations", "jsonURL": "https://tlcmap.org/layers/140/json", "display": { … } }
  ]
}
```

Each entry points at the layer's own feed. Fetch those to get the records. This is what
lets a viewer draw the layers in distinct styles, and it means the multilayer feed stays
small however many records it covers.

The KML and CSV forms do merge everything into a single document.

::: warning
A public multilayer can contain a layer that is still private. That layer appears in the
`datasets` list, but fetching its `jsonURL` returns the restricted response below. Treat a
missing layer as ordinary, not as an error.
:::

## Layer metadata

The `metadata` object on a layer feed carries everything the contributor supplied. Fields
that were left empty are omitted rather than returned as null, so check for presence.

| Field | |
| --- | --- |
| `layer_id` | The layer's numeric ID |
| `name`, `description` | |
| `subject_keywords` | An array of keywords |
| `type` | The layer's record type |
| `creator`, `publisher`, `contact` | Attribution |
| `citation` | How the contributor asks to be cited |
| `license`, `rights` | Licence and rights statement, as free text |
| `doi`, `source_url`, `linkback` | External identifiers and links |
| `language` | |
| `latitude_from`, `longitude_from`, `latitude_to`, `longitude_to` | Declared spatial extent |
| `temporal_from`, `temporal_to` | Declared temporal extent |
| `warning` | A caution the contributor attached, to be shown with the data |
| `created_at`, `updated_at` | Timestamps |
| `ghap_url` | The layer's page |

`license` and `rights` are free text, not identifiers — a layer may say "CC BY 4.0", or a
sentence, or nothing. Do not parse them; show them.

`warning` matters. Contributors use it for cultural sensitivity notices and data-quality
caveats, and it is meant to travel with the data. If you republish a layer, republish its
warning.

## Missing and private layers

A layer that does not exist, and a layer that is private, produce the same response — a
valid FeatureCollection with no features and a warning:

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "warnnig": "This map either does not exist or has been set to \"private\" and therefore cannot be displayed."
  },
  "display": { … }
}
```

The status code is `200`.

::: warning
The key is spelled `warnnig` in this response. It is `warning` everywhere else. A client
checking `metadata.warning` will not see it, so detect this case by the absence of
`features` instead.
:::
