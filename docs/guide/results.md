# Reading your results

The three buttons at the right of the search bar — **Points**, **Cluster** and **List** —
show the same results three different ways. You can switch between them at any time
without re-running the search.

## Points

Every matching record is drawn as a dot on the map, coloured by the source it came from.
Click a dot to open its popup.

The popup shows the record's fields, any image attached to it, a link to its Glycerine
image if it has one, and its **TLCMap ID**. The ID is a link: following it opens that one
record on its own.

## Cluster

Nearby records are grouped into numbered circles that split apart as you zoom in. Use
this when a search returns too many points to read — it shows you where the density is
rather than where each individual record sits.

## List

The list gives you the full detail of each record, and it is where the export and
visualisation controls live.

Above the results you will find:

- **Displaying *n* from a total of *N*** — how many records are shown against how many
  matched. If these differ, you are seeing a sample; see
  [Limit to](./search#limit-to).
- **View Maps…** — send the results to TLCMap Views. See
  [Visualising your data](./visualising).
- **Download** — save the results as KML, CSV or GeoJSON.
- **WS Feed** — the Web Services URL that produces these results, in the same three
  formats, for use in other software. See [Exporting and feeds](./exporting).
- **Save your search** — store the query so you can re-run it later. Requires an account;
  see [Saving searches](./saved-searches).

Each result is laid out in columns:

| Column | Contains |
| --- | --- |
| Title | The record title, linked to the 3D view of that record. Below it: the placename, the layer or gazetteer it belongs to, its link back to the source, and its type. |
| Details | Latitude, longitude, start and end dates, state, LGA, parish and feature term — whichever of these the record has. |
| Description | The record's description, preceded by the layer's content warning if it has one. |
| Sources | The TLCMap ID and the source cited by the contributor. |
| Extended Data | Any [extended data](./concepts#extended-data) fields, if the record has them. |
| Image | The record's image, if it has one. |

Fields that are empty are left out entirely rather than shown blank, so two records in
the same list may show different rows.

On a narrow screen the columns collapse into buttons you can tap to expand.

## How many results you get

Two separate limits apply.

**The display limit** is the **Limit to** setting in the advanced panel, which defaults
to 200. When more records match than this, TLCMap returns a random sample of that size —
so the total shown in the results header will be larger than the number of records you
can see. Raising the limit or narrowing the search fixes this.

**The system limit** applies to the Web Services API and to very large downloads. If a
request asks for more results, or more results per page, than the server is configured to
handle, you are shown a *Maximum Paging Reached* page telling you the current maximum.
Continuing from that page runs the request with the results capped at that number.

## Going back to a single record

Any record can be reached directly by its TLCMap ID:

```
https://tlcmap.org/places/a15224
```

Adding a format gives you the data rather than the page:

```
https://tlcmap.org/places/a15224/json
https://tlcmap.org/places/a15224/kml
https://tlcmap.org/places/a15224/csv
```

## Before you rely on a result

Layers are contributed by many people from many sources, or derived by computer, and are
the responsibility of the contributor. Check the layer page for its source, its licence
and any content warning before citing a record. Absence from TLCMap does not indicate
absence in reality.
