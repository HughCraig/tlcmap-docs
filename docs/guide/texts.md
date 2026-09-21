# Working with texts

TLCMap can read a document, find the placenames in it, locate them on a map, and build a
layer from the result — keeping a link between each place and the passage it came from.

This is useful for diaries, letters, reports, newspaper articles, chapters and oral
history transcripts: anything where the places are named in prose rather than listed in
a spreadsheet.

You need an account. See [Accounts](./accounts).

## How it works

There are three stages, and you review the results between each of them.

1. **Upload the text** and describe it.
2. **Geoparse** it — find the placenames.
3. **Check and correct** what was found, then turn it into a layer.

Nothing is created until the last step, so you can parse the same text several ways
before committing to one.

## 1. Uploading a text

**My Maps → My texts → New text**, or choose **Text** as the source when
[creating a layer](./create-layer).

| Field | |
| --- | --- |
| **Name** | Required. The name you use to refer to the text, and the title of the resulting map. |
| **Type** | Whether this is fiction or non-fiction. Telling readers which may matter a good deal for how they read the map. |
| **Description**, **Subject**, **Creator**, **Publisher**, **Contact**, **Source URL**, **Linkback**, **Language**, **License**, **Citation**, **Usage Rights**, **Content Warning**, **Temporal Coverage**, **Date Created**, **Image** | The same metadata a layer carries. See [Creating a layer](./create-layer). |

Upload the document, or paste its contents. Texts are limited to about 2.5 MB — roughly
a long book. Split anything larger.

## 2. Geoparsing

Open the text and choose **Parse**.

### Geoparsing method

This decides how placenames are found in the text.

| Method | What it does |
| --- | --- |
| **BERT** | A language model reads the text and identifies place references from context. Use this when you do not know in advance which places appear. It will find names you were not expecting, and will occasionally mistake a person or an organisation for a place. |
| **Dictionary** | You supply a CSV listing the place names to look for. Only those are matched. Use this when you have a known set of places — a station list, an index, a gazetteer extract. |
| **Dictionary with coordinates** | As above, but your CSV also gives the coordinates, so nothing needs geocoding. Use this when you already know exactly where each place is. |

A **Dictionary** CSV has one place name per row, in the first column. A **Dictionary with
coordinates** CSV needs three columns: place name, latitude, longitude.

### Geocoding method and bias

Placenames found in the text still have to be turned into coordinates. The **Geocoding
Method** selects the service that does this.

**Geocoding Bias** tells the geocoder which country to prefer. It defaults to
**Australia**, which is almost always what you want — without it, *Newcastle* and
*Perth* are as likely to land in England or Scotland. Choose **Global** only if the text
genuinely ranges beyond one country.

This step is skipped entirely when you use **Dictionary with coordinates**.

Click **Parse**. Long texts take a while, and TLCMap shows an estimate and a progress bar
based on how long texts of that size have taken before.

## 3. Checking the results

The parse produces a list of the places it found, each with the coordinates it worked
out. This is the point to be sceptical:

- Geoparsing makes mistakes. People, ships, organisations and streets all get mistaken
  for places.
- Geocoding makes different mistakes. A name that is ambiguous, historical or no longer
  in use may be placed somewhere plausible but wrong.
- A place mentioned in an 1880s diary may not be where a modern geocoder puts it.

**Select All** and **Select None** help you work through a long list. Untick anything you
do not want. You can correct coordinates afterwards on the resulting records.

When you are satisfied, click **Add to New Layer**. TLCMap creates a layer from the
selected places, with the text's metadata carried across.

## The resulting layer

The layer behaves like any other: you can [edit its records](./edit-records), share it,
export it and analyse it.

It also keeps the link back to the text. Each record remembers the passage the placename
came from, which makes two extra things possible:

- The layer page has a **Full Text** view, showing the document with its located
  placenames marked, and the map alongside.
- The **Full Text** visualisation can be sent to TLCMap Views like any other view.

Because the layer is a normal layer, correcting a badly geocoded place is just
[editing the record](./edit-records) — drag the point to where it belongs and save.
