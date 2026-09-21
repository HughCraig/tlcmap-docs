# Sharing your work

There are two separate questions here, and it helps to keep them apart:

- **Visibility** — can the public see this layer at all?
- **Access** — who can change it?

## Public and private

Every layer and multilayer is either **public** or **private**. This is a single setting
on the layer, changed from the layer's edit form at any time.

| | Public | Private |
| --- | --- | --- |
| Appears in search results | Yes, under the *Layers* source | No |
| Listed at `/layers` | Yes | No |
| Downloadable by anyone | Yes | No |
| Readable through the Web Services API | Yes | No |
| Visible to people you have added | Yes | Yes |

Making a layer public is what "publishing" means in TLCMap. There is no review step and
no separate submission: the moment you set it to public, it is searchable.

::: tip
Work in private and publish when you are ready. Switching to public does not change
anything about the layer or its records, so there is no cost to waiting.
:::

## Adding people to a layer

Open the layer and choose **Edit Collaborators**. This lists everyone who currently has
access, with their email address, name and role.

There are four roles:

| Role | Can |
| --- | --- |
| **Owner** | Everything, including deleting the layer. Set when the layer is created; there is one owner. |
| **Admin** | Edit the layer and its records, upload files, and manage other people's access. |
| **Collaborator** | Add, edit and delete records, including by bulk upload. Cannot manage access. |
| **Viewer** | See the layer and its records, including while it is private. Cannot change anything. |

Only the owner and admins can add or change other people's access.

## Two ways to grant access

Choose the role first, then either generate a link or send an email.

### Share link

**Generate Link** creates a URL that grants the chosen role to whoever opens it while
logged in. Send it however you like.

A share link is not tied to a particular person. Anyone who has the link can use it, and
it keeps working until you destroy it. Treat it accordingly — a *Viewer* link for a
private layer is a reasonable thing to paste into a project chat; an *Admin* link is not.

**Destroy Share Links** invalidates every share link for the layer at once. People who
have already joined keep their access; only the unused links stop working.

### Email

Enter the person's email address and click **Send**. TLCMap emails them a share link for
the role you chose.

The recipient needs a TLCMap account. If they do not have one, they will be asked to
register, and the link works once they have.

## Changing and removing access

In the collaborator list, **Edit** changes someone's role and **Delete** removes their
access entirely.

Removing someone does not affect the records they created. Their contributions stay in
the layer.

## Sharing without giving access

Most of the time you do not need collaborators at all. If you want people to *use* your
data rather than edit it:

- Make the layer public and send them its URL. Layer URLs are stable.
- Send them a [Web Services feed URL](./exporting), so their software reads the live data
  rather than a copy.
- Export it as [RO-Crate](./exporting#ro-crate), which packages the records together with
  their metadata for deposit in a repository.

Filling in the **Citation**, **Creator**, **License** and **Usage Rights** fields on the
layer is what turns it from data into something other people can responsibly reuse. See
[Creating a layer](./create-layer).
