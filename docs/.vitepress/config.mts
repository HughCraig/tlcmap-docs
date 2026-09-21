import { defineConfig } from 'vitepress'

/**
 * The repository backing the "Edit this page on GitHub" links.
 * Update this once the documentation repository has a remote.
 */
const REPO = 'https://github.com/HughCraig/tlcmap-docs'

/** The TLCMap application. */
const APP = 'https://tlcmap.org'

/** The WordPress site, which holds the general and institutional content. */
const SITE = 'https://site.tlcmap.org'

/**
 * The TLCMap application repository, behind the GitHub icon in the navigation bar.
 * It still carries the application's former name.
 */
const APP_REPO = 'https://github.com/HughCraig/GHAP'

export default defineConfig({
  lang: 'en-AU',
  title: 'TLCMap Documentation',
  description:
    'User guide and developer documentation for the Time Layered Cultural Map.',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap',
      },
    ],
  ],

  themeConfig: {
    // The wordmark is unreadable at navigation size, so the bar uses the landscape
    // mark alone and the full logo is kept for the home page hero.
    logo: { light: '/tlcmap-mark.svg', dark: '/tlcmap-mark-dark.svg', alt: 'TLCMap' },
    siteTitle: 'TLCMap Documentation',

    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Developers', link: '/developers/', activeMatch: '/developers/' },
      { text: 'TLCMap Views', link: '/views/', activeMatch: '/views/' },
      { text: 'Open TLCMap', link: APP },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Start here',
          items: [
            { text: 'What is TLCMap?', link: '/guide/' },
            { text: 'Key concepts', link: '/guide/concepts' },
            { text: 'Accounts', link: '/guide/accounts' },
          ],
        },
        {
          text: 'Finding places',
          items: [
            { text: 'Searching for places', link: '/guide/search' },
            { text: 'Searching by area and date', link: '/guide/search-area-and-date' },
            { text: 'Reading your results', link: '/guide/results' },
            { text: 'Saving searches', link: '/guide/saved-searches' },
          ],
        },
        {
          text: 'Adding your own data',
          items: [
            { text: 'Preparing your data', link: '/guide/prepare-data' },
            { text: 'Creating a layer', link: '/guide/create-layer' },
            { text: 'Editing records', link: '/guide/edit-records' },
            { text: 'Working with texts', link: '/guide/texts' },
          ],
        },
        {
          text: 'Organising and sharing',
          items: [
            { text: 'Multilayers', link: '/guide/collections' },
            { text: 'Sharing your work', link: '/guide/sharing' },
            { text: 'Exporting and feeds', link: '/guide/exporting' },
            { text: 'Visualising your data', link: '/guide/visualising' },
          ],
        },
        {
          text: 'Analysing',
          items: [{ text: 'Analysing a layer', link: '/guide/analysis' }],
        },
        {
          text: 'Reference',
          items: [
            { text: 'FAQs', link: '/guide/faqs' },
            { text: 'Glossary', link: '/guide/glossary' },
          ],
        },
      ],

      '/developers/': [
        {
          text: 'Developer documentation',
          items: [
            { text: 'Overview', link: '/developers/' },
            { text: 'Search API', link: '/developers/search-api' },
            { text: 'Layers and collections API', link: '/developers/layers-api' },
            { text: 'Analysis API', link: '/developers/analysis-api' },
            { text: 'Output formats', link: '/developers/formats' },
            { text: 'Data model', link: '/developers/data-model' },
            { text: 'RO-Crate', link: '/developers/ro-crate' },
          ],
        },
      ],

      '/views/': [
        {
          text: 'TLCMap Views',
          items: [{ text: 'Overview', link: '/views/' }],
        },
      ],
    },

    search: { provider: 'local' },

    editLink: {
      pattern: `${REPO}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },

    socialLinks: [{ icon: 'github', link: APP_REPO }],

    outline: [2, 3],

    footer: {
      message: `<a href="${SITE}">About TLCMap</a> &middot; <a href="${SITE}/contact/">Contact</a> &middot; <a href="${SITE}/about/conditionsofuse/">Conditions of Use</a>`,
      copyright:
        'We acknowledge the Traditional Owners of country and pay our respects to Elders past, present and emerging.',
    },
  },
})
