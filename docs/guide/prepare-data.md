# Preparing your data

You can build a layer record by record in the browser, but if you already have a
spreadsheet or a map file it is much faster to upload it. This page covers what TLCMap
will accept and how it reads your columns.

## File formats

| Format | Extensions |
| --- | --- |
| CSV | `.csv` |
| KML | `.kml` |
| GeoJSON | `.json`, `.geojson` |

Files are limited to **10 MB**. If your data is larger than that, split it into several
files and upload them one after another into the same layer.

## What every record needs

Each row, placemark or feature needs:

- **a title** — from a `title`, `placename` or `name` column, whichever it has
- **a latitude and a longitude**

Everything else is optional. Records without a usable title will stop the import.

## Recommended columns

These are not required, but a layer is much more useful with them:

| Column | What it is |
| --- | --- |
| `description` | A sentence or paragraph about the place. |
| `datestart`, `dateend` | The period the record covers. |
| `linkback` | A URL to this record on your own website or repository. |

## How columns are matched

Column headings are matched case-insensitively, and TLCMap accepts several spellings for
the fields it cares about.

**Title.** TLCMap looks for `title` first, then `placename`, then `name`. If a row has
both a title and a placename, both are kept — the title is what is displayed, and the
placename is the name of the place itself. If the record *is* a place, put the same value
in both.

**Coordinates.** Any one of these pairs works:

```
latitude / longitude
lat / long
lat / lng
```

Values are cleaned before they are stored, so stray spaces, degree symbols and
non-breaking spaces will not break the import. Coordinates must be decimal degrees —
`-32.9283`, not `32° 55' 42" S`.

**Dates.** Any one of these pairs works:

```
datestart / dateend
date start / date end
startdate / enddate
start date / end date
start_date / end_date
begin / end
```

A single `date` column is also accepted, and is used as both the start and the end.

**Other recognised names.**

| In your file | Becomes |
| --- | --- |
| `type` or `record_type` | The [record type](./concepts#record-type). Values that do not match a known type become `Other`. |
| `linkback` | The record's link back to its source. |
| `ghap_id` | The TLCMap ID of an existing record, used to update it rather than create a new one. See [Updating records by re-upload](#updating-records-by-re-upload). |

**Everything else** becomes [extended data](./concepts#extended-data) and is kept
against the record under its own name. Nothing in your file is discarded.

::: tip
Column headings are stripped of anything that is not a letter, an underscore or a space
before they are stored. A column called `Catalogue no. 3` will appear in the record as
`Catalogue no `. If you intend to search on a field later, give it a plain alphabetic
name such as `catalogue_number`.
:::

## Writing dates

TLCMap accepts:

| Form | Example | Means |
| --- | --- | --- |
| `YYYY-MM-DD` | `1878-03-04` | that day |
| `YYYY-MM` | `1878-03` | that month |
| `YYYY` | `1878` | that year |
| `DD/MM/YYYY` | `4/3/1878` | that day |
| `YYYY-MM-DDTHH:MM:SS` | `1878-03-04T14:30:00` | that moment |
| `YYYY-00-00` or `00/00/YYYY` | `1878-00-00` | that year — a common export from other systems |

Some rules:

- Dates are Australian order: `4/3/1878` is 4 March, not 3 April.
- Years before the common era take a leading minus: `-400`.
- Empty date cells are fine. Most records do not have dates.
- **One bad date stops the whole import.** TLCMap reports the line number so you can fix
  it and try again. This is the single most common reason an upload fails.

## Writing coordinates

- Decimal degrees only.
- Southern latitudes are negative; Australian longitudes are positive.
- Use a full stop as the decimal separator, not a comma.

If your source has degrees, minutes and seconds, convert them before uploading.

## Preparing a CSV

- Save as UTF-8.
- Put the column headings in the first row.
- Blank rows, and rows containing only commas, are skipped.
- Text containing commas or line breaks must be quoted, which every spreadsheet
  application does for you when it saves as CSV.
- Rows that are exactly identical to a record already in the layer are ignored rather
  than duplicated.

## Preparing a KML

TLCMap reads every `<Placemark>` in the file, wherever it sits in the document tree, and
regardless of the KML namespace. It takes the name, description, coordinates and
`<ExtendedData>` from each one.

KML files may also carry styling and a journey line. When you upload, you can choose
whether to bring those into the layer as well — see [Creating a layer](./create-layer).

## Preparing a GeoJSON

TLCMap reads the `features` array and takes each feature's geometry and properties. Point
geometries are what it expects.

## Updating records by re-upload

Exporting a layer as CSV gives you a file with a `ghap_id` column holding each record's
[TLCMap ID](./concepts#place). If you edit that file in a spreadsheet and upload it back
into **the same layer**, records that still carry their `ghap_id` are updated in place
rather than added again.

This is the safest way to do a bulk edit: export, edit, re-upload. Remove the `ghap_id`
value from a row if you want it treated as a new record, and leave the column out
entirely if you are uploading to a different layer.

The exported CSV also renames a few columns for clarity — `linkback`, `layer_id` and
`record_type` — and TLCMap reads those names back in, so the round trip works without
you having to rename anything.

## Next

Once your file is ready, see [Creating a layer](./create-layer).
