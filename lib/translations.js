/**
 * Every piece of text the interface says, in every language it speaks.
 *
 * One flat object per language rather than nested namespaces — the app is
 * small enough that nesting buys nothing and makes a missing key harder to
 * spot. If it grows past a couple of hundred keys, split it per file then.
 *
 * `dj` holds the Radio DJ's spoken lines. They are templates with {station}
 * and {count} placeholders, kept here with the rest of the text so adding a
 * language means touching one file and the DJ speaks it too.
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
  appName: "AI Radio",
  tagline: "Live stations, with a host who talks to you",

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

  djOn: "DJ on",
  djOff: "DJ off",
  language: "Language",

  groupCollections: "Collections",
  groupLanguages: "Languages",
  groupMoods: "Moods",
  groupSingers: "Singers",
  collAll: "All",
  hiddenCount: "{count} not-working stations hidden",
  djHelp: "The host announces each station in your language",

  dj: {
    welcome: "Welcome to AI Radio. Let's find you something to listen to.",
    intro: "You're listening to {station}. Enjoy.",
    switching: "Switching over to {station}.",
    foundResults: "I found {count} stations for that.",
    foundNothing: "I couldn't find anything for that. Try another name.",
    favorited: "Added {station} to your favorites.",
    failed: "{station} isn't responding. Let's try another one.",
  },
};

const hi = {
  appName: "एआई रेडियो",
  tagline: "लाइव स्टेशन, और आपसे बात करने वाला होस्ट",

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

  djOn: "डीजे चालू",
  djOff: "डीजे बंद",
  language: "भाषा",

  groupCollections: "संग्रह",
  groupLanguages: "भाषाएँ",
  groupMoods: "मिज़ाज",
  groupSingers: "गायक",
  collAll: "सभी",
  hiddenCount: "{count} काम न करने वाले स्टेशन छिपाए गए",
  djHelp: "होस्ट हर स्टेशन की घोषणा आपकी भाषा में करता है",

  dj: {
    welcome: "एआई रेडियो में आपका स्वागत है। चलिए आपके लिए कुछ ढूँढते हैं।",
    intro: "आप सुन रहे हैं {station}। आनंद लीजिए।",
    switching: "अब चल रहे हैं {station}।",
    foundResults: "मुझे {count} स्टेशन मिले।",
    foundNothing: "कुछ नहीं मिला। कोई दूसरा नाम आज़माइए।",
    favorited: "{station} को पसंदीदा में जोड़ दिया।",
    failed: "{station} जवाब नहीं दे रहा। दूसरा आज़माते हैं।",
  },
};

const te = {
  appName: "ఏఐ రేడియో",
  tagline: "లైవ్ స్టేషన్లు, మీతో మాట్లాడే హోస్ట్‌తో",

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

  djOn: "డీజే ఆన్",
  djOff: "డీజే ఆఫ్",
  language: "భాష",

  groupCollections: "సేకరణలు",
  groupLanguages: "భాషలు",
  groupMoods: "మూడ్స్",
  groupSingers: "గాయకులు",
  collAll: "అన్నీ",
  hiddenCount: "{count} పని చేయని స్టేషన్లు దాచాం",
  djHelp: "హోస్ట్ ప్రతి స్టేషన్‌ను మీ భాషలో ప్రకటిస్తారు",

  dj: {
    welcome: "ఏఐ రేడియోకి స్వాగతం. మీకోసం ఏదైనా వెతుకుదాం.",
    intro: "మీరు వింటున్నది {station}. ఆనందించండి.",
    switching: "ఇప్పుడు {station}కి మారుతున్నాం.",
    foundResults: "{count} స్టేషన్లు దొరికాయి.",
    foundNothing: "ఏమీ దొరకలేదు. వేరే పేరు ప్రయత్నించండి.",
    favorited: "{station} ఇష్టమైనవాటిలో చేర్చాం.",
    failed: "{station} స్పందించడం లేదు. వేరేది ప్రయత్నిద్దాం.",
  },
};

const ta = {
  appName: "ஏஐ ரேடியோ",
  tagline: "நேரலை நிலையங்கள், உங்களுடன் பேசும் தொகுப்பாளருடன்",

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

  djOn: "டிஜே இயக்கம்",
  djOff: "டிஜே நிறுத்தம்",
  language: "மொழி",

  groupCollections: "தொகுப்புகள்",
  groupLanguages: "மொழிகள்",
  groupMoods: "மனநிலை",
  groupSingers: "பாடகர்கள்",
  collAll: "அனைத்தும்",
  hiddenCount: "{count} இயங்காத நிலையங்கள் மறைக்கப்பட்டன",
  djHelp: "தொகுப்பாளர் ஒவ்வொரு நிலையத்தையும் உங்கள் மொழியில் அறிவிப்பார்",

  dj: {
    welcome: "ஏஐ ரேடியோவுக்கு வரவேற்கிறோம். உங்களுக்கு ஏதாவது தேடுவோம்.",
    intro: "நீங்கள் கேட்பது {station}. அனுபவியுங்கள்.",
    switching: "இப்போது {station}க்கு மாறுகிறோம்.",
    foundResults: "{count} நிலையங்கள் கிடைத்தன.",
    foundNothing: "எதுவும் கிடைக்கவில்லை. வேறு பெயரை முயற்சிக்கவும்.",
    favorited: "{station} பிடித்தவையில் சேர்க்கப்பட்டது.",
    failed: "{station} பதிலளிக்கவில்லை. வேறொன்றை முயற்சிப்போம்.",
  },
};

const es = {
  appName: "Radio IA",
  tagline: "Emisoras en directo, con un locutor que te habla",

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

  djOn: "DJ activado",
  djOff: "DJ desactivado",
  language: "Idioma",

  groupCollections: "Colecciones",
  groupLanguages: "Idiomas",
  groupMoods: "Ambientes",
  groupSingers: "Cantantes",
  collAll: "Todas",
  hiddenCount: "{count} emisoras que no funcionan ocultas",
  djHelp: "El locutor anuncia cada emisora en tu idioma",

  dj: {
    welcome: "Bienvenido a Radio IA. Vamos a buscarte algo para escuchar.",
    intro: "Estás escuchando {station}. Que lo disfrutes.",
    switching: "Cambiando a {station}.",
    foundResults: "He encontrado {count} emisoras.",
    foundNothing: "No he encontrado nada. Prueba con otro nombre.",
    favorited: "{station} añadida a tus favoritas.",
    failed: "{station} no responde. Probemos otra.",
  },
};

const fr = {
  appName: "Radio IA",
  tagline: "Stations en direct, avec un animateur qui vous parle",

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

  djOn: "DJ activé",
  djOff: "DJ désactivé",
  language: "Langue",

  groupCollections: "Collections",
  groupLanguages: "Langues",
  groupMoods: "Ambiances",
  groupSingers: "Chanteurs",
  collAll: "Toutes",
  hiddenCount: "{count} stations hors service masquées",
  djHelp: "L'animateur annonce chaque station dans votre langue",

  dj: {
    welcome: "Bienvenue sur Radio IA. Trouvons-vous quelque chose à écouter.",
    intro: "Vous écoutez {station}. Bonne écoute.",
    switching: "On passe à {station}.",
    foundResults: "J'ai trouvé {count} stations.",
    foundNothing: "Je n'ai rien trouvé. Essayez un autre nom.",
    favorited: "{station} ajoutée à vos favoris.",
    failed: "{station} ne répond pas. Essayons-en une autre.",
  },
};

export const TRANSLATIONS = { en, hi, te, ta, es, fr };
