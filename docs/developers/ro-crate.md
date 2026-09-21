# RO-Crate

[RO-Crate](https://www.researchobject.org/ro-crate/) packages data together with a
machine-readable description of what it is, who made it and how it may be used. TLCMap
exports layers, multilayers and search results as RO-Crates, which is the format to reach
for when depositing TLCMap data in a repository or citing it in a publication.

The crate is a zip. Unlike a feed, it is a snapshot: the data inside it does not change
when the layer does.

## Endpoints

| Endpoint | Packages |
| --- | --- |
| `GET /layers/{id}/ro-crate` | One layer |
| `GET /multilayers/{id}/ro-crate` | A multilayer, one directory per layer |
| `GET /places?format=rocrate&…` | The results of a search |

```
https://tlcmap.org/layers/152/ro-crate
https://tlcmap.org/multilayers/4/ro-crate
https://tlcmap.org/places?format=rocrate&fuzzyname=Wollombi&limit=200
```

All three return `application/zip` with a generated filename, for example
`ghap-ro-crate-layer-152-20260921000318.zip`. The timestamp is the moment of export.

The search form is subject to the same [5,000-record ceiling](./search-api#paging-and-limiting)
as any other search.

## What is in a layer crate

```
ro-crate-metadata.json     the RO-Crate description
ro-crate-preview.html      a human-readable rendering of it
TLCMLayer_152.csv          the layer as CSV
TLCMLayer_152.kml          the layer as KML
tlcmap_output.json         the layer as GeoJSON
```

The three data files are exactly what the corresponding
[feeds](./layers-api#reading-a-layer) return, so a crate is self-contained: everything in
it can be read without going back to TLCMap.

::: warning
The GeoJSON file is written as `tlcmap_output.json`, but `ro-crate-metadata.json`
describes it as `TLCMLayer_{id}.json`. The crate therefore declares a file that is not
present and ships a file that is not declared, which strict RO-Crate validators will
reject. The CSV and KML are named consistently, and multilayer and search crates are not
affected. Delete this note once the application is corrected.
:::

## What is in a multilayer crate

One directory per layer, each holding that layer's three exports:

```
ro-crate-metadata.json
ro-crate-preview.html
export-layer-159/
  TLCMLayer_159.csv
  TLCMLayer_159.kml
  TLCMLayer_159.json
export-layer-140/
  TLCMLayer_140.csv
  TLCMLayer_140.kml
  TLCMLayer_140.json
```

Saved searches held by the multilayer are exported the same way, into
`export-saved-search-{id}/` directories holding `GHAPSearchResult_{id}.csv`, `.kml` and
`.json`. The search is re-run at the moment of export, so the crate holds the results as
they stood then.

## What is in a search crate

The same five files, named for the search rather than a layer:

```
ro-crate-metadata.json
ro-crate-preview.html
tlcmap_output.csv
tlcmap_output.kml
tlcmap_output.json
```

The root entity is named `GHAP search results` and its `url` is the query that produced
them, so the search can be re-run later and compared against the snapshot.

## The metadata

`ro-crate-metadata.json` conforms to RO-Crate 1.1:

```json
{
  "@context": "https://w3id.org/ro/crate/1.1/context",
  "@graph": [
    {
      "@type": "CreativeWork",
      "@id": "ro-crate-metadata.json",
      "conformsTo": { "@id": "https://w3id.org/ro/crate/1.1" },
      "about": { "@id": "./" }
    },
    {
      "@id": "./",
      "@type": "Dataset",
      "name": "…",
      "hasPart": [ … ]
    }
  ]
}
```

The root `Dataset` entity carries the layer's metadata, mapped onto schema.org:

| TLCMap field | RO-Crate property |
| --- | --- |
| `name`, `description` | `name`, `description` |
| `creator`, `publisher` | `creator`, `publisher` |
| `citation` | `citation` |
| `doi` | `identifier` |
| The layer's page, then `source_url`, then `linkback` | `url` — one value or several |
| `temporal_from` / `temporal_to` | `temporalCoverage`, as `from/to` |
| `latitude_from`, `longitude_from`, `latitude_to`, `longitude_to` | `spatialCoverage` → `Place` → `GeoShape` → `box` |
| `created` | `dateCreated` |
| `created_at` | `datePublished` |
| `language` | `language` |
| `license` | `license` → a `CreativeWork` with the licence text as its `name` |
| `rights` | `copyrightNotice` |
| The layer's record type | `keywords` |
| `warning` | `comment` |

Fields the contributor left empty are omitted.

Two things to note when reading the licence. It is a nested `CreativeWork` whose `name`
holds whatever the contributor typed — `CC BY`, a sentence, a URL — not a licence
identifier. And `warning` arrives as `comment`, which is easy to overlook: it is where a
cultural sensitivity notice or a data-quality caveat ends up, and it should be surfaced
wherever the data is.

Each data file gets a `File` entity naming its `encodingFormat` — `text/csv`,
`application/vnd.google-earth.kml+xml`, `application/geo+json` — and the root entity's
`hasPart` lists them all.

Finally, a `CreateAction` records how the files were made, with a `SoftwareApplication`
entity for TLCMap itself carrying its `url`, `name` and `version`. That is the provenance
trail: it says which release of the application produced this export.

In a multilayer crate each component layer is its own `Dataset` entity pointing at its
directory, and the root entity's `hasPart` lists those directories rather than individual
files.

## Naming

Export filenames still carry the application's former name in places. They are what they
are; changing them would break existing deposits.

| Name | Where |
| --- | --- |
| `ghap-ro-crate-layer-{id}-{timestamp}.zip` | The downloaded filename of a layer crate |
| `ghap-ro-crate-search-results-{timestamp}.zip` | The downloaded filename of a search crate |
| `GHAPSearchResult_{id}.*` | Saved search exports inside a multilayer crate |
| `GHAP search results` | The name of the root entity on a search crate |
| `tlcmap_output.*` | Search exports |
| `TLCMLayer_{id}.*` | Layer exports |
| `export-layer-{id}/`, `export-saved-search-{id}/` | Directories in a multilayer crate |
