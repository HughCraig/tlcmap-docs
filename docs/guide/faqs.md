# FAQs

## Searching

### My search says "Displaying 200 from a total of 371". Where are the other 171?

TLCMap caps how many records it returns, and when a search matches more than the cap it
returns a random sample of that size rather than the first *n*. Raise **Limit to** in the
advanced panel, or narrow the search. See [Limit to](./search#limit-to).

### I searched for an exact name and got nothing, but the place is there.

**Exact Match** compares against the record's **title** only, not its placename, and the
title must match in full. Try **Contains** instead.

### Adding a date filter wiped out nearly all my results.

Records with no dates at all are excluded from a dated search, and most gazetteer entries
have no dates. This is intended, but it catches everyone once. See
[Searching by area and date](./search-area-and-date#what-a-date-filter-matches).

### The Feature, From ID and To ID filters do nothing.

They are currently broken in the release on tlcmap.org. The equivalent parameters do work
through the [Web Services API](/developers/search-api). See
[Filters](./search#filters).

### My extended data search returns everything, as if the filter were not there.

A condition that cannot be parsed is ignored rather than reported. Check that there are
spaces around the condition — `Capacity > 200`, not `Capacity>200` — and that the field
name matches exactly, including case. See [Extended data](./search#extended-data).

### Can I search a shape I already have as a file?

Yes, if it is KML containing a polygon. Two caveats: it searches the ANPS gazetteer only,
and it returns a plain list with no map. See
[Searching within a KML polygon](./search#searching-within-a-kml-polygon).

## Contributing data

### My upload failed and mentioned a line number.

Almost always a date TLCMap could not read on that line. Check it against the accepted
formats in [Writing dates](./prepare-data#writing-dates). One bad date stops the whole
import.

### My file uploaded but the extra columns disappeared.

They did not — they became [extended data](./concepts#extended-data), shown in a separate
section of each record and included in CSV exports.

### My column heading came out mangled.

Headings are stripped of anything that is not a letter, an underscore or a space, so
`Catalogue no. 3` becomes `Catalogue no `. Rename the column to something plainly
alphabetic before uploading.

### How do I fix fifty records at once?

Export the layer as CSV, edit it in a spreadsheet, and upload it back into the same
layer. The `ghap_id` column keeps each row attached to its record so the upload updates
rather than duplicates. See
[Updating records by re-upload](./prepare-data#updating-records-by-re-upload).

### My file is bigger than 10 MB.

Split it and upload the parts into the same layer one after another.

### Do I have to publish my data?

No. Layers are public by default but can be set private at any time, and a private layer
is invisible to everyone except you and the people you add. See
[Sharing your work](./sharing).

### Can I delete a layer?

Yes, and it takes its records with it. There is no undo, so export first if there is any
doubt.

## Sharing and collaborating

### Someone opened my share link and nothing happened.

Share links only work for people who are logged in to TLCMap. If they do not have an
account they will be asked to register, and the link works afterwards.

### I published a multilayer but one of its layers is blank for other people.

That layer is still private. Everything inside a public multilayer needs to be public
too. See [Multilayers](./collections).

### Can I take someone's access away?

Yes — **Edit Collaborators** on the layer, then **Delete** beside their name. Their
existing contributions stay in the layer. **Destroy Share Links** invalidates every
unused share link at once.

## Texts

### The geoparser found places that are not places.

It happens — people, ships, organisations and streets are all mistaken for places. Untick
them in the results list before creating the layer. See [Working with texts](./texts).

### A place ended up in the wrong hemisphere.

Set **Geocoding Bias** to **Australia** before parsing. Without it, names like
*Newcastle* and *Perth* are as likely to be placed in Britain. If the layer already
exists, drag the point to the right spot and save — see
[Editing records](./edit-records).

## Using the data

### How should I cite TLCMap data?

Cite the layer, not the site. A layer has a stable URL, and its page carries the
contributor's own **Citation**, **Creator** and **License**. For deposit in a repository,
export it as [RO-Crate](./exporting#ro-crate), which keeps the metadata with the data.

### Can I put a TLCMap map on my own website?

Yes. Open the visualisation you want and use its URL in an `<iframe>`. See
[Embedding a visualisation](./visualising#embedding-a-visualisation).

### Can my software read TLCMap directly?

Yes. Every public layer, multilayer and search has a live feed URL in GeoJSON, KML and
CSV, and the feeds allow cross-origin requests. See [Exporting and feeds](./exporting)
and the [developer documentation](/developers/).

### Is the Web Services API versioned?

No. It documents and serves the current release.

### A record's location looks wrong.

It may well be. Layers are contributed by many people from many sources, or derived by
computer, and are the responsibility of the contributor. Check the layer page for its
source and contact details. Absence from TLCMap does not indicate absence in reality.

## Account

### My password keeps being rejected.

The rules are strict: 8 to 16 characters, at least one lowercase letter, one uppercase
letter, one digit and one other character, no character repeated five times in a row, and
nothing that appears in your name or email address. That last rule is the usual culprit.
See [Accounts](./accounts#password-rules).

### Do I need an account to use TLCMap?

Only to contribute data, save searches, work with texts or collaborate. Searching,
browsing, downloading and the API all work without one.
