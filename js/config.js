// Supabase Configuration
// WICHTIG: Ersetze diese mit deinen echten Supabase-Credentials
const SUPABASE_URL = 'https://vcpmztnbklgezqrxhyqt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcG16dG5ia2xnZXpxcnhoeXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzUwOTIsImV4cCI6MjA5MzY1MTA5Mn0.XuLJzg7gG4aLz3wMZJjb1tzt9G66PUnB5UEINfTfQxQ';

// Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// API Configuration
const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// Game Constants
const GAME_CONFIG = {
    STARTING_POKEMON: ['bulbasaur', 'charmander', 'squirtle'],
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
