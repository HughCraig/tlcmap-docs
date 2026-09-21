# Data model

Four things make up almost everything TLCMap serves.

```
Multilayer ── holds ──▶ Layer ── holds ──▶ Record (a place)
     └──── holds ──▶ Saved search              ▲
                                               │
                             Text ── geoparses into ───┘
```

| | |
| --- | --- |
| **Record** | One place: a title, usually coordinates, and whatever else the contributor supplied. Called a *dataitem* internally. |
| **Layer** | A set of records published together with its own metadata. Called a *dataset* internally, and `layer_id` or `dataset_id` in different outputs. |
| **Multilayer** | Several layers, and optionally saved searches, grouped so they can be read and cited together. Called a *collection* internally. |
| **Saved search** | A stored query, not a stored result. Re-running it picks up records added since. |
| **Text** | A document uploaded so its placenames can be found and turned into a layer. |

Records in the two gazetteers do not belong to a layer. Everything else does.

## Sources

Every record comes from one of four sources, and the source is fixed at import.

| Source | Search parameter | ID prefix |
| --- | --- | --- |
| ANPS Gazetteer — the Australian National Placenames Survey | `searchausgaz` | `a` |
| Composite Gazetteer of Australia | `searchncg` | `n` |
| Contributed layers | `searchpublicdatasets` | `t` |
| Places extracted from uploaded texts | `searchgeocoder` | `t` |

The two gazetteers are loaded and maintained by TLCMap. The other two are user data, and
carry whatever accuracy the contributor gave them.

## TLCMap IDs

A record's permanent identifier looks like `a1353c`, `n77b93` or `tcfe93`: a prefix letter
naming the source, then the internal numeric ID in **hexadecimal**.

```
https://tlcmap.org/places/tcfe93
https://tlcmap.org/places/tcfe93/json
```

Hexadecimal keeps the identifier short as the database grows — a hundred million records
is six characters — and its alphabet stops at `f`, which keeps accidental words out of the
identifiers.

IDs are case-insensitive and permanent. They are the right thing to store when you
reference a TLCMap place from elsewhere. The internal numeric IDs behind them are not:
they appear in a few parameters for legacy reasons, but they are not stable across data
reloads.

## Record fields

