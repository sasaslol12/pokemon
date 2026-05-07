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
        { name: 'bulbasaur', gen: 1 },
        { name: 'charmander', gen: 1 },
        { name: 'squirtle', gen: 1 },
        // Gen 2
        { name: 'chikorita', gen: 2 },
        { name: 'cyndaquil', gen: 2 },
        { name: 'totodile', gen: 2 },
        // Gen 3
        { name: 'treecko', gen: 3 },
        { name: 'torchic', gen: 3 },
        { name: 'mudkip', gen: 3 },
        // Gen 4
        { name: 'turtwig', gen: 4 },
        { name: 'chimchar', gen: 4 },
        { name: 'piplup', gen: 4 },
        // Gen 5
        { name: 'snivy', gen: 5 },
        { name: 'tepig', gen: 5 },
        { name: 'oshawott', gen: 5 },
    ],
    STARTER_LEVEL: 5,
    MAX_POKEMON_IN_TEAM: 6,
    MAX_LEVEL: 100,
    XP_PER_LEVEL: 1000,
    BASE_CATCH_RATE: 0.3,
};

// Lokale Speicherung für Offline-Modus
const STORAGE_KEYS = {
    PLAYER_DATA: 'pkmn_player_data',
    TEAM: 'pkmn_team',
    INVENTORY: 'pkmn_inventory',
    SETTINGS: 'pkmn_settings',
};
