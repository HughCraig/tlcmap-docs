# Output formats

Every TLCMap endpoint serves the same data in three formats. Which one you get is chosen
by the `format` query parameter on a search, and by the path segment on a layer or place.

| Format | `format=` | Media type |
| --- | --- | --- |
| [GeoJSON](#geojson) | `json` | `application/json` |
| [KML](#kml) | `kml` | `text/xml` |
| [CSV](#csv) | `csv` | `text/csv` |
| [RO-Crate](./ro-crate) | `rocrate` | `application/zip` |

```
https://tlcmap.org/places?format=json&fuzzyname=Wollombi
https://tlcmap.org/layers/1270/kml
https://tlcmap.org/places/tcfe93/csv
```

CSV always downloads as an attachment. JSON and KML display inline unless you add
`download=on` to a search, or use the `/download` path on a layer.

The formats are not simple transcriptions of each other. The GeoJSON carries display
configuration that the other two cannot; the KML folds links into an HTML description; and
the two CSVs — search and layer — have different columns. Pick by what you are doing
rather than by preference.

## GeoJSON

A standard `FeatureCollection` with two TLCMap additions: a `metadata` object, and a
`display` object that tells [TLCMap Views](/views/) how to draw it.

```json
{
  "type": "FeatureCollection",
  "metadata": { … },
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [151.1344801, -32.93175515] },
      "properties": { … },
      "display": { … }
    }
  ],
  "display": { … }
}
```

Coordinates are `[longitude, latitude]`, as GeoJSON requires, and are numbers. Every place
is a `Point`. The one exception is the `LineString` appended when you ask for
[`line`](./search-api#other-output-parameters).

A feed that matched nothing still returns a valid FeatureCollection, with `features: []`
and a warning in `metadata`.

### `metadata`

What this holds depends on what you asked for:

| Request | `metadata` holds |
| --- | --- |
| A search | `name` (always `TLCMap Gazetteer Query`) and `url`, the full query URL |
| A layer | The layer's [full metadata](./layers-api#layer-metadata) |
| A multilayer | The multilayer's metadata |

On a search, `metadata.url` is the canonical form of your own query. It is the thing to
record if you want to be able to re-run the search later.

### `properties`

The defined fields come first, then the record's extended data is merged in alongside
them, under whatever names the contributor used.

| Property | |
| --- | --- |
| `name` | The record's title, or its placename if there is no title |
| `placename` | |
| `description` | |
| `id` | The TLCMap ID, e.g. `tcfe93` |
| `warning` | The layer's warning, if it has one |
| `state`, `parish`, `lga`, `feature_term` | Gazetteer fields |
| `source` | The contributor's own source note |
| `original_data_source` | Search output only; a copy of `source` |
| `datestart`, `dateend` | As stored, in the original format |
| `udatestart`, `udateend` | The same dates as Unix milliseconds |
| `latitude`, `longitude` | Repeated from the geometry, as strings |
| `linkback` | The record's external URL, falling back to the layer's |
| `TLCMapLinkBack` | The record's own page |
| `TLCMapDataset` | The layer's page |
| `Image` | An `<img>` tag, on layer feeds, when the record has an uploaded image |
| `Glycerine` | An `<a>` tag to a Glycerine image, when the record has one |

A field that is empty is left out rather than returned as null, so test for presence.

::: warning
In **search** output, `udateend` is computed from the start date, so it always equals
`udatestart`. A record with `datestart: "1840"` and `dateend: "1845"` reports both
timestamps as 1840. The layer feeds get this right. Until it is fixed, parse `dateend`
rather than trusting `udateend` on a search, and delete this note once the application is
corrected.
:::

Extended data is merged into the same object as the defined fields, so a contributor's
column called `description` or `source` will overwrite the built-in one. Nothing
distinguishes an extended field from a defined one in the output.

### `display`

The `display` object is TLCMap's own, and is ignored by ordinary GeoJSON readers. It
tells the viewer how to present the data rather than what the data is.

On the collection:

```json
"display": {
  "popup": {
    "blockedFields": ["OBJECTID", "id", "title", "name", "udatestart", "udateend", "layer", "TLCMapLinkBack", "TLCMapDataset"],
    "fieldLabels": {
      "placename": "Place Name",
      "datestart": "Date Start",
      "dateend": "Date End",
      "feature_term": "Feature Term",
      "lga": "LGA",
      "linkback": "Link Back"
    }
  },
  "info": { "title": { "text": "…", "link": "…" }, "content": "…" }
}
```

`blockedFields` are properties to hide in a popup — either internal, or already shown
elsewhere in the interface. `fieldLabels` maps property names to human-readable labels.
`info` is the panel shown beside the map, and its `content` is HTML.

On each feature:

```json
"display": {
  "popup": { "links": [ { "text": "TLCMap Record: tcfe93", "link": "…" }, { "text": "TLCMap Layer", "link": "…" } ] },
  "source": {
    "TLCMapID": { "id": "tcfe93", "url": "https://tlcmap.org/search?id=tcfe93" },
    "Layer": { "name": "Convict Landscapes … (community contributed)", "url": "https://tlcmap.org/layers/1270" }
  }
}
```

`source` is the reliable place to find which layer a record came from and what it is
called, which is otherwise only implied by the `TLCMapDataset` URL.

If you are writing your own map, you can ignore `display` entirely. If you are feeding
TLCMap Views, pass it through untouched.

## KML

The KML is a `Document` of `Placemark` elements, each with a `Point`, a `name` and a
`description`. Beyond that, the search output and the layer output are noticeably
different documents.

**Search KML** gives every placemark the same fixed set of `ExtendedData` entries — `id`,
`state`, `lga`, `parish`, `feature_term`, `flag`, `source`, `datestart`, `dateend`,
`linkback_url`, `tlcm_url`, `tlcm_ds` — each with a `displayName`. The record's own
extended data is **not** included. The same values are also rendered as an HTML table
appended to the `description`, so they survive in readers that ignore `ExtendedData`.

```xml
<Placemark>
  <Point><coordinates>151.1344444,-32.93166667</coordinates></Point>
  <ExtendedData>
    <Data name="id"><displayName>ID</displayName><value>tcfe93</value></Data>
    <Data name="datestart"><displayName>Date Start</displayName><value><![CDATA[1840]]></value></Data>
  </ExtendedData>
  <name><![CDATA[Wollombi  - Court proclaimed]]></name>
  <description><![CDATA[…]]></description>
</Placemark>
```

**Layer KML** is richer. The `Document` carries the layer's metadata as `ExtendedData` and
a `TLCMapStyle` icon style, and each placemark carries a `TimeSpan` and the record's own
extended data under the contributor's names:

```xml
<Placemark>
  <Point><coordinates>117.033999,-33.336607</coordinates></Point>
  <name><![CDATA[125 Mile (Arthur River) - Police station]]></name>
  <styleUrl>#TLCMapStyle</styleUrl>
  <description><![CDATA[…<p><a href='…'>TLCMap</a></p>]]></description>
  <TimeSpan><begin>1863</begin><end>1868</end></TimeSpan>
  <ExtendedData>
    <Data name="category"><value><![CDATA[Admin]]></value></Data>
    <Data name="sitetype"><value><![CDATA[Police station]]></value></Data>
  </ExtendedData>
</Placemark>
```

If you need a record's extended data in KML, export the layer, not the search.

Both dialects declare the namespace `http://earth.google.com/kml/2.2`.

## CSV

There are two CSV layouts, and they do not share a column set.

**Search CSV** has a fixed header, the same for every query:

```
id,title,placename,state,lga,parish,feature_term,latitude,longitude,source,flag,
description,datestart,dateend,linkback,tlcmaplink,layerlink
```

Extended data is not included. `tlcmaplink` and `layerlink` are resolvable URLs for the
record and its layer.

**Layer CSV** has a header built from the layer's own content: every defined column that
has a value in at least one record, then every extended data key used anywhere in the
layer. Two layers rarely have the same header.

```
ghap_id,layer_id,title,record_type,description,latitude,longitude,datestart,dateend,
linkback,created_at,updated_at,placename,category,sitetype
```

Here `category` and `sitetype` are the contributor's own fields.

This layout is also the **upload** format: a layer CSV can be edited and uploaded back
into the same layer, and the `ghap_id` column tells TLCMap which record each row belongs
to. See [Preparing your data](/guide/prepare-data#updating-records-by-re-upload).

### Field names

The layer CSV renames four columns, so the same value has a different name depending on
where you read it:

| Database | GeoJSON | Layer CSV |
| --- | --- | --- |
| `uid` | `id` | `ghap_id` |
| `external_url` | `linkback` | `linkback` |
| `dataset_id` | — | `layer_id` |
| `recordtype_id` | — | `record_type` |

`record_type` holds the type's name, not its numeric ID. The `uid`, `datasource_id`,
`geom`, `geog`, `image_path`, `udatestart` and `udateend` columns are never exported.

The [analysis endpoints](./analysis-api#clustering) use the CSV names in their GeoJSON
output, which is the one place the two conventions meet.

## Dates

TLCMap stores dates as text, in whatever form they were supplied, and parses them on
demand. This keeps `1856`, `1856-03` and `03/04/1856` all meaningful, and it means a date
column can hold a mixture.

These are the forms accepted on import and understood by the date filters:

| Form | Example | |
| --- | --- | --- |
| `YYYY` | `1856` | Year only |
| `YYYY-MM` | `1856-03` | |
| `YYYY-MM-DD` | `1856-03-04` | |
| `YYYY-MM-DDThh:mm:ss` | `1856-03-04T14:30:00` | Time is accepted and kept |
| `DD/MM/YYYY` | `04/03/1856` | Converted to `1856-03-04` on import |
| `YYYY-00-00` | `1856-00-00` | Year only, from data with zeroed month and day. Stored as `1856`. |
| `00/00/YYYY` | `00/00/1856` | The same, in slash form |
| `-YYYY` | `-400` | BCE. The year may be any number of digits. |

Anything else is rejected. On import, one unparseable date aborts the whole file — see
[Writing dates](/guide/prepare-data#writing-dates).

`udatestart` and `udateend` in GeoJSON are those dates converted to **milliseconds since
the Unix epoch**, negative for dates before 1970. They exist so that timeline views can
sort and scale without parsing text. They are derived, not stored: treat `datestart` and
`dateend` as authoritative.

Two approximations are worth knowing if you are comparing dates yourself. A year-only date
becomes 1 January of that year. And the analysis code converts dates to a decimal year
using an average month of 30.44 days, so a temporal clustering interval is not exact to
the day.
