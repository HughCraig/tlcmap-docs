# Editing records

Open a layer from **My Maps → My layers**. Its records are listed under **Places**, each
with an **Edit** and a **Delete** button.

You can edit records in a layer if you are its owner, an admin on it, or a collaborator.
See [Sharing your work](./sharing).

## Adding a place one at a time

**Add place to layer** opens the same form as **Edit**, empty. Use it for a handful of
records; for anything more, prepare a file and upload it — see
[Preparing your data](./prepare-data).

## The record form

Only the title is required. Everything else can be left empty.

### Title and location

**Title** is what appears on the map and in search results.

**Latitude** and **Longitude** can be typed in, or set from the map beside them:

| Control | |
| --- | --- |
| Click the map | Moves the dot. |
| **Set Coordinates** | Copies the dot's position into the Latitude and Longitude boxes. |
| **Reset** | Moves the dot back to the coordinates in the boxes, or to your own location if they are empty. |
| **Unset** | Clears the coordinates. |
| **Fullscreen** | Enlarges the map, which makes precise placement much easier. |

### Description

| Field | |
| --- | --- |
| **Placename** | The name of the place itself. Optional — a record about an event or a person may not have one. If the record *is* a place, put the name in the Title as well. |
| **Record Type** | See [record types](./concepts#record-type). |
| **Description** | Free text about the record. |

### Dates

**Date Start** and **Date End**, in the formats described in
[Preparing your data](./prepare-data#writing-dates). Either may be left empty.

### Image

**Image** attaches a picture to the record, shown in the map popup and in the list view.
**Delete current image** removes it.

**Glycerine Image** links the record to an image hosted in Glycerine, by IIIF manifest.
The record then shows an *Open Glycerine Image* link in its popup.

### Reference

| Field | |
| --- | --- |
| **Linkback (URL)** | A link shown in the map popup pointing to another web page about this place. The URL only, starting with `https://`. |
| **Source** | Where the information came from — a URL, an ISBN, a book title, an archive reference. |

### Region

| Field | |
| --- | --- |
| **Feature Term** | The kind of landscape feature — mountain, lake, hill. Start typing and choose from the list. |
| **State** | |
| **LGA** | The Australian Local Government Area. Start typing and choose from the list. |

Using the suggestions rather than typing freely matters here: these fields are searched
by exact match, so a spelling that differs from the standard one makes the record
invisible to that filter.

### Extended data

[Extended data](./concepts#extended-data) is a table of name and value pairs. The name is
like a column heading; the value is what this particular record has under it.

**Add Row** adds a pair, **Delete** removes one. These fields survive CSV export and
re-import, so extended data is the right place for anything TLCMap has no field of its
own for.

Click **Save**.

## Reordering records

**Change Order** turns on drag and drop so you can rearrange the records in the layer.

The order only matters for the journey and flight visualisations that follow the records
in sequence — *Journey Route* and *Werekata Flight by Route*. Everything else ignores it.

## Deleting a record

**Delete** asks for confirmation and then removes the record permanently. There is no
undo. If you are about to do several deletions, export the layer first.

## Bulk edits

For anything more than a few changes, export the layer as CSV, edit it in a spreadsheet,
and upload it back into the same layer. The `ghap_id` column keeps each row attached to
its record, so the upload updates rather than duplicates. See
[Updating records by re-upload](./prepare-data#updating-records-by-re-upload).
