# Searching by area and date

Two of the most useful ways to narrow a search are *where* and *when*. Both live in the
advanced panel, behind the chevron next to the search box.

## The map view

The simplest area filter is the map itself. Results are restricted to what is currently
in view, so panning and zooming re-runs the search over the new extent. If you are
looking for a name that occurs all over the country, zoom to the region you care about
first.

## Search within region

**Search within region** constrains results to an area you define explicitly, independent
of where the map happens to be.

Pick **Bounding Box** or **Polygon**, then either draw it or type the coordinates.

### Drawing

Click **Draw**, then use the drawing tools at the top right of the map. Draw a rectangle
for a bounding box, or click each corner in turn for a polygon. The coordinate boxes fill
in as you draw, so you can draw roughly and then correct the numbers.

### Typing coordinates

For a **bounding box**, fill in the minimum and maximum longitude and latitude. In
Australia, longitudes are positive and latitudes are negative:

| Box | Example |
| --- | --- |
| min long | `150.5` |
| max long | `152.0` |
| min lat | `-33.5` |
| max lat | `-32.0` |

Give the western edge as the minimum longitude and the eastern edge as the maximum. A
box that crosses the 180th meridian will therefore have a minimum larger than its
maximum, which TLCMap handles correctly.

For a **polygon**, give the points as `longitude latitude` pairs separated by commas:

```
150.5 -33.5, 152.0 -33.5, 152.0 -32.0, 150.5 -32.0, 150.5 -33.5
```

Two things to watch. Longitude comes first, which is the opposite order to how
coordinates are usually spoken. And the ring has to be closed: repeat the first point at
the end, as the example above does.

### Searching within a KML polygon

If the area you want already exists as a KML file — an LGA boundary, a national park, a
survey area — you can upload it instead of drawing. This is covered in
[Searching for places](./search#searching-within-a-kml-polygon), along with its two
limitations: it searches the ANPS gazetteer only, and it produces a plain list rather
than a map.

## Dates

Add the **Date From** and **Date To** filters from the filter dropdown in the advanced
panel.

### How dates are written

TLCMap accepts dates in two written forms:

| Form | Example |
| --- | --- |
| `YYYY-MM-DD`, `YYYY-MM` or `YYYY` | `1878-03-04`, `1878-03`, `1878` |
| `DD/MM/YYYY` | `4/3/1878` |

A year on its own is read as 1 January of that year. Years before the common era are
written with a leading minus, such as `-400`.

### What a date filter matches

Records in TLCMap have a start date, an end date, or both — a person's lifespan, the
years a building stood, the single day of an event. A date filter matches any record
whose period **overlaps** the period you gave:

- Give only **Date From**, and you get records that extend to at least that date.
- Give only **Date To**, and you get records that begin no later than that date.
- Give both, and you get records whose period overlaps the range at any point. A record
  does not have to sit entirely inside your range to match.
- Records with a start date but no end date, or the reverse, are matched on whichever
  date they have.

::: warning
**Records with no dates at all are excluded from a dated search.** Most gazetteer entries
have no dates, so adding a date filter will usually reduce the result count sharply. This
is the intended behaviour, but it surprises people the first time.
:::

### Dates in results

Results can be ordered by date and sent to the time-aware visualisations — timelines and
journeys — in TLCMap Views. See [Visualising your data](./visualising).
