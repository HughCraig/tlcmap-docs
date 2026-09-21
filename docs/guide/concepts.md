# Key concepts

A handful of terms recur throughout TLCMap and the rest of this guide. They are worth
reading once before you start.

## Place

A **place** — also called a *record* — is the basic unit of data in TLCMap. Every place
has a title and, in almost all cases, a latitude and longitude. Everything else is
optional: a placename, a description, a start and end date, a type, a state, a local
government area, a parish, a feature term, a source, a link back to the record on another
website, an image, and any number of extra fields the contributor chose to include.

The full list of fields is in the [data model](/developers/data-model).

Every place has a **TLCMap ID**, a short identifier such as `a15224` or `t1f3c`. The
first letter says where the record came from — `a` for the ANPS gazetteer, `n` for the
NCG gazetteer, `t` for a contributed layer — and the rest is a hexadecimal number. The ID
is permanent and is the right thing to cite. A place is always available at:

```
https://tlcmap.org/places/<id>
```

## Layer

A **layer** is a set of places published together, with its own name, description,
creator, licence, subject keywords and other metadata. Layers are how data gets into
TLCMap and how it gets cited out of it.

A layer is either **public** or **private**. Public layers appear in search results under
the *Layers* source, are listed at [tlcmap.org/layers](https://tlcmap.org/layers), and can
be downloaded and read through the Web Services API by anyone. Private layers are visible
only to you and to people you have explicitly given access.

Layers are sometimes called *datasets* in URLs and in the Web Services API. They are the
same thing.

## Multilayer

A **multilayer** — also called a *collection* — groups several layers so they can be
viewed, downloaded and cited as one. The layers keep their own identity and can belong to
more than one multilayer. Public multilayers are listed at
[tlcmap.org/multilayers](https://tlcmap.org/multilayers).

See [Multilayers and collections](./collections).

## Record type

Each place, layer and saved search has a **type** that says what kind of thing it
describes. The available types are:

`Other` · `Placename` · `Media` · `Text` · `Event` · `Person` · `Journey` · `Site` ·
`Organisation`

Use `Other` when the contents are mixed or none of the types fits.

## Extended data

Any column in your uploaded file that does not map onto one of TLCMap's own fields is
kept as **extended data** — a set of name/value pairs attached to the record. Nothing is
discarded: if your spreadsheet has a *Denomination* column or a *Catalogue number*
column, those survive the upload, show up in the record, come back out in exports, and can
be searched.

Searching extended data uses its own small query syntax, described in
[Searching for places](./search#extended-data).

## Text

A **text** is a document you have uploaded — a letter, a diary, a report, a chapter.
TLCMap can read it, find the placenames in it, locate them, and build a layer from the
result, keeping a link between each place and the passage it came from.

See [Working with texts](./texts).

## Saved search

A **saved search** stores a query rather than a copy of its results. Re-running it later
picks up any records added since. A saved search carries the same kind of metadata as a
layer, and can be added to a multilayer.

See [Saving searches](./saved-searches).

## TLCMap Views

**TLCMap Views** is the separate visualisation layer that renders TLCMap data as 3D maps,
journeys, timelines and animated flights. Any search result, layer or multilayer can be
sent to it.

See [Visualising your data](./visualising) and the [Views overview](/views/).
