# Visualising your data

The map on the search page is deliberately plain. For anything more — three dimensions,
movement, time — TLCMap hands the data to **TLCMap Views**, a separate viewer that opens
in a new tab.

Anything that produces a set of places can be visualised: a search result, a layer, a
multilayer or a saved search.

## Opening a visualisation

| From | Control |
| --- | --- |
| A search | **View Maps…** in the List view |
| A layer | **View Map** on the layer page |
| A multilayer | **View Map**, either for the whole multilayer or for one entry |

The visualisation reads the data live, so it always shows the current state of the layer.
Reloading it after an edit shows the edit.

## The views

| View | Shows |
| --- | --- |
| **3D Viewer** | The places on a three-dimensional globe with terrain. The general-purpose view. |
| **Cluster** | Places grouped by density, for spotting concentrations in a large layer. |
| **Journey Route** | The places joined by a line **in the order they appear in the layer**. |
| **Journey Times** | The places joined by a line **in date order**. |
| **Timeline** | The places along a time axis, in date order. |
| **Werekata Flight by Route** | An animated flight over the places in layer order. |
| **Werekata Flight by Time** | An animated flight over the places in date order. |
| **Full Text** | The source document alongside the map, with its located placenames marked. Only for layers built from a [text](./texts). |
| **Temporal Earth** | The layer in Temporal Earth. |

Searches offer a smaller set — 3D Viewer, Cluster, Journey Route and Werekata Flight by
Route.

### Route or time?

The two journey views and the two flight views differ only in what determines the order
of the points:

- **by Route** follows the order of records in the layer. Change it with **Change
  Order** on the layer page — see [Editing records](./edit-records#reordering-records).
  Use this for a path that is known but not dated, such as a survey route or a walking
  track.
- **by Time** follows the records' start dates. Use this for something that happened over
  time, such as a voyage or a career.

A time-ordered view can only use records that have dates, so records without them drop
out. If a journey looks short, check how many of its records are dated.

## Embedding a visualisation

Every visualisation is a plain URL, so it can be linked or put in an `<iframe>` on your
own site. Open the view and copy the address from the browser.

The URL has two parts: the viewer, and a `load` parameter holding the
[feed URL](./exporting#feeds) of the data. Changing the feed URL points the same viewer
at different data.

## Featured layers

Layers can be marked as **featured**, which puts them on the **Featured Layers** panel of
the TLCMap home page along with the view they should open in. This is done by TLCMap
administrators rather than by contributors.

## Going further

TLCMap Views can do considerably more than the buttons in TLCMap expose — the colours,
symbols, popups and layer panels are all configurable through the GeoJSON feed it reads.

See the [TLCMap Views overview](/views/) for what is available and how to configure it.
