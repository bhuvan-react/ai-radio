/**
 * Every piece of text the interface says, in every language it speaks.
 *
 * One flat object per language rather than nested namespaces — the app is
 * small enough that nesting buys nothing and makes a missing key harder to
 * spot. If it grows past a couple of hundred keys, split it per file then.
 *
 * A missing key falls back to English rather than rendering blank, so a new
 * string can ship before every language has caught up.
 */

export const LANGUAGES = [
  { code: "en", label: "English",  native: "English",   flag: "🌐", speech: "en-IN" },
  { code: "hi", label: "Hindi",    native: "हिन्दी",      flag: "🇮🇳", speech: "hi-IN" },
  { code: "te", label: "Telugu",   native: "తెలుగు",     flag: "🇮🇳", speech: "te-IN" },
  { code: "ta", label: "Tamil",    native: "தமிழ்",      flag: "🇮🇳", speech: "ta-IN" },
  { code: "es", label: "Spanish",  native: "Español",   flag: "🇪🇸", speech: "es-ES" },
  { code: "fr", label: "French",   native: "Français",  flag: "🇫🇷", speech: "fr-FR" },
];

export const DEFAULT_LANGUAGE = "en";

/**
 * Which language a country gets on a first visit. Only countries where the
 * answer is clear — everywhere else falls through to the browser's own
 * setting, which is a better guess than a map of 200 countries would be.
 */
export const COUNTRY_LANGUAGE = {
  IN: "hi",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  FR: "fr", BE: "fr", SN: "fr", CI: "fr",
};

const en = {
  appName: "SV Radio",
  tagline: "Live stations from India and the world",

  searchPlaceholder: "Search stations, cities, genres…",
  searching: "Searching…",
  noResults: "No stations found",
  noResultsHint: "Try a different name, city or genre.",
  loading: "Loading stations…",
  loadFailed: "Could not reach the station directory",
  retry: "Try again",

  tabIndia: "India",
  tabInternational: "International",
  tabFavorites: "Favorites",
  browse: "Browse",
  stationsCount: "{count} stations",
  stationsCountOne: "{count} station",
  noFavorites: "No favorites yet",
  noFavoritesHint: "Tap the heart on any station to keep it here.",

  play: "Play",
  pause: "Pause",
  stop: "Stop",
  volume: "Volume",
  nowPlaying: "Now playing",
  nothingPlaying: "Nothing playing",
  buffering: "Connecting…",
  streamFailed: "This station is not responding",
  addFavorite: "Add to favorites",
  removeFavorite: "Remove from favorites",

  micIdle: "Click to speak",
  micListening: "Listening…",
  micThinking: "One moment…",
  micUnsupported: "Voice is not supported in this browser",
  micDenied: "Microphone access was refused",
  micHeard: "You said",

  language: "Language",

  groupCollections: "Collections",
  groupLanguages: "Languages",
  groupMoods: "Moods",
  groupSingers: "Singers",
  collAll: "All",
  hiddenCount: "{count} not-working stations hidden",

  onAir: "On air",
  standby: "Standby",
  pickAStation: "Pick a station to begin",
  previousStation: "Previous station",
  nextStation: "Next station",
  viewAll: "View all {count}",
  filterCollections: "Filter collections",
  close: "Close",
  groupGenres: "Genres",
  groupKinds: "Kinds",
  groupRegions: "Regions",

  nowPlayingTrack: "Now playing",

};

