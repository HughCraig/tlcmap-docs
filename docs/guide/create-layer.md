# Creating a layer

A [layer](./concepts#layer) is how your data gets into TLCMap. Creating one takes three
steps, and only the first is compulsory.

You need an account. See [Accounts](./accounts).

## Contribute Map Layer

Choose **Contribute** in the main menu.

![The Contribute Map Layer form](/images/contribute-layer.png)

### 1. Layer details

| Field | |
| --- | --- |
| **Layer name** | Required. |
| **Description** | Required. A short paragraph summarising the layer. Anything not covered by the other fields can go here. |

Click **Next**.

### 2. Source file

Click **Source**, choose the format of your file — **GeoJSON**, **KML**, **CSV** or
**Text** — and select it. See [Preparing your data](./prepare-data) for what the file
needs to contain.

You can also **Skip** this step and add places one at a time later, or upload a file into
the layer after it exists. Nothing about this step is final.

Choosing **Text** uploads a document for geoparsing instead of a data file; see
[Working with texts](./texts).

### 3. Other information

Everything here is optional and can be changed later, but it is what makes a layer
citable and reusable. Fill in what you can.

| Field | |
| --- | --- |
| **Subject (keywords)** | Type a word and press Enter to add it. These are what people search on. |
| **Record Type** | What kind of thing the layer describes. See [record types](./concepts#record-type). |
| **Visibility** | **Public** or **Private**. Defaults to Public. See [Sharing your work](./sharing). |
| **Allow ANPS to collect this data?** | Whether the Australian National Placenames Survey may incorporate your placenames into the national gazetteer. |
| **Creator** | The person or organisation who researched or prepared the data. |
| **Publisher** | |
| **Contact** | Contact details for questions about this layer. |
| **DOI** | If the data has one. |
| **Source URL** | The URL of the source of the information in this layer. The URL only. |
| **Linkback** | The URL of your project's website. The URL only. |
| **Language** | The two-letter code where possible, such as `EN`. |
| **Spatial Coverage** | The bounding box of the area the layer covers — latitude and longitude, from and to. |
| **License** | The licence the data is released under. |
| **Image** | A thumbnail for the layer. |
| **Temporal Coverage** | The date range the layer covers. |
| **Date Created** | When the information in the layer was created, which may be long before you uploaded it. |
| **Citation** | How people should cite this data. |
| **Usage Rights** | |
| **Content Warning** | Anything a viewer should know before looking at the layer — for example, that the content may distress some viewers. |

Click **Create Layer**.

::: tip
Set **Visibility** to **Private** if you are still working on the data. A private layer
is invisible to everyone except you and the people you share it with, and you can publish
it later from the layer page. Publishing is a single setting; there is no separate
process.
:::

## Adding a place straight from the map

There is a shortcut that skips the Contribute form entirely. On the map on the
[TLCMap home page](https://tlcmap.org), **right-click anywhere** on the map. A marker
appears at that point, with a small pin button beside it.

![A marker and pin button on the map after right-clicking](/images/map-add-place.png)

Click the pin button and the **Add a place to TLCMap** form opens, with the latitude and
longitude already filled in from where you clicked.

![The Add a place to TLCMap form](/images/add-place-modal.png)

Every place has to live in a layer, so the form asks for one first:

- Choose an existing layer from the **Layer** dropdown, or
- Click **New layer** to create one without leaving the page. You are returned to this
  form once it is created.

The rest of the form is the same as the record form described in
[Editing records](./edit-records#the-record-form) — title, coordinates, description,
dates, image, reference, region and extended data. Only **Layer**, **Title**,
**Latitude** and **Longitude** are required.

Click **Add Place** to save.

::: tip
This is the quickest way to start contributing: right-click the spot, create a layer on
the way through, and you have a published place in one pass. Come back to the layer later
to fill in its metadata.
:::

If you are not logged in, the pin button sends you to the login page instead.

## Adding a file to an existing layer

Open the layer from **My Maps → My layers** and use the bulk upload there. The file is
read the same way as it is during creation, and its records are added to what is already
in the layer.

When you upload a **KML**, two extra options appear:

| Option | Effect |
| --- | --- |
| Append style | Brings the KML's styling into the layer, added to any styling already there. |
| Overwrite journey | Replaces the layer's journey line with the one in the KML. |

If an upload fails, TLCMap returns you to the layer page with the reason. The most
common cause is a date it could not read, and the message names the line.

## Editing a layer's details

The layer page has an edit form carrying the same fields as step 3. Changing them does
not affect the records in the layer.

## Deleting a layer

Deleting a layer deletes its records with it, and cannot be undone. Export the layer
first if you might want it back — see [Exporting and feeds](./exporting).

## Next

- Add or correct individual records: [Editing records](./edit-records).
- Let other people work on the layer: [Sharing your work](./sharing).
- Put it on a map: [Visualising your data](./visualising).
