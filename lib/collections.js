/**
 * Curated collections, one set per tab.
 *
 * The directory has no single endpoint that answers "devotional stations", so
 * a collection is defined as one or more queries whose results are merged and
 * deduplicated. That is what lets "Devotional" pull from a tag, a couple of
 * name searches and a language at once, and come back as one sensible list.
 *
 * Why the sets are split by tab: every Indian collection is scoped with
 * `countrycode: IN`, and a collection replaces the scope entirely. Showing the
 * same chips on both tabs therefore put Telugu and Arijit Singh on the
 * International tab and returned Indian stations from it. India browses by
 * language, mood and singer; the world browses by genre, kind and region.
 *
 * Two things learned from the data rather than assumed:
 *
 *   Singer searches must be scoped to India. `name=lata` unscoped returns
 *   Spanish stations called "Disco Party - Lata 90", because the directory
 *   matches substrings anywhere in a name.
 *
 *   Tag searches are thin for Indian material. `bytagexact/devotional` has
 *   four usable stations, `bytagexact/bhajan` has none — almost nobody tags
 *   their station. Name searches find far more, because the word is usually in
 *   the station's name. Internationally the reverse holds: genre tags are well
 *   populated, so the world set leans on them.
 *
 * `labels` are left untranslated on purpose. "Tamil", "Arijit Singh" and
 * "Bhakti" are names, not interface text — translating them would make them
 * harder to recognise, not easier.
 *
 * Order matters. Only the first few chips are shown before "View all", so each
 * group lists its strongest entries first.
 */

const india = (params) => ({ path: "search", params: { ...params, countrycode: "IN" } });
const tag = (name) => ({ path: "search", params: { tag: name } });
const country = (code) => ({ path: `bycountrycodeexact/${code}` });

const INDIA_GROUPS = [
  {
    id: "languages",
    titleKey: "groupLanguages",
    items: [
      { id: "lang-hindi",     label: "Hindi",     queries: [{ path: "bylanguageexact/hindi" }] },
      { id: "lang-tamil",     label: "Tamil",     queries: [{ path: "bylanguageexact/tamil" }] },
      { id: "lang-telugu",    label: "Telugu",    queries: [{ path: "bylanguageexact/telugu" }] },
      { id: "lang-malayalam", label: "Malayalam", queries: [{ path: "bylanguageexact/malayalam" }] },
      { id: "lang-kannada",   label: "Kannada",   queries: [{ path: "bylanguageexact/kannada" }] },
      { id: "lang-marathi",   label: "Marathi",   queries: [{ path: "bylanguageexact/marathi" }] },
      { id: "lang-punjabi",   label: "Punjabi",   queries: [{ path: "bylanguageexact/punjabi" }] },
      { id: "lang-bengali",   label: "Bengali",   queries: [{ path: "bylanguageexact/bengali" }] },
    ],
  },
  {
    id: "moods",
    titleKey: "groupMoods",
    items: [
      {
        id: "devotional",
        label: "Devotional",
        // Four separate ways people describe the same thing.
        queries: [tag("devotional"), india({ name: "bhakti" }), india({ name: "bhajan" }), india({ name: "devotional" })],
      },
      {
        id: "bollywood",
        label: "Bollywood",
        queries: [tag("bollywood"), india({ name: "bollywood" })],
      },
      {
        // Was "Ghazal & Sufi" — the directory has one Sufi station and no
        // ghazal or qawwali ones at all, so the chip was always empty. Every
        // collection here was checked against real results before shipping.
        id: "air",
        label: "All India Radio",
        queries: [india({ name: "air " }), india({ name: "akashvani" }), india({ name: "vividh" })],
      },
      {
        id: "classical",
        label: "Classical",
        // Indian classical alone is two stations — nobody tags or names them
        // that way. The global classical tag has over 150, so the Indian ones
        // are listed first and the rest follow.
        queries: [india({ name: "classical" }), india({ name: "hindustani" }), { path: "bytagexact/classical" }],
      },
      {
        id: "news-in",
        label: "News",
        queries: [india({ name: "news" }), india({ tag: "news" })],
      },
      {
        id: "hits",
        label: "Hits",
        queries: [india({ name: "hits" }), india({ name: "top 20" })],
      },
      {
        id: "retro",
        label: "Retro & 90s",
        queries: [india({ name: "retro" }), india({ name: "90s" }), india({ name: "old is gold" }), india({ name: "gold" })],
      },
    ],
  },
  {
    /**
     * Five singers, not the dozen you would expect.
     *
     * Almost nobody names a station after a singer: measured against the live
     * directory, Arijit Singh has three stations, Mohammed Rafi three, Lata
     * Mangeshkar six, and A. R. Rahman, Sonu Nigam and Ilaiyaraaja have
     * exactly one each — in Ilaiyaraaja's case only under the spelling
     * "ilayaraja". Alternate spellings and broader terms were tried and find
     * nothing more.
     *
     * The one-station names are left out rather than shipped: a chip that
     * opens onto a single result reads as a bug, and five that work are worth
     * more than eight where three are dead ends.
     */
    id: "singers",
    titleKey: "groupSingers",
    items: [
      { id: "s-lata",    label: "Lata Mangeshkar", queries: [india({ name: "lata" })] },
      { id: "s-arijit",  label: "Arijit Singh",    queries: [india({ name: "arijit" })] },
      { id: "s-rafi",    label: "Mohammed Rafi",   queries: [india({ name: "rafi" })] },
      { id: "s-kishore", label: "Kishore Kumar",   queries: [india({ name: "kishore" })] },
      { id: "s-shreya",  label: "Shreya Ghoshal",  queries: [india({ name: "shreya" })] },
    ],
  },
];

