/**
 * Curated collections — languages, moods and singers.
 *
 * The directory has no single endpoint that answers "devotional stations", so
 * a collection is defined as one or more queries whose results are merged and
 * deduplicated. That is what lets "Devotional" pull from a tag, a couple of
 * name searches and a language at once, and come back as one sensible list.
 *
 * Two things learned from the data rather than assumed:
 *
 *   Singer searches must be scoped to India. `name=lata` unscoped returns
 *   Spanish stations called "Disco Party - Lata 90", because the directory
 *   matches substrings anywhere in a name.
 *
 *   Tag searches are thin. `bytagexact/devotional` has four usable stations,
 *   `bytagexact/bhajan` has none — almost nobody tags their station. Name
 *   searches find far more, because the word is usually in the station's name.
 *
 * `labels` are left untranslated on purpose. "Tamil", "Arijit Singh" and
 * "Bhakti" are names, not interface text — translating them would make them
 * harder to recognise, not easier.
 */

const india = (params) => ({ path: "search", params: { ...params, countrycode: "IN" } });

export const COLLECTION_GROUPS = [
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
        queries: [
          { path: "search", params: { tag: "devotional" } },
          india({ name: "bhakti" }),
          india({ name: "bhajan" }),
          india({ name: "devotional" }),
        ],
      },
      {
        id: "bollywood",
        label: "Bollywood",
        queries: [
          { path: "search", params: { tag: "bollywood" } },
          india({ name: "bollywood" }),
        ],
      },
      {
        id: "classical",
        label: "Classical",
        // Indian classical alone is two stations — nobody tags or names them
        // that way. The global classical tag has over 150, so the Indian ones
        // are listed first and the rest follow.
        queries: [
          india({ name: "classical" }),
          india({ name: "hindustani" }),
          { path: "bytagexact/classical" },
        ],
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
        id: "news",
        label: "News",
        queries: [india({ name: "news" }), { path: "search", params: { tag: "news", countrycode: "IN" } }],
      },
      {
        id: "retro",
        label: "Retro & 90s",
        queries: [india({ name: "retro" }), india({ name: "90s" }), india({ name: "old is gold" })],
      },
    ],
  },
  {
    id: "singers",
    titleKey: "groupSingers",
    items: [
      { id: "s-arijit",  label: "Arijit Singh",   queries: [india({ name: "arijit" })] },
      { id: "s-lata",    label: "Lata Mangeshkar", queries: [india({ name: "lata" })] },
      { id: "s-kishore", label: "Kishore Kumar",  queries: [india({ name: "kishore" })] },
      { id: "s-rafi",    label: "Mohammed Rafi",  queries: [india({ name: "rafi" })] },
      { id: "s-sonu",    label: "Sonu Nigam",     queries: [india({ name: "sonu" })] },
      { id: "s-rahman",  label: "A. R. Rahman",   queries: [india({ name: "rahman" })] },
      { id: "s-shreya",  label: "Shreya Ghoshal", queries: [india({ name: "shreya" })] },
      // "ilaiyaraaja" returns nothing; the directory spells it "ilayaraja".
      { id: "s-ilaiya",  label: "Ilaiyaraaja",    queries: [india({ name: "ilayaraja" })] },
    ],
  },
];

/** Flat lookup by id, for the API route. */
export const COLLECTIONS = Object.fromEntries(
  COLLECTION_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i]))
);

export function findCollection(id) {
  return COLLECTIONS[id] ?? null;
}
