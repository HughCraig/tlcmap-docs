# Multilayers and collections

A **multilayer** groups several layers so they can be viewed, downloaded and cited
together. It is the right tool when one dataset is really several — a project with a
layer per year, or per source, or per researcher — or when you want to compare layers
that were contributed separately.

Multilayers are called *collections* in URLs and in the Web Services API. They are the
same thing.

## What a multilayer contains

A multilayer can hold:

- **Layers**, each keeping its own name, metadata and licence.
- **[Saved searches](./saved-searches)**, which are re-run each time the multilayer is
  viewed.

A layer can belong to any number of multilayers, and adding it to one does not copy it.
Edit the layer and every multilayer containing it shows the change.

Mixing saved searches with layers is what makes a multilayer more than a folder: the
fixed layers stay fixed, and the searches keep up with whatever has been added to TLCMap
since.

## Creating a multilayer

**My Maps → My multilayers → New multilayer**.

The fields are the same set a layer carries — name, description, subject keywords,
visibility, creator, publisher, contact, DOI, source URL, linkback, language, licence,
citation, usage rights, content warning, spatial and temporal coverage, image. See
[Creating a layer](./create-layer) for what each one is for.

The multilayer's own metadata describes the collection as a whole. It does not replace or
override the metadata of the layers inside it.

## Adding and removing layers

Open the multilayer and use **Add a Layer**. You can add any layer you own or have access
to, and any of your saved searches.

Each entry in the multilayer is listed with its name, size, type, content warning,
contributor, visibility and when it was last updated, and has its own **View Map** and
**Remove** controls.

**Remove** takes the layer out of the multilayer. It does not delete the layer.

::: warning
A public multilayer containing a private layer will not show that layer's records to
people who cannot see it. If you are publishing a multilayer, check that everything in it
is public too.
:::

## Viewing a multilayer

The multilayer page offers the same visualisations as a layer — **Cluster**, **Journey
Route**, **Journey Times**, **Timeline**, **Werekata Flight by Route**, **Werekata Flight
by Time** and **Temporal Earth** — applied to everything it contains at once. Each entry
can also be viewed on its own.

See [Visualising your data](./visualising).

## Exporting a multilayer

A multilayer can be downloaded as GeoJSON, KML, CSV or RO-Crate, with the layers kept
distinct in the output rather than flattened together. Saved searches are included as
their query URLs, so the export records what the search was rather than freezing its
results.

Public multilayers are listed at
[tlcmap.org/multilayers](https://tlcmap.org/multilayers) and are available through the
Web Services API. See [Exporting and feeds](./exporting).