const hi = {
  appName: "SV Radio",
  tagline: "भारत और दुनिया भर के लाइव स्टेशन",

  searchPlaceholder: "स्टेशन, शहर या शैली खोजें…",
  searching: "खोज रहे हैं…",
  noResults: "कोई स्टेशन नहीं मिला",
  noResultsHint: "कोई दूसरा नाम, शहर या शैली आज़माएँ।",
  loading: "स्टेशन लोड हो रहे हैं…",
  loadFailed: "स्टेशन निर्देशिका तक नहीं पहुँच सके",
  retry: "फिर कोशिश करें",

  tabIndia: "भारत",
  tabInternational: "अंतरराष्ट्रीय",
  tabFavorites: "पसंदीदा",
  browse: "ब्राउज़ करें",
  stationsCount: "{count} स्टेशन",
  stationsCountOne: "{count} स्टेशन",
  noFavorites: "अभी कोई पसंदीदा नहीं",
  noFavoritesHint: "किसी भी स्टेशन पर दिल दबाएँ।",

  play: "चलाएँ",
  pause: "रोकें",
  stop: "बंद करें",
  volume: "आवाज़",
  nowPlaying: "अभी चल रहा है",
  nothingPlaying: "कुछ नहीं चल रहा",
  buffering: "जुड़ रहे हैं…",
  streamFailed: "यह स्टेशन जवाब नहीं दे रहा",
  addFavorite: "पसंदीदा में जोड़ें",
  removeFavorite: "पसंदीदा से हटाएँ",

  micIdle: "बोलने के लिए दबाएँ",
  micListening: "सुन रहे हैं…",
  micThinking: "एक पल…",
  micUnsupported: "इस ब्राउज़र में आवाज़ समर्थित नहीं है",
  micDenied: "माइक्रोफ़ोन की अनुमति नहीं मिली",
  micHeard: "आपने कहा",

  language: "भाषा",

  groupCollections: "संग्रह",
  groupLanguages: "भाषाएँ",
  groupMoods: "मिज़ाज",
  groupSingers: "गायक",
  collAll: "सभी",
  hiddenCount: "{count} काम न करने वाले स्टेशन छिपाए गए",

  onAir: "प्रसारण जारी",
  standby: "तैयार",
  pickAStation: "शुरू करने के लिए स्टेशन चुनें",
  previousStation: "पिछला स्टेशन",
  nextStation: "अगला स्टेशन",
  viewAll: "सभी {count} देखें",
  filterCollections: "संग्रह खोजें",
  close: "बंद करें",
  groupGenres: "शैलियाँ",
  groupKinds: "प्रकार",
  groupRegions: "क्षेत्र",

  nowPlayingTrack: "अभी बज रहा है",

};

const te = {
  appName: "SV Radio",
  tagline: "భారతదేశం మరియు ప్రపంచం నుండి లైవ్ స్టేషన్లు",

  searchPlaceholder: "స్టేషన్, నగరం లేదా శైలిని వెతకండి…",
  searching: "వెతుకుతున్నాం…",
  noResults: "స్టేషన్లు దొరకలేదు",
  noResultsHint: "వేరే పేరు, నగరం లేదా శైలిని ప్రయత్నించండి.",
  loading: "స్టేషన్లు లోడ్ అవుతున్నాయి…",
  loadFailed: "స్టేషన్ డైరెక్టరీకి చేరలేకపోయాం",
  retry: "మళ్ళీ ప్రయత్నించండి",

  tabIndia: "భారతదేశం",
  tabInternational: "అంతర్జాతీయం",
  tabFavorites: "ఇష్టమైనవి",
  browse: "బ్రౌజ్ చేయండి",
  stationsCount: "{count} స్టేషన్లు",
  stationsCountOne: "{count} స్టేషన్",
  noFavorites: "ఇంకా ఇష్టమైనవి లేవు",
  noFavoritesHint: "ఏ స్టేషన్ మీదైనా హృదయం నొక్కండి.",

  play: "ప్లే",
  pause: "ఆపు",
  stop: "ఆపివేయి",
  volume: "శబ్దం",
  nowPlaying: "ఇప్పుడు వస్తోంది",
  nothingPlaying: "ఏమీ ప్లే కావడం లేదు",
  buffering: "కనెక్ట్ అవుతోంది…",
  streamFailed: "ఈ స్టేషన్ స్పందించడం లేదు",
  addFavorite: "ఇష్టమైనవాటిలో చేర్చు",
  removeFavorite: "ఇష్టమైనవాటి నుండి తీసివేయి",

  micIdle: "మాట్లాడటానికి నొక్కండి",
  micListening: "వింటున్నాం…",
  micThinking: "ఒక క్షణం…",
  micUnsupported: "ఈ బ్రౌజర్‌లో వాయిస్ పని చేయదు",
  micDenied: "మైక్రోఫోన్ అనుమతి రాలేదు",
  micHeard: "మీరు అన్నారు",

  language: "భాష",

  groupCollections: "సేకరణలు",
  groupLanguages: "భాషలు",
  groupMoods: "మూడ్స్",
  groupSingers: "గాయకులు",
  collAll: "అన్నీ",
  hiddenCount: "{count} పని చేయని స్టేషన్లు దాచాం",

  onAir: "ప్రసారంలో",
  standby: "సిద్ధం",
  pickAStation: "ప్రారంభించడానికి స్టేషన్ ఎంచుకోండి",
  previousStation: "మునుపటి స్టేషన్",
  nextStation: "తదుపరి స్టేషన్",
  viewAll: "అన్నీ {count} చూడండి",
  filterCollections: "సేకరణలు వెతకండి",
  close: "మూసివేయి",
  groupGenres: "శైలులు",
  groupKinds: "రకాలు",
  groupRegions: "ప్రాంతాలు",

  nowPlayingTrack: "ఇప్పుడు వస్తోంది",

};

