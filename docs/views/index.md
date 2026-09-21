# TLCMap Views

TLCMap Views is the map viewer behind every **View Map** button in TLCMap. It is a
separate piece of software from the TLCMap application: a set of browser-based map
visualisations, built on the ArcGIS Maps SDK for JavaScript, that take a URL to a GeoJSON
feed and draw it.

Nothing about it is specific to TLCMap. A view will render any GeoJSON that is reachable
over the web, which makes it usable as a standalone viewer for your own data as well as a
way of looking at a TLCMap layer.

This page covers how the views are addressed, what each one needs from the data, and how
to embed one. The full reference — every field of the GeoJSON feed and every display
setting — lives in the
[TLCMapViews repository](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/README.md)
and is linked from [Reference documentation](#reference-documentation) below.

For the reader's view of the same thing — which button opens which map, and why a journey
might look shorter than expected — see [Visualising your data](/guide/visualising).

## How a view works

Each view is a single HTML page. It reads the data to draw from a `load` parameter in its
own query string:

```
https://views.tlcmap.org/latest/3d.html?load=https%3A%2F%2Ftlcmap.org%2Flayers%2F152%2Fjson
```

`load` is the only parameter the views take, apart from `goto` on the
[full text view](#the-full-text-view). Everything else — colours, popups, titles, which
fields to show — is configured inside the feed rather than in the URL. See
[Configuring a view](#configuring-a-view).

The value of `load` **must be percent-encoded**. A feed URL of its own often carries a
query string — `?line=route`, `?sort=start` — and without encoding those parameters are
read as parameters of the view instead, and are lost.

::: warning
The view fetches the feed from the reader's browser, so the feed must be served with CORS
headers. TLCMap's feeds are: they send `Access-Control-Allow-Origin: *`. The `/download`
variants do **not**, so `https://tlcmap.org/layers/152/json` works as a `load` URL and
`https://tlcmap.org/layers/152/json/download` does not.
:::

### Versions

Views are published under a version directory, and the current release is served at
`latest`:

```
https://views.tlcmap.org/latest/3d.html
```

Earlier releases stay published at their own paths — `/v1/`, `/v2/`, `/v2.0.1/` and so on
— so a URL written against one of them keeps working and keeps looking the same. TLCMap
itself always links to `latest`.

Use `latest` unless you have published an embed that you need to stay visually identical.

There is no index of the views to browse. `views.tlcmap.org/latest/` serves a leftover page
from an early version of the software, describing two prototypes and linking to the site
root, where they no longer resolve. The URLs below are the entry points.

## The views

Each view reads a single GeoJSON `FeatureCollection`. What it needs from that collection
differs.

| View | URL | Needs |
| --- | --- | --- |
| **3D** | `latest/3d.html` | Point features. The general-purpose view. |
| **Cluster** | `latest/cluster.html` | Point features. Groups nearby points into a numbered marker. |
| **Journey** | `latest/journey.html` | Point features **plus** `LineString` features giving the paths |
| **Timeline** | `latest/timeline.html` | `udatestart` and `udateend` on each feature's properties |
| **Werekata** | `latest/werekata.html` | Point features, in the order to fly them |
| **Full text** | `latest/fulltext.html` | `textcontent` and `textcontexts` alongside the features |

A few consequences worth knowing before you build a feed:

- **Journey** draws its lines from `LineString` features in the same collection, not from
  the order of the points. The order of coordinates within each `LineString` is the order
  of travel. TLCMap generates these for you when you add
  [`line=route` or `line=time`](/developers/layers-api#parameters) to a layer feed.
- **Timeline** ignores any feature without both `udatestart` and `udateend`. These are
  Unix timestamps in **milliseconds** — seconds must be multiplied by 1000. See
  [Dates](/developers/formats#dates).
- **Werekata** flies the points in the order they appear in `features`, so ordering the
  feed is how you choose the route.

::: tip
Because [search output repeats `udatestart` as `udateend`](/developers/formats#properties),
a timeline built from a search feed shows every place as a single instant. Layer feeds are
unaffected.
:::

### The full text view

The full text view puts the source document beside the map, with each located placename
highlighted; clicking a highlight opens that place on the map, and clicking a place scrolls
the text to it. It is for layers created by geoparsing an uploaded text, and it needs the
three extra keys that [`?textmap`](/developers/layers-api#text-layers) adds to a layer
feed:

```
https://views.tlcmap.org/latest/fulltext.html?load=https%3A%2F%2Ftlcmap.org%2Flayers%2F2377%2Fjson%3Ftextmap%3Dtrue
```

It is the one view with a second parameter. `goto` takes a TLCMap record ID and opens the
view with that place already highlighted in the text and its popup open on the map:

```
…/fulltext.html?load=…&goto=tde5ea
```

That makes it possible to link from a citation straight to the sentence a place came from.

## Collection views

Every view except the full text view has a collection form, which draws several datasets
together, gives each one its own colour, and adds a legend and a list pane.

| View | URL |
| --- | --- |
| 3D | `latest/collection-3d.html` |
| Cluster | `latest/collection-cluster.html` |
| Journey | `latest/collection-journey.html` |
| Timeline | `latest/collection-timeline.html` |
| Werekata | `latest/collection-werekata.html` |

A collection view loads a **collection feed** rather than a FeatureCollection. The only
requirement is a `datasets` array, each entry with a `name` and its data supplied either as
a `jsonURL` pointing at a GeoJSON feed, or as `features` embedded directly:

```json
{
  "metadata": { "name": "Deeming publication distribution" },
  "datasets": [
    { "name": "Frederick Deeming", "jsonURL": "https://tlcmap.org/layers/159/json" },
    { "name": "Trove Newspaper Publication Locations", "jsonURL": "https://tlcmap.org/layers/140/json" }
  ]
}
```

A TLCMap [multilayer feed](/developers/layers-api#reading-a-multilayer) is already in this
shape, so a multilayer can be passed to a collection view unchanged.

## How TLCMap builds its own view URLs

Useful as worked examples, and as a reminder of which feed parameter does what:

| Button in TLCMap | View | Feed |
| --- | --- | --- |
| 3D Viewer | `3d.html` | `/layers/{id}/json` |
| Cluster | `cluster.html` | `/layers/{id}/json` |
| Journey Route | `journey.html` | `/layers/{id}/json?line=route` |
| Journey Times | `journey.html` | `/layers/{id}/json?line=time` |
| Timeline | `timeline.html` | `/layers/{id}/json?sort=start` |
| Werekata Flight by Route | `werekata.html` | `/layers/{id}/json` |
| Werekata Flight by Time | `werekata.html` | `/layers/{id}/json?sort=start` |
| Full Text | `fulltext.html` | `/layers/{id}/json?textmap=true` |

Multilayers use the `collection-` forms of the same views against
`/multilayers/{id}/json`, and saved searches use the plain forms against the stored query
with `&format=json`.

Substitute any feed URL you like. A search, a layer, a multilayer and a file on your own
server are all equally valid.

## Embedding

A view is an ordinary page, so it embeds in an `<iframe>`:

```html
<iframe src="https://views.tlcmap.org/latest/3d.html?load=https%3A%2F%2Ftlcmap.org%2Flayers%2F152%2Fjson"
        width="1000" height="700" frameborder="0" scrolling="no"></iframe>
```

The views server clears `X-Frame-Options`, so embedding from another domain is allowed.

Two things to decide before you publish an embed. Whether to pin a
[version](#versions) — `latest` keeps the map current, a version directory keeps it
unchanged. And whether the feed should be live or fixed: a `load` pointing at a TLCMap
layer redraws as the layer is edited, which is usually what you want, but a feed you host
yourself is the only way to guarantee an embed that will never change.

## Configuring a view

Colours, popups, titles, base maps and the information panel are all set in the feed, in a
foreign member called `display`. Ordinary GeoJSON readers ignore it; TLCMap Views reads it.

```json
{
  "type": "FeatureCollection",
  "display": { "basemap": "satellite", "color": "#33cc33" },
  "features": [
    {
      "type": "Feature",
      "display": { "popup": { "title": "{title}", "allowedFields": ["datestart", "dateend"] } },
      "geometry": { "type": "Point", "coordinates": [151.1344801, -32.93175515] },
      "properties": { "title": "Wollombi", "datestart": "1840", "dateend": "1845" }
    }
  ]
}
```

A setting on the `FeatureCollection` applies to every feature; the same setting on a
`Feature` overrides it for that one. That keeps a feed small when the whole layer shares a
style.

The settings fall into four groups, each documented in the repository:

| Group | Set on | Covers |
| --- | --- | --- |
| [Global](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/global-configurations.md) | The `FeatureCollection` | The information panel, logo, title, content, share widget, base map and base map gallery, cluster appearance |
| [Feature](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/feature-configurations.md) | A `Feature`, or the collection as a default | Marker colour, popup title and content, which properties to show, property labels, popup links, line colour and width |
| [Collection](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/collection-configurations.md) | A collection feed | The information panel for the collection, the legend, the list pane |
| [Dataset](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/dataset-configurations.md) | One entry in `datasets` | That dataset's colour and its list pane entry |

Two behaviours catch people out. HTML in a `content` or popup field is filtered down to a
small set of tags before it is rendered, so anything unusual is stripped. And in a
collection view, per-feature colours are ignored — the dataset's colour wins — because the
point of a collection view is to tell the datasets apart.

TLCMap fills in `display` on its own feeds, which is why a layer opens with its name,
description and warning already in the panel. That block is described from the feed's side
under [Output formats](/developers/formats#display).

## Reference documentation

The reference is maintained in the `TLCMapViews` repository, in the same pull request as
the code it describes, and GitHub serves the version matching any release tag. These links
point at the current release.

| | |
| --- | --- |
| [Documentation index](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/README.md) | Start here |
| [GeoJSON feed](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/geojson-feed.md) | The input format |
| [Views](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/views.md) | Each view, with screenshots |
| [Collection views](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/collection-views.md) | The collection feed |
| [Configurations](https://github.com/HughCraig/TLCMapViews/blob/main/documentation/configurations.md) | The `display` object |
| [Source code](https://github.com/HughCraig/TLCMapViews) | The repository |

::: tip
The full text view and the `goto` parameter are not yet in the repository reference. This
page is the description of them.
:::
