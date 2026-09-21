# Analysing a layer

TLCMap can run five kinds of analysis over a layer. They are reached from the layer page,
and all of them work on public layers whether or not you own them.

Each analysis produces a table you can read in the browser, a GeoJSON result you can
download or feed to TLCMap Views, and in most cases a CSV.

| Analysis | Answers |
| --- | --- |
| [Basic Statistics](#basic-statistics) | How many places, how spread out, where is the centre, what period do they cover? |
| [Advanced Statistics](#advanced-statistics) | How far apart are the places from each other? |
| [Cluster Analysis](#cluster-analysis) | Do the places fall into spatial groups? |
| [Temporal Clustering](#temporal-clustering) | Do they fall into groups in time? |
| [Closeness Analysis](#closeness-analysis) | How close is this layer to another one? |

::: tip
All of these are descriptive, not inferential. They tell you the shape of what you have;
they do not tell you whether that shape is meaningful. A tight cluster may reflect
historical reality, or it may reflect where the records happened to survive.
:::

## Basic Statistics

Runs over the whole layer with no settings.

**Counts and extent**

| Measure | |
| --- | --- |
| Total Places | The number of records in the layer. |
| Area | The area of the convex hull around every place, in km². The convex hull is the smallest shape enclosing them all without any inward bends — a rubber band stretched around the outermost points. |
| Convex Hull | That shape, as coordinates. |
| Density | Places per km² of that area. |
| Centroid | The midpoint of all the places. |
| Bounding Box | The box enclosing everything, given by the furthest north, south, east and west coordinates. |

**Notable places**

| Measure | |
| --- | --- |
| Most Central Place | The place closest to the centroid. |
| Most Distant Place from center | The place furthest from the centroid — usually the one worth checking for a coordinate error. |
| Distribution | The average distance from the centroid, and that distance divided by the area of the convex hull. The ratio is a rough measure of whether the places are evenly scattered or bunched. |

**Dates** — only when the layer has dated records:

| Measure | |
| --- | --- |
| Start Date / End Date | The earliest and latest dates anywhere in the layer. |
| Duration | The span between them, in years. |
| Median Date | The middle date when all dates are sorted. |
| Average Date | The arithmetic mean of all dates. |

The median and the average together are informative: if they are far apart, the layer's
dates are lopsided, with a long tail on one side.

**Download** gives you CSV or GeoJSON. The GeoJSON includes the convex hull, bounding box
and centroid as features, so **View Map** draws them over the places.

## Advanced Statistics

Distances, measured between every pair of places in the layer.

| Measure | |
| --- | --- |
| Min / Max distance between 2 places | The closest and furthest pair. |
| Average / Median distance between places | Typical separation across all pairs. |
| Standard Deviation of distance between places | How much that separation varies. |
| Average / Median Min distance between neighbouring places | For each place, the distance to its nearest neighbour, summarised. |
| Standard Deviation of Min distance | How much nearest-neighbour distance varies. |
| Most Distant Place From Any Other Place | The most isolated place — the one with the largest nearest-neighbour distance. |

All distances are in kilometres.

The nearest-neighbour figures are the more useful half of this. Average distance between
all pairs mostly reflects how large the study area is; average distance to the *nearest*
place tells you how tightly the places sit together within it.

::: warning
This compares every place against every other, so the work grows with the square of the
layer size. A large layer will take a while.
:::

## Cluster Analysis

Groups places by spatial proximity. Two methods are available.

### DBScan

Density-based clustering. It finds groups wherever places are packed closely enough
together, and leaves anything isolated unassigned.

| Setting | |
| --- | --- |
| **Distance (kms)** | How close two places must be to count as neighbours. |
| **Number of Neighbours** | How many neighbours a place needs before it can anchor a cluster. |

Use DBScan when you do not know how many groups there should be, and when you want
outliers identified rather than forced into a group. Start with a distance that matches
the scale of what you are looking for — a few kilometres for places within a town, tens
of kilometres for a region.

### KMeans

Divides the places into a fixed number of groups, assigning every place to one.

| Setting | |
| --- | --- |
| **Number of Clusters** | How many groups to make. Required. |
| **Within Radius (kms)** | Optional. Discards any cluster that has a place further than this from the cluster's centre. |

Use KMeans when you already know how many groups you expect. Unlike DBScan it has no
concept of noise, so every place ends up in a cluster whether it belongs to one or not —
which is what **Within Radius** is for: it throws away the clusters that only exist
because the algorithm had to put those places somewhere.

Click **Analyze** to run either method. The result lists each cluster and its places, and
can be downloaded or mapped.

## Temporal Clustering

Groups places by *when* they are, not where.

| Setting | |
| --- | --- |
| **Years Interval** | |
| **Days Interval** | |

The two are added together to make a single gap size. Places are sorted by start date,
and a new cluster begins wherever the gap to the next date exceeds that interval. A layer
of events with a decade of silence in the middle therefore splits into two clusters at
any interval under ten years.

Records with no start date cannot be placed in time, so they are dropped, and the result
tells you how many were dropped. If that number is large, the clustering describes only
part of your layer.

Click **Cluster** to run it.

## Closeness Analysis

Compares two layers: how close does one sit to the other?

Choose a **Target Layer** — start typing its name — and click **Analyse**. The layer you
started from is the source.

For every place in the source layer, TLCMap finds the distance to the nearest place in
the target layer, then summarises those distances:

| Measure | |
| --- | --- |
| Min Min Distance | The closest any source place gets to the target layer. |
| Max Min Distance | The source place furthest from anything in the target layer. |
| Average / Median Min Distance | Typical distance from a source place to the nearest target place. |
| Max Distance | The furthest apart any two places in the two layers are. |
| … / Area | Each of the above divided by the area of the source layer's convex hull, so that layers covering different-sized regions can be compared. |

This is the analysis for questions of the form *were the missions near the stations?* or
*did the shipwrecks cluster around the lighthouses?* A low average minimum distance means
the two layers occupy the same ground; a high one means they do not.

**View Map** draws the shortest and longest connecting lines over both layers, which is
usually more revealing than the numbers.

## Using the results elsewhere

Every analysis has a JSON feed that other software can read, and a download for saving
it. The URLs follow the layer:

```
https://tlcmap.org/layers/1091/basicstatistics/json
https://tlcmap.org/layers/1091/clusteranalysis/dbscan/json
https://tlcmap.org/layers/1091/temporalclustering/json
```

See the [analysis API](/developers/analysis-api) for the parameters each one takes.
