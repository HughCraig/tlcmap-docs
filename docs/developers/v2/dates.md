# Dates

Every date in v2 is read by one rule, whether it is a record's `datestart` or `dateend`, a
`date_from` or `date_to` filter, or the date in an `extended_data` `before` or `after`
condition. This page states that rule.

::: warning Unstable
v2 is unstable until declared stable. See the [overview](./).
:::

## Accepted forms

After leading and trailing whitespace is removed, a date is read if it takes exactly one of
these forms:

| Form | Example | Names |
| --- | --- | --- |
| `Y` (one or more digits) | `1856`, `400` | that year (CE) |
| `-Y` (one or more digits) | `-400`, `-51021` | that year BCE |
| `[-]Y-MM` | `1856-03` | that month |
| `[-]Y-MM-DD` | `1856-03-04` | that day |
| `[-]Y-MM-DDThh:mm[:ss[.fff]]` | `1856-03-04T14:30` | that instant |
| `D/M/YYYY` (one or two digits for `D` and `M`) | `4/3/1856` | that day, day first |
| `[-]Y-00-00` | `1856-00-00` | that year |
| `00/00/Y` | `00/00/1856` | that year |

Anything else — another form, a field out of range, free text — is **not a date** to v2.

- **Years.** A leading minus means BCE: `-400` is 400 BCE. There is no year zero, so `0` and
  `-0` are not dates. Years may have any number of digits.
- **Calendar.** Proleptic Gregorian, in UTC. Leap years follow the Gregorian rule. Months run
  01 to 12, days must exist in the month (`-16112-11-31` is not a date), hours 00 to 23,
  minutes and seconds 00 to 59. Fractional seconds are cut to milliseconds.
- **Time zone.** UTC. Nothing is read in a local time zone.

## Milliseconds since 1970

A date becomes a signed count of milliseconds since 1970-01-01T00:00:00Z. Before 1970 it is
negative. The value is the **first instant of the period** the date names.

| Input | `udatestart` or `udateend` |
| --- | --- |
| `1970` | `0` |
| `1856` | `-3597523200000` |
| `1856-03` | `-3592339200000` |
| `1856-03-04` | `-3592080000000` |
| `4/3/1856` | `-3592080000000` |
| `1856-00-00` | `-3597523200000` |
| `400` | `-49544438400000` |
| `1` | `-62135596800000` |
| `-1` | `-62167219200000` |
| `-400` | `-74758377600000` |
| `-51021` | `-1672202880000000` |
| `2000-02-29` | `951782400000` |

These values come from the function v2 uses, run against the development database. They
stay within JavaScript's safe integer range; a date more than about 285,000 years from 1970 is
not read.

## Periods

A date names a **period**, not an instant: `1856` is the whole of 1856, and `1856-03` is the
whole of March 1856. The period's end is its last millisecond (`1856` ends at
1856-12-31T23:59:59.999Z). A date with a time names that instant only.

A record has a start side (`datestart`) and an end side (`dateend`). The period it covers
runs from the earlier of the two first instants to the later of the two last instants. If one
side is missing or unreadable, the other fills in for it, for filtering, sorting and
summaries only. A record whose end falls before its start still covers the span between them,
and its stored text is returned unchanged.

## What a feature reports

`datestart` and `dateend` are the stored text, verbatim. `udatestart` and `udateend` are the
first instants of those two texts, **each from its own side**. A side that is empty or
unreadable is `null`. The infill above is never used in output: a response does not invent a
value the record does not hold.

```
datestart "1849-03-17"   dateend null
udatestart -3811881600000   udateend null
```