const ta = {
  appName: "SV Radio",
  tagline: "இந்தியா மற்றும் உலகெங்கிலும் உள்ள நேரலை நிலையங்கள்",

  searchPlaceholder: "நிலையம், நகரம் அல்லது வகையைத் தேடுங்கள்…",
  searching: "தேடுகிறது…",
  noResults: "நிலையங்கள் எதுவும் இல்லை",
  noResultsHint: "வேறு பெயர், நகரம் அல்லது வகையை முயற்சிக்கவும்.",
  loading: "நிலையங்கள் ஏற்றப்படுகின்றன…",
  loadFailed: "நிலைய அடைவை அணுக முடியவில்லை",
  retry: "மீண்டும் முயற்சிக்கவும்",

  tabIndia: "இந்தியா",
  tabInternational: "சர்வதேசம்",
  tabFavorites: "பிடித்தவை",
  browse: "உலாவுக",
  stationsCount: "{count} நிலையங்கள்",
  stationsCountOne: "{count} நிலையம்",
  noFavorites: "இன்னும் பிடித்தவை இல்லை",
  noFavoritesHint: "எந்த நிலையத்திலும் இதயத்தை அழுத்தவும்.",

  play: "இயக்கு",
  pause: "இடைநிறுத்து",
  stop: "நிறுத்து",
  volume: "ஒலி",
  nowPlaying: "இப்போது ஒலிப்பது",
  nothingPlaying: "எதுவும் ஒலிக்கவில்லை",
  buffering: "இணைக்கிறது…",
  streamFailed: "இந்த நிலையம் பதிலளிக்கவில்லை",
  addFavorite: "பிடித்தவையில் சேர்",
  removeFavorite: "பிடித்தவையிலிருந்து நீக்கு",

  micIdle: "பேச அழுத்தவும்",
  micListening: "கேட்கிறது…",
  micThinking: "ஒரு நிமிடம்…",
  micUnsupported: "இந்த உலாவியில் குரல் ஆதரிக்கப்படவில்லை",
  micDenied: "ஒலிவாங்கி அனுமதி மறுக்கப்பட்டது",
  micHeard: "நீங்கள் சொன்னது",

  language: "மொழி",

  groupCollections: "தொகுப்புகள்",
  groupLanguages: "மொழிகள்",
  groupMoods: "மனநிலை",
  groupSingers: "பாடகர்கள்",
  collAll: "அனைத்தும்",
  hiddenCount: "{count} இயங்காத நிலையங்கள் மறைக்கப்பட்டன",

  onAir: "ஒளிபரப்பில்",
  standby: "தயார்",
  pickAStation: "தொடங்க ஒரு நிலையத்தைத் தேர்ந்தெடுக்கவும்",
  previousStation: "முந்தைய நிலையம்",
  nextStation: "அடுத்த நிலையம்",
  viewAll: "அனைத்தும் {count} பார்க்க",
  filterCollections: "தொகுப்புகளைத் தேடு",
  close: "மூடு",
  groupGenres: "வகைகள்",
  groupKinds: "வடிவங்கள்",
  groupRegions: "பகுதிகள்",

  nowPlayingTrack: "இப்போது ஒலிப்பது",

};

