# Searching for places

The search bar across the top of [tlcmap.org](https://tlcmap.org) is the main way into
the data. Everything on this page is available without logging in.

## The quick search

Type a name into the box and press Enter, or click the magnifying glass.

![The TLCMap search bar](/images/search-bar.png)

The dropdown beside the box controls how the text is matched:

| Match type | What it matches |
| --- | --- |
| **Contains** | Records whose title or placename contains your text anywhere. The default. |
| **Similar Match** | As above, plus records whose title or placename merely resembles your text. Use this when you are unsure of the spelling, which is common with historical names. |
| **Exact Match** | Records whose **title** is exactly your text. Case is ignored. Note that this checks the title only, not the placename. |
| **Place ID** | A single record, by its [TLCMap ID](./concepts#place) — for example `a15224`. |

**Reset** clears the search box, every filter and the map view.

### Which sources are searched

The three coloured buttons to the right of the search bar switch whole sources on and
off. All three start switched on.

| Button | Source |
| --- | --- |
| **ANPS Gazetteer** | The Australian National Placenames Survey gazetteer. |
| **NCG Gazetteer** | The Composite Gazetteer of Australia. |
| **Layers** | Public layers contributed by TLCMap users, including places derived from texts. |

Turning off the two gazetteers is the quickest way to search only what the TLCMap
community has contributed.

### How results are displayed

The **Points**, **Cluster** and **List** buttons switch between three views of the same
results. They are covered in [Reading your results](./results).

### Featured layers

**Featured Layers** opens a panel of curated layers and multilayers. Choosing one opens
it directly, without running a search.

## Advanced search

The chevron beside the search box opens the advanced panel, which has three sections:
**Filters**, **Search within region**, and file-based searches. Region searching and
dates are covered in [Searching by area and date](./search-area-and-date).

![The advanced search panel](/images/advanced-search.png)

### Search description

**Search Description** widens the match to include each record's description field as
well as its title and placename. It is off by default, because descriptions are long and
it usually returns much more than you want.

### Limit to

**Limit to** caps how many records are returned — 100, 200, 500, 2000 or 5000. The
default is 200.

::: warning
When a search matches more records than the limit, TLCMap returns a **random sample** of
that size, not the first *n* records. The results header tells you both numbers, for
example *Displaying 200 from a total of 371*. If you need all of them, raise the limit
or download the results.
:::

### Filters

Choose a filter from the dropdown and click **Add** to add a row for it. Add as many as
you need; a record has to satisfy all of them. The small cross at the end of a row
removes it.

| Filter | Matches |
| --- | --- |
| **Place Type** | The record's [type](./concepts#record-type) — `Placename`, `Event`, `Person` and so on. |
| **Layers** | Records in the layers you name. Start typing to pick from the list. |
| **Extended Data** | Records whose [extended data](#extended-data) satisfies a condition. |
| **LGA** | The Local Government Area, matched exactly. |
| **State/Territory** | The state or territory, chosen from a list. |
| **Parish** | The parish. |
| **Feature** | The feature term — `mountain`, `lake`, `reserve` and similar. |
| **From ID** / **To ID** | A range of record identifiers. |
| **Date From** / **Date To** | A date range. See [Searching by area and date](./search-area-and-date#dates). |

::: warning Filters that currently have no effect
In the release now on tlcmap.org, the **Feature**, **From ID** and **To ID** filters are
ignored: you can fill them in, but they do not change the results. The equivalent
parameters do work through the [Web Services API](/developers/search-api), as
`feature_term`, `from` and `to`.
:::

Most filters are exact matches rather than partial ones. `NEWCASTLE` will find records
whose LGA is `NEWCASTLE`, but `New` will not.

## Extended data

Any field in a contributed layer that is not one of TLCMap's own fields is kept as
[extended data](./concepts#extended-data). The **Extended Data** filter searches it.

A condition looks like this:

```
Denomination textmatch Methodist
```

That is: the field name, the condition, and the value, separated by spaces. Combine
conditions with `AND`:

```
Denomination textmatch Methodist AND Capacity > 200
```

The available conditions are:

| Condition | Meaning |
| --- | --- |
| `textmatch` | The value contains your text, ignoring case. |
| `=` | The value is exactly your text. |
| `>` `<` | The value, read as a whole number, is greater or less than yours. |
| `before` `after` | The value, read as a date, falls before or after yours. |

Some rules worth knowing:

- The spaces around the condition are required. `Capacity>200` will not be recognised.
- Field names are matched exactly, including case. Names are stripped of digits and
  punctuation when data is uploaded, so the name to search for is the one shown on the
  record, not necessarily the one in the original file — see
  [Preparing your data](./prepare-data#how-columns-are-matched). If the name contains
  spaces, quote it: `"Sheet number" = 14`.
- `>` and `<` only compare records whose value is a whole number. Anything else — a
  decimal, a value with units, an empty field — is treated as not matching.
- `before` and `after` accept `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. A year alone is read as
  1 January of that year.
- A condition that cannot be parsed is silently ignored rather than reported, so check
  your syntax if a filter appears to do nothing.

## Searching for a list of place names

If you have many names to look up, put them in a plain text file — one per line, or
separated by commas — and upload it under **Search for a list of place names**. TLCMap
searches for all of them at once and returns the combined results.

The match type dropdown still applies, so you can run the whole list as *Contains*,
*Similar Match* or *Exact Match*.

## Searching within a KML polygon

**Search within a KML polygon** takes a KML file containing at least one `<Polygon>` —
an LGA boundary, a national park, a study area — and returns the records inside it.

Two limitations: this search covers the **ANPS gazetteer only**, and the results are
returned as a plain paged list with no map. It is intended for producing a download
rather than for browsing.

## Search URLs

Every search is expressed in the page URL, so a search can be bookmarked, cited or
emailed:

```
https://tlcmap.org/?containsname=Newcastle&searchausgaz=on&state=NSW
```

The same parameters drive the Web Services API, which returns the same results as KML,
CSV or GeoJSON. See the [search API](/developers/search-api).

If you want to come back to a search and pick up any records added since, save it instead
— see [Saving searches](./saved-searches).

## Adding a place from the map

Right-clicking the map is a shortcut for contributing rather than for searching: it drops
a marker and offers to add a place at that point. See
[Adding a place straight from the map](./create-layer#adding-a-place-straight-from-the-map).
