// Supabase Configuration
// WICHTIG: Ersetze diese mit deinen echten Supabase-Credentials
const SUPABASE_URL = 'https://vcpmztnbklgezqrxhyqt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcG16dG5ia2xnZXpxcnhoeXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzUwOTIsImV4cCI6MjA5MzY1MTA5Mn0.XuLJzg7gG4aLz3wMZJjb1tzt9G66PUnB5UEINfTfQxQ';

// Supabase Client - initialisiert von der window.supabase Library
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// API Configuration
const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// Game Constants
const GAME_CONFIG = {
    STARTER_POKEMON: [
        // Gen 1
        { name: 'bisakupper', englishName: 'bulbasaur', gen: 1 },
        { name: 'glumanda', englishName: 'charmander', gen: 1 },
        { name: 'schiggy', englishName: 'squirtle', gen: 1 },
        // Gen 2
        { name: 'endivie', englishName: 'chikorita', gen: 2 },
        { name: 'feurigel', englishName: 'cyndaquil', gen: 2 },
        { name: 'karnimani', englishName: 'totodile', gen: 2 },
        // Gen 3
        { name: 'geckarbor', englishName: 'treecko', gen: 3 },
        { name: 'flemmli', englishName: 'torchic', gen: 3 },
        { name: 'hydropi', englishName: 'mudkip', gen: 3 },
        // Gen 4
        { name: 'bisaknosp', englishName: 'turtwig', gen: 4 },
        { name: 'panflor', englishName: 'chimchar', gen: 4 },
        { name: 'plinfa', englishName: 'piplup', gen: 4 },
        // Gen 5
        { name: 'serpifeu', englishName: 'snivy', gen: 5 },
        { name: 'ferkokel', englishName: 'tepig', gen: 5 },
        { name: 'fiffyen', englishName: 'oshawott', gen: 5 },
    ],
    STARTER_LEVEL: 5,
    MAX_POKEMON_IN_TEAM: 6,
    MAX_LEVEL: 100,
    XP_PER_LEVEL: 1000,
    BASE_CATCH_RATE: 0.3,
};

// Deutsche Pokémon-Namen Übersetzung
const POKEMON_NAMES_DE = {
    'bulbasaur': 'Bisakupper',
    'ivysaur': 'Bisaknosp',
    'venusaur': 'Bisakutox',
    'charmander': 'Glumanda',
    'charmeleon': 'Charmelion',
    'charizard': 'Glurak',
    'squirtle': 'Schiggy',
    'wartortle': 'Schillok',
    'blastoise': 'Turtok',
    'chikorita': 'Endivie',
    'bayleef': 'Phiole',
    'meganium': 'Meganie',
    'cyndaquil': 'Feurigel',
    'quilava': 'Feuerleo',
    'typhlosion': 'Lohgock',
    'totodile': 'Karnimani',
    'croconaw': 'Karnacho',
    'feraligatr': 'Garados',
    'treecko': 'Geckarbor',
    'grovyle': 'Reptain',
    'sceptile': 'Skaraborn',
    'torchic': 'Flemmli',
    'combusken': 'Jungglut',
    'blaziken': 'Lohktos',
    'mudkip': 'Hydropi',
    'marshtomp': 'Sumpex',
    'swampert': 'Moorabbel',
    'turtwig': 'Bisaknosp',
    'grotle': 'Bisaknosp',
    'torterra': 'Bisakutox',
    'chimchar': 'Panflor',
    'monferno': 'Panferno',
    'infernape': 'Panflora',
    'piplup': 'Plinfa',
    'prinplup': 'Pliprin',
    'empoleon': 'Plipara',
    'snivy': 'Serpifeu',
    'servine': 'Serperior',
    'serperior': 'Serperior',
    'tepig': 'Ferkokel',
    'pignite': 'Ferkokel',
    'emboar': 'Flammo',
    'oshawott': 'Fiffyen',
    'dewott': 'Fiffzebub',
    'samurott': 'Samurott',
};

// Deutsche Move-Namen Übersetzung
const MOVE_NAMES_DE = {
    'vine-whip': 'Rankengewalt',
    'powder-snow': 'Pulverwind',
    'scratch': 'Kratzer',
    'ember': 'Glut',
    'water-gun': 'Wasserfontäne',
    'swordsdance': 'Schwerttanz',
    'cut': 'Schnitt',
    'bind': 'Bindung',
    'pound': 'Doppelschlag',
    'double-edge': 'Doppelkante',
};

// Deutsche Typ-Namen
const TYPE_NAMES_DE = {
    'normal': 'Normal',
    'fire': 'Feuer',
    'water': 'Wasser',
    'grass': 'Pflanze',
    'electric': 'Elektro',
    'ice': 'Eis',
    'fighting': 'Kampf',
    'poison': 'Gift',
    'ground': 'Boden',
    'flying': 'Flug',
    'psychic': 'Psycho',
    'bug': 'Käfer',
    'rock': 'Gestein',
    'ghost': 'Geist',
    'dragon': 'Drache',
    'dark': 'Unlicht',
    'steel': 'Stahl',
    'fairy': 'Fee',
};

// Lokale Speicherung für Offline-Modus
const STORAGE_KEYS = {
    PLAYER_DATA: 'pkmn_player_data',
    TEAM: 'pkmn_team',
    INVENTORY: 'pkmn_inventory',
    SETTINGS: 'pkmn_settings',
};