const es = {
  appName: "SV Radio",
  tagline: "Emisoras en directo de India y del mundo",

  searchPlaceholder: "Busca emisoras, ciudades o géneros…",
  searching: "Buscando…",
  noResults: "No se encontraron emisoras",
  noResultsHint: "Prueba con otro nombre, ciudad o género.",
  loading: "Cargando emisoras…",
  loadFailed: "No se pudo acceder al directorio de emisoras",
  retry: "Reintentar",

  tabIndia: "India",
  tabInternational: "Internacional",
  tabFavorites: "Favoritas",
  browse: "Explorar",
  stationsCount: "{count} emisoras",
  stationsCountOne: "{count} emisora",
  noFavorites: "Aún no hay favoritas",
  noFavoritesHint: "Pulsa el corazón en cualquier emisora.",

  play: "Reproducir",
  pause: "Pausa",
  stop: "Detener",
  volume: "Volumen",
  nowPlaying: "Sonando ahora",
  nothingPlaying: "Nada sonando",
  buffering: "Conectando…",
  streamFailed: "Esta emisora no responde",
  addFavorite: "Añadir a favoritas",
  removeFavorite: "Quitar de favoritas",

  micIdle: "Pulsa para hablar",
  micListening: "Escuchando…",
  micThinking: "Un momento…",
  micUnsupported: "La voz no funciona en este navegador",
  micDenied: "Se denegó el acceso al micrófono",
  micHeard: "Has dicho",

  language: "Idioma",

  groupCollections: "Colecciones",
  groupLanguages: "Idiomas",
  groupMoods: "Ambientes",
  groupSingers: "Cantantes",
  collAll: "Todas",
  hiddenCount: "{count} emisoras que no funcionan ocultas",

  onAir: "En directo",
  standby: "En espera",
  pickAStation: "Elige una emisora para empezar",
  previousStation: "Emisora anterior",
  nextStation: "Emisora siguiente",
  viewAll: "Ver las {count}",
  filterCollections: "Filtrar colecciones",
  close: "Cerrar",
  groupGenres: "Géneros",
  groupKinds: "Tipos",
  groupRegions: "Regiones",

  nowPlayingTrack: "Sonando ahora",

};

const fr = {
  appName: "SV Radio",
  tagline: "Stations en direct d'Inde et du monde",

  searchPlaceholder: "Rechercher une station, une ville, un genre…",
  searching: "Recherche…",
  noResults: "Aucune station trouvée",
  noResultsHint: "Essayez un autre nom, une autre ville ou un autre genre.",
  loading: "Chargement des stations…",
  loadFailed: "Impossible de joindre l'annuaire des stations",
  retry: "Réessayer",

  tabIndia: "Inde",
  tabInternational: "International",
  tabFavorites: "Favoris",
  browse: "Parcourir",
  stationsCount: "{count} stations",
  stationsCountOne: "{count} station",
  noFavorites: "Aucun favori pour l'instant",
  noFavoritesHint: "Appuyez sur le cœur d'une station.",

  play: "Lecture",
  pause: "Pause",
  stop: "Arrêter",
  volume: "Volume",
  nowPlaying: "En cours",
  nothingPlaying: "Rien en cours",
  buffering: "Connexion…",
  streamFailed: "Cette station ne répond pas",
  addFavorite: "Ajouter aux favoris",
  removeFavorite: "Retirer des favoris",

  micIdle: "Appuyez pour parler",
  micListening: "J'écoute…",
  micThinking: "Un instant…",
  micUnsupported: "La voix n'est pas prise en charge ici",
  micDenied: "Accès au microphone refusé",
  micHeard: "Vous avez dit",

  language: "Langue",

  groupCollections: "Collections",
  groupLanguages: "Langues",
  groupMoods: "Ambiances",
  groupSingers: "Chanteurs",
  collAll: "Toutes",
  hiddenCount: "{count} stations hors service masquées",

  onAir: "À l'antenne",
  standby: "En veille",
  pickAStation: "Choisissez une station pour commencer",
  previousStation: "Station précédente",
  nextStation: "Station suivante",
  viewAll: "Voir les {count}",
  filterCollections: "Filtrer les collections",
  close: "Fermer",
  groupGenres: "Genres",
  groupKinds: "Types",
  groupRegions: "Régions",

  nowPlayingTrack: "En cours",

};

export const TRANSLATIONS = { en, hi, te, ta, es, fr };