const WORLD_GROUPS = [
  {
    id: "genres",
    titleKey: "groupGenres",
    items: [
      { id: "g-pop",        label: "Pop",        queries: [tag("pop")] },
      { id: "g-rock",       label: "Rock",       queries: [tag("rock")] },
      { id: "g-jazz",       label: "Jazz",       queries: [tag("jazz")] },
      { id: "g-classical",  label: "Classical",  queries: [tag("classical")] },
      { id: "g-electronic", label: "Electronic", queries: [tag("electronic"), tag("dance")] },
      { id: "g-hiphop",     label: "Hip hop",    queries: [tag("hiphop"), tag("rap")] },
      { id: "g-country",    label: "Country",    queries: [tag("country")] },
      { id: "g-oldies",     label: "Oldies",     queries: [tag("oldies"), tag("80s")] },
      { id: "g-metal",      label: "Metal",      queries: [tag("metal")] },
      { id: "g-reggae",     label: "Reggae",     queries: [tag("reggae")] },
      { id: "g-blues",      label: "Blues",      queries: [tag("blues")] },
      { id: "g-lounge",     label: "Chill",      queries: [tag("chillout"), tag("lounge")] },
    ],
  },
  {
    id: "kinds",
    titleKey: "groupKinds",
    items: [
      { id: "k-news",   label: "News",    queries: [tag("news")] },
      { id: "k-talk",   label: "Talk",    queries: [tag("talk")] },
      { id: "k-sport",  label: "Sport",   queries: [tag("sports"), tag("sport")] },
      { id: "k-relig",  label: "Worship", queries: [tag("christian"), tag("gospel")] },
      { id: "k-kids",   label: "Kids",    queries: [tag("kids"), tag("children")] },
    ],
  },
  {
    id: "regions",
    titleKey: "groupRegions",
    items: [
      { id: "c-gb", label: "United Kingdom", queries: [country("GB")] },
      { id: "c-us", label: "United States",  queries: [country("US")] },
      { id: "c-ae", label: "UAE",            queries: [country("AE")] },
      { id: "c-au", label: "Australia",      queries: [country("AU")] },
      { id: "c-ca", label: "Canada",         queries: [country("CA")] },
      { id: "c-sg", label: "Singapore",      queries: [country("SG")] },
      { id: "c-de", label: "Germany",        queries: [country("DE")] },
      { id: "c-fr", label: "France",         queries: [country("FR")] },
    ],
  },
];

/** The groups a tab shows. Favourites has none — it is already a short list. */
export function groupsForScope(scope) {
  return scope === "international" ? WORLD_GROUPS : INDIA_GROUPS;
}

/** Flat lookup by id, across every set, for the API route. */
export const COLLECTIONS = Object.fromEntries(
  [...INDIA_GROUPS, ...WORLD_GROUPS].flatMap((g) => g.items.map((i) => [i.id, i]))
);

export function findCollection(id) {
  return COLLECTIONS[id] ?? null;
}
