# Exporting and feeds

TLCMap gives you your data back in four formats, and in two quite different ways: as a
**download**, which is a file you keep, and as a **feed**, which is a live URL that other
software reads.

## Formats

| Format | Good for |
| --- | --- |
| **CSV** | Spreadsheets, and round-tripping edits back into TLCMap. |
| **KML** | Google Earth and most desktop GIS. Keeps styling and journey lines. |
| **GeoJSON** | Web mapping, scripting, and anything programmatic. |
| **RO-Crate** | Depositing in a repository, with the metadata packaged alongside the data. |

## Downloading search results

Run a search, switch to the **List** view, and use the **Download** button. It offers
KML, CSV and GeoJSON.

The download contains the records currently in the result — which, if the search matched
more than the display limit, is the sample you are looking at rather than everything that
matched. Raise **Limit to** before downloading if you need the lot. See
[Reading your results](./results#how-many-results-you-get).

## Downloading a layer

The layer page has a **Download** menu with KML, CSV, GeoJSON and **RO-Crate**.

Downloading a layer always gives you every record in it, regardless of any search.

The CSV export includes a `ghap_id` column, which is what makes the export-edit-reupload
cycle work. See
[Updating records by re-upload](./prepare-data#updating-records-by-re-upload).

## Downloading a multilayer

Multilayers download as GeoJSON, KML, CSV or RO-Crate, with their layers kept distinct in
the output. Any saved searches in the multilayer are included as their query URLs rather
than as a frozen copy of their results.

## Feeds

A **feed** is a URL that returns the current data every time it is fetched. Feeds are
what you want when the data will keep changing and you do not want to re-export it by
hand — a map on your own website, a script, a QGIS layer, a notebook.

Feeds are public data only. A private layer returns nothing.

### Search feeds

In the **List** view, the **WS Feed** menu gives you the URL that produces the current
search in KML, CSV or GeoJSON. It is an ordinary search URL with a `format` parameter:

```
https://tlcmap.org/places?containsname=Newcastle&format=json
```

Adjust the search and take the feed URL again, or edit the parameters directly.

### Layer feeds

Every public layer has three stable feed URLs:

```
https://tlcmap.org/layers/1091/json
https://tlcmap.org/layers/1091/kml
https://tlcmap.org/layers/1091/csv
```

Adding `/download` to any of them makes the browser save it as a file instead of
displaying it:

```
https://tlcmap.org/layers/1091/json/download
```

Multilayers work the same way under `/multilayers/`.

Feed URLs allow cross-origin requests, so a web page can fetch them directly from
JavaScript without a proxy.

## RO-Crate

An **RO-Crate** is a zip file containing the layer's records together with a machine-
readable description of what they are — the creator, licence, citation, subject keywords,
spatial and temporal coverage, and the provenance of the data.

Use it when you are depositing data in a repository or attaching it to a publication. A
plain CSV loses everything about the layer except its rows; an RO-Crate keeps the context
that makes the rows interpretable years later.

This is where the metadata you filled in when [creating the layer](./create-layer) earns
its keep. A layer with an empty Creator, License and Citation produces an RO-Crate that
says very little.

RO-Crate is available for layers and multilayers, from the **Download** menu or at:

```
https://tlcmap.org/layers/1091/ro-crate
https://tlcmap.org/multilayers/42/ro-crate
```

See the [RO-Crate reference](/developers/ro-crate) for what the crate contains.

## Going further

Everything on this page is the browser-facing side of the Web Services API. If you are
writing software against TLCMap — paging through large result sets, filtering
programmatically, or building something that stays in sync — see the
[developer documentation](/developers/).
