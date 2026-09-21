# Saving searches

A saved search stores the *query*, not a copy of its results. Re-running it later picks
up anything added to TLCMap since you saved it, which makes it the right tool for a topic
you are following rather than a snapshot you want to freeze.

If you want a fixed set of records that will not change, download the results or copy
them into a layer of your own instead.

You need an account to save a search.

## Saving a search

Run the search, switch to the **List** view, and click **Save your search**.

You are asked for a name and, optionally, the same kind of metadata a layer carries:

| Field | Use |
| --- | --- |
| **Name** | Required. How the search appears in your list. |
| **Description** | A short paragraph summarising what the search is for. |
| **Search Type** | The [record type](./concepts#record-type) of what the search returns. Use `Other` if it is mixed. |
| **Subject** | Keywords. Type a word and press Enter to add it. |
| **Content Warning** | Anything a viewer should know before looking at the results. |
| **Date From** / **Date To** | The period the search covers. |
| **Latitude / Longitude From / To** | The bounding box the search covers. |

The metadata is worth filling in if you intend to add the search to a multilayer or cite
it, and can be skipped otherwise. You can edit it later.

TLCMap also records the number of results at the time you saved it, which gives you a
baseline to compare against when you re-run it.

## Your saved searches

**My Maps → My searches** lists everything you have saved:

| Column | |
| --- | --- |
| Name | Opens the search. |
| Result Size | The number of results when the search was saved. |
| Search URL | The query itself. |
| Keywords | The subject keywords you gave it. |
| Date Saved | |

**Edit** changes the metadata. **Delete** removes the saved search; it does not touch any
records.

**Create a new search** returns you to the search page.

## Using a saved search

Opening a saved search re-runs it and shows the current results. From there it behaves
like any other search: you can download the results, send them to TLCMap Views, or adjust
the query and save it again as a separate search.

A saved search can also be added to a multilayer, so that a live query sits alongside
fixed layers in the same collection. See [Multilayers and collections](./collections).
