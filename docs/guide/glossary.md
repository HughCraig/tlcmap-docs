# Glossary

| Term | Meaning |
| --- | --- |
| **ANPS Gazetteer** | The Australian National Placenames Survey gazetteer — official Australian placenames, including historical ones. One of the three sources you can search. Its records have TLCMap IDs beginning with `a`. |
| **Bounding box** | A rectangle given by its furthest north, south, east and west coordinates. Used to restrict a search to an area, and reported by Basic Statistics as the extent of a layer. |
| **Centroid** | The midpoint of a set of places. Not necessarily near any actual place — the centroid of two towns 500 km apart is the empty country between them. |
| **Collaborator** | Someone given access to a layer. Also the specific role that can add and edit records but not manage other people's access. See [Sharing your work](./sharing). |
| **Collection** | See *Multilayer*. |
| **Convex hull** | The smallest shape enclosing every place in a layer without any inward bends — a rubber band stretched around the outermost points. Used as the layer's area. |
| **Dataitem** | The internal name for a *place* record. It appears in API responses and URLs. |
| **Dataset** | The internal name for a *layer*. It appears in URLs such as `myprofile/mydatasets`. |
| **DBScan** | A clustering method that finds groups wherever places are dense enough, and leaves isolated places unassigned. See [Cluster Analysis](./analysis#cluster-analysis). |
| **Extended data** | Name-and-value pairs attached to a record, holding anything TLCMap has no field of its own for. Created automatically from unrecognised columns in an uploaded file. |
| **Feature term** | The kind of landscape feature a place is — mountain, lake, reserve. Drawn from a controlled list. |
| **Feed** | A URL that returns current data each time it is fetched, rather than a downloaded copy. See [Exporting and feeds](./exporting#feeds). |
| **Geocoding** | Turning a placename into coordinates. |
| **Geoparsing** | Finding placenames in a document. TLCMap geoparses first, then geocodes what it found. See [Working with texts](./texts). |
| **GHAP** | A former name for TLCMap, retained in some URLs and field names. It is deprecated; the application is TLCMap. |
| **Glycerine** | An image platform that TLCMap records can link to, by IIIF manifest. |
| **KMeans** | A clustering method that divides places into a fixed number of groups, assigning every place to one. See [Cluster Analysis](./analysis#cluster-analysis). |
| **Layer** | A set of place records published together with its own metadata. The unit in which people contribute data to TLCMap and cite it out of it. Called a *dataset* internally. |
| **LGA** | Local Government Area — the Australian council areas. |
| **Linkback** | A URL on a record or layer pointing to the same thing on another website. |
| **Multilayer** | Several layers, and optionally saved searches, grouped so they can be viewed, downloaded and cited together. Called a *collection* internally. |
| **NCG Gazetteer** | The Composite Gazetteer of Australia. One of the three sources you can search. Its records have TLCMap IDs beginning with `n`. |
| **Parish** | A cadastral land division used in Australian land records, and a search filter. |
| **Place** | A single record in TLCMap: a title, usually coordinates, and whatever else the contributor supplied. Also called a *record*. |
| **Public / private** | Whether a layer or multilayer is visible to everyone, or only to its owner and the people they have shared it with. |
| **Record type** | What a place, layer or saved search describes — `Placename`, `Event`, `Person`, `Journey`, `Site`, `Organisation`, `Media`, `Text` or `Other`. |
| **RO-Crate** | A packaging standard that bundles data with a machine-readable description of what it is. TLCMap exports layers and multilayers as RO-Crates for deposit in repositories. See [RO-Crate](./exporting#ro-crate). |
| **Saved search** | A stored query rather than a stored set of results. Re-running it picks up records added since. See [Saving searches](./saved-searches). |
| **Temporal Earth** | A visualisation platform that TLCMap layers can be sent to. |
| **Text** | A document uploaded to TLCMap so its placenames can be found, located and turned into a layer. See [Working with texts](./texts). |
| **TLCMap ID** | The permanent identifier of a place, such as `a15224`. The first letter gives the source, the rest is a hexadecimal number. Always resolvable at `https://tlcmap.org/places/<id>`. |
| **TLCMap Views** | The separate viewer that renders TLCMap data in 3D, as journeys, timelines and animated flights. See [Visualising your data](./visualising). |
| **Web Services API** | The set of URLs that return TLCMap data as KML, CSV or GeoJSON for use by other software. See the [developer documentation](/developers/). |
| **Werekata** | The animated flight visualisation in TLCMap Views, which flies over a layer's places in order. |