These are the fields every record can have. How they are named in output varies — see
[Field names](./formats#field-names) — and this table uses the GeoJSON names, with the
database column in the second column where it differs.

| Field | Column | |
| --- | --- | --- |
| `id` | `uid` | The TLCMap ID |
| `name` | `title` | The record's title. The only field that cannot be empty. |
| `placename` | | The place's name, where that differs from the title. Gazetteer records use both; contributed records often set only a title. |
| `description` | | Free text |
| `latitude`, `longitude` | | Decimal degrees. Nullable, but a record without them is omitted from GeoJSON and KML output. |
| `datestart`, `dateend` | | Stored as text in the form supplied — see [Dates](./formats#dates) |
| `udatestart`, `udateend` | | The same dates as Unix milliseconds, maintained by the application |
| `state` | | |
| `lga` | | Local Government Area |
| `parish` | | Cadastral parish, from Australian land records |
| `feature_term` | | What kind of feature the place is — mountain, lake, reserve — from the gazetteer's controlled vocabulary |
| `source` | | The contributor's own note on where the record came from |
| `flag` | | A gazetteer flag |
| `linkback` | `external_url` | A URL for the same thing on another site. Falls back to the layer's `linkback` in output. |
| — | `recordtype_id` | The record type; exported as `record_type` |
| — | `dataset_id` | The layer; exported as `layer_id` |
| — | `datasource_id` | The source |
| — | `original_id` | The identifier the record had in its source data |
| — | `extended_data` | Everything else — see below |
| `Image` | `image_path` | An uploaded image, rendered as an `<img>` tag in output |
| `Glycerine` | `glycerine_url` | A link to a Glycerine IIIF image |
| — | `kml_style_url` | A style reference carried through from an imported KML |
| — | `dataset_order` | The record's position in its layer, which route views follow |
| — | `linked_dataitem_uid` | For text-derived records, the place this mention resolves to |
| — | `created_at`, `updated_at` | Timestamps |

`title` is the only required field. A record with no coordinates is legal and is stored,
but it cannot be drawn and is left out of the GeoJSON and KML feeds — it appears in CSV
exports.

`state`, `lga`, `parish` and `feature_term` are populated for gazetteer records. A
contributed record has them only if the contributor supplied them, and they are free text
there rather than validated against the gazetteer's vocabulary.

## Record types

Every record, layer and saved search has a type.

`Placename` · `Event` · `Person` · `Journey` · `Site` · `Organisation` · `Media` ·
`Text` · `Other`

`Other` is the default, and the fallback when an unrecognised type is supplied on import.
The type is a label — it does not change what fields a record has — but it drives which
visualisations are offered, so a `Journey` layer gets route views that a `Placename` layer
does not.

Type names are matched case-insensitively on import. Output always uses the names above.

## Extended data

Anything TLCMap has no field for becomes extended data: name-and-value pairs attached to
the record. When a file is uploaded, every column that is not recognised as one of the
fields above becomes an extended data field under its column heading.

Internally it is stored as a KML `ExtendedData` fragment in a text column:

```xml
<ExtendedData>
  <Data name="category"><value><![CDATA[Admin]]></value></Data>
  <Data name="sitetype"><value><![CDATA[Police station]]></value></Data>
</ExtendedData>
```

Searching it goes through PostgreSQL's `xpath`, which is why the
[`extended_data` parameter](./search-api#extended-data) matches field names exactly,
including case.

::: warning
Field names are sanitised on import: everything that is not a letter, an underscore or a
space is stripped. `Catalogue no. 3` is stored as `Catalogue no `, and that trailing space
is part of the name. Digits are removed too, so `Area m2` becomes `Area m`. If you are
generating files for upload, use plainly alphabetic headings.
:::

Extended data has no types and no schema. Values are text, even when they look numeric —
the `>` and `<` search conditions work by testing whether the value is all digits before
comparing.

In GeoJSON output, extended data is merged into the same `properties` object as the
defined fields, so a contributor's field named `description` silently replaces the
built-in one. Nothing in the output says which is which; the layer's CSV export is the
reliable way to see what extended fields a layer actually uses.

## Layers

A layer's metadata — creator, publisher, licence, citation, extent, warning and the rest —
is documented with the endpoint that returns it, under
[Layer metadata](./layers-api#layer-metadata).

Two properties are worth calling out here because they affect what you get back rather
than how you display it:

- **`public`** decides whether the layer is served at all. A private layer is invisible to
  the API, and returns the [restricted response](./layers-api#missing-and-private-layers).
- **`warning`** is a caution the contributor attached to the whole layer — cultural
  sensitivity notices and data-quality caveats. It is copied onto each record in the
  search output as a `warning` property, and it is meant to travel with the data.

## Multilayers

A multilayer holds layers and saved searches. It does not hold records of its own, and it
does not copy anything: removing a layer from a multilayer leaves the layer untouched.

Its JSON feed reflects that, listing the component layers by URL rather than merging their
features. See [Reading a multilayer](./layers-api#reading-a-multilayer).

A multilayer's own metadata is thinner than a layer's — name, description, creator,
publisher, contact, citation, extent and timestamps — because the substance lives in the
layers it points at. The catalogue at `/multilayers/json` returns it.

## Texts

An uploaded text is geoparsed to find placenames, then geocoded to locate them, then
turned into a layer. The layer is an ordinary layer and behaves like one.

What makes it different is that the link back to the text is kept. Each record knows where
in the text its placename appeared, and requesting the layer with
[`?textmap`](./layers-api#text-layers) returns the text alongside the places with character
offsets for every mention. That is what lets a viewer show the passage a place came from.

Records created this way have the record type `Text`, and are attributed to the
`searchgeocoder` source rather than to contributed layers — so a search restricted to
`searchpublicdatasets` will not see most of them. They share the `t` ID prefix with
ordinary contributed records, so the prefix does not tell the two apart.