(From a record in a Hunter Valley search; see [Place search](./places#examples).)

## Undated and unparseable

A record is **dated** if at least one of its two sides is a readable date. Otherwise it is
**undated**, in one of two kinds:

| Kind | Meaning |
| --- | --- |
| `no_date` | `datestart` and `dateend` are both empty or blank |
| `unparseable_date` | At least one has text, and neither can be read |

Separately, a record has an **unparseable date** if either side has text that cannot be read,
even when the other side is fine. Such a record is dated from its good side and is also
counted, so a half-garbled date is reported rather than quietly treated as a single point.

Every [summary](./#the-summary) reports these counts:

```json
"date_range": { "start": -4133980800000, "end": 32503679999999 },
"undated": { "total": 1216, "no_date": 1216, "unparseable_date": 0 },
"unparseable_dates": 0
```

`date_range` spans the periods of the dated records: `start` is the earliest first instant and
`end` is the latest last millisecond. It is `null` when no matching record is dated.

## Filtering by date

`date_from` and `date_to` are read by the same rule. One that is not a date is a `400
INVALID_PARAMETER`. Either may be given alone, and `date_from` later than `date_to` is a `400`.

A dated record matches when its period overlaps the range of periods you gave:

```
(date_to absent   or  the record's start <= the last instant of date_to)
and (date_from absent or the record's end   >= the first instant of date_from)
```

So `date_from=1820&date_to=1860` keeps a record dated `1860-06` and a record dated `1820`. A
record does not have to fall inside the range; it only has to overlap it.

### Undated records

`include_undated` decides what happens to records with no usable date when a date filter is
present. It defaults to **`true`**: they are kept. Set `include_undated=false` to drop them.
With no date filter it has no effect.

This is a deliberate difference from v1, which excludes undated records from a dated search
without saying so. In v2 the summary always reports the undated count, so you can see the
effect either way. Most gazetteer records are undated; a dated search that keeps them will be
much larger than one that does not.

### BCE example

Records whose period overlaps 400 to 300 BCE, undated records excluded.

```
GET /api/v2/places?date_from=-400&date_to=-300&include_undated=false&per_page=1
```

```json
{
  "type": "FeatureCollection",
  "query": {
    "name": null,
    "match": null,
    "sources": ["layers", "anps", "ncg", "text"],
    "layers": null,
    "bbox": null,
    "polygon": null,
    "date_from": "-400",
    "date_to": "-300",
    "include_undated": false,
    "state": null,
    "lga": null,
    "feature_term": null,
    "record_type": null,
    "extended_data": null,
    "summary_only": false,
    "sort": "id",
    "direction": "asc",
    "nulls": "last",
    "limit": null,
    "sample": null,
    "seed": null,
    "cursor": null,
    "per_page": 1
  },
  "summary": {
    "total": 5,
    "extent": [121.2338889, -32.925214, 151.768216, -15.58333333],
    "no_coordinates_count": 0,
    "date_range": {
      "start": -1639983196800000,
      "end": 32535215999999
    },
    "undated": {
      "total": 0,
      "no_date": 0,
      "unparseable_date": 0
    },
    "unparseable_dates": 0,
    "by_source": {
      "layers": 5,
      "anps": 0,
      "ncg": 0,
      "text": 0
    },
    "by_layer": [
      {
        "layer_id": 192,
        "name": "Dictionary of Newcastle test Honeysuckle",
        "count": 1,
        "warning": null
      },
      {
        "layer_id": 259,
        "name": "WA Journey Ways - Dampier Peninsula",
        "count": 4,
        "warning": null
      }
    ]
  },
  "page": {
    "returned": 1,
    "per_page": 1,
    "next_cursor": "eyJ2IjoxLCJoIjoiZDkzMDU2ZjAwZmIxZmVlNyIsImsiOjQxMDk5LCJpIjo0MTA5OSwibiI6MX0",
    "next": "https://tlcmap.org/api/v2/places?date_from=-400&date_to=-300&include_undated=false&per_page=1&cursor=eyJ2IjoxLCJoIjoiZDkzMDU2ZjAwZmIxZmVlNyIsImsiOjQxMDk5LCJpIjo0MTA5OSwibiI6MX0"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [151.768216, -32.925214]
      },
      "properties": {
        "id": "ta08b",
        "name": "Honeysuckle waterfront",
        "placename": "Honeysuckle waterfront",
        "description": "Fishing at Meekarlba (Honeysuckle) has a history that goes back for millennia.  Some of the earliest European images of Aboriginal people in Newcastle show them in pursuit of ma-ko-ro (fish)  women fishing with lines from canoes and men hunting fish with a muting (spear) (see images).  Spearing was made more efficient with the construction of stone fish traps in the tidal zones along what became Throsby Creek.  Stone barriers were constructed so that fish could swim over the top of them at high tide, but became trapped on the land side as the tide fell.  They remained in use at least until the mid 1800s.\n\nThe names of some of the fish caught by the Awabakal people of the Newcastle area were recorded as  wot-ta-wong (mullet), yu-rain (black bream), kur-rung-kum (large schnapper), mut-tau-ra (small schnapper), to-pe-a-ta-ra (flathead), ka-ro-burra (large whiting), tu-rea (bream), pur-ri-mun-kan (salmon), bo-a-ta (catfish), pun-bung (the sea slug or blubber), ka-nin (eel) and bun-run (red sea slug). \n\nAboriginal people also collected shellfish, creating huge middens over thousands of years as they discarded the shells at their favoured spots.  The mud oysters were mokai and the oysters that grew on mangroves were pirrita.\n\nAfter colonisation, new fishers arrived. Colonel William Paterson was so impressed that he recommended to Governor King in 1801 that the mouth of the Hunter River should become a fishing port. While surveying the river, his crew had used a seine net to secure a great haul of fish, including a 56 pound mulloway. The range and novelty of fish in Newcastle was so impressive that they were portrayed on the beautiful wooden collectors chest completed in 1818 for presentation to Governor Lachlan Macquarie. (See image).  \n\nBefore the harbour works around Honeysuckle began, areas of shallow water there were reported to abound with mud oysters; and prawns, crabs, crayfish, and lobsters are caught in great number. The work of redesigning the harbour and the Honeysuckle foreshore took their toll on fish stocks.  Blasting underwater rocks near the Bullock Island Dyke in the 1880s with dynamite killed many fish, and dredging works disturbed habitat.(see photo)  In 1907, the NSW Department of Fisheries noted that fish were not plentiful in Newcastle Harbour.   \n\nBy the twentieth century, while commercial fishing, including prawning, was undertaken from boats which moored in Throsby Creek, fishing along the Honeysuckle waterfront around to Carrington was largely amateur, enjoyed as a pastime and with the fish as a welcome addition to many tables.  Young boys in particular spent a great deal of time dipping a line and not infrequently found themselves in trouble from falling into the harbour.  Mrs Jean Roggers, who was born in Carrington in 1922, the eldest daughter in a family of six children, remembered that Throsby Creek came right up to the back fence of their Forbes Street home, north of the Cowper Street Bridge: Oh, we lived in that creek when we were kids. We'd go catching prawns, we'd go to catch crabs, we'd swim.  The children fished from the stairs leading down to the water from the wharves to catch tailor, 6 or 7 inches long, for their supper: in those days things were very, very hard. There was a Depression on and at that time my dad was sick, he'd got TB [tuberculosis] and couldn't work.\n \nMen fished on their own or as part of workplace groups, including the Honeysuckle Point Loco fishing club which fished for bream from the Dyke on Saturday nights in the 1910s.  Fishing was also a popular activity for couples, including the British migrants who arrived after World War II to work at the State Dockyard and were housed in flats at Carrington.  According to one of the women, fishing gave the newly arrived families a chance to get to know one another better, and to talk.  The fishing is a real community affair.   Others waves of visitors and immigration brought different fishing methods (see photo) and different sea creatures to attention, including the octopus sought by those from Greek backgrounds.   \n\nFishing at Honeysuckle has long had to compete with other uses of the foreshore and has now been banned in many places, but you may still see fishing boats passing on their way in or out from berths along Throsby Creek, and you can walk up to the Commercial Fishermens Co-Operative at 97 Hannell Street, Wickham to see and taste the catch of the day.",
        "datasource": "layers",
        "layer_id": 192,
        "record_type": "Other",
        "state": null,
        "lga": null,
        "parish": null,
        "feature_term": null,
        "datestart": "-37978",
        "dateend": "2022",
        "udatestart": -1260605548800000,
        "udateend": 1640995200000,
        "source": null,
        "external_url": null,
        "image_url": null,
        "glycerine_url": null,
        "url": "https://tlcmap.org/places/ta08b",
        "created_at": "2022-03-05T06:55:20Z",
        "updated_at": "2026-11-01T23:59:11Z",
        "extended_data": {
          "Theme_Topic": "Fishing",
          "Image": "https://digital.sl.nsw.gov.au/delivery/StreamGate?dps_dvs=1646392067647~801&dps_pid=FL1482751"
        },
        "extended_data_unreadable": false
      }
    }
  ]
}
```

The one feature returned has `datestart` of `-37978` and `dateend` of `2022`. Its period runs
from 37,978 BCE to 2022, so it overlaps the range. Its `udatestart` is negative and
`udateend` positive, each from its own side.
