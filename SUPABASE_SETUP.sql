-- ===== SUPABASE POKEMON GAME DATABASE SCHEMA =====
-- Führe diese SQL-Befehle in deiner Supabase Console aus
-- https://app.supabase.com → SQL Editor

-- 1. Players Table
CREATE TABLE players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  pokeballs INT DEFAULT 20,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Player Pokemon Table
CREATE TABLE player_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  pokemon_name VARCHAR(50) NOT NULL,
  pokemon_id INT NOT NULL,
  level INT DEFAULT 5,
  exp INT DEFAULT 0,
  current_hp INT NOT NULL,
  max_hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  sp_atk INT NOT NULL,
  sp_def INT NOT NULL,
  speed INT NOT NULL,
  iv_values JSONB DEFAULT '{}', -- Individual Values
  ev_values JSONB DEFAULT '{}', -- Effort Values
  caught_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Pokedex Entries Table
CREATE TABLE pokedex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL,
  pokemon_name VARCHAR(50) NOT NULL,
  first_caught_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, pokemon_id)
);

-- 4. Battle Logs Table
CREATE TABLE battle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  opponent VARCHAR(100), -- 'wild' oder trainer name
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  xp_gained INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Inventory Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  pokeballs INT DEFAULT 20,
  greatballs INT DEFAULT 0,
  ultraballs INT DEFAULT 0,
  masterball INT DEFAULT 0,
  potions INT DEFAULT 10,
  super_potions INT DEFAULT 0,
  hyper_potions INT DEFAULT 0,
  max_potions INT DEFAULT 0,
  antidotes INT DEFAULT 0,
  awakenings INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Trainers (Optional - für Trainer-Kämpfe)
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  level INT DEFAULT 1,
  badge_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDEXES (für Performance) =====
CREATE INDEX idx_player_pokemon_player_id ON player_pokemon(player_id);
CREATE INDEX idx_pokedex_player_id ON pokedex_entries(player_id);
CREATE INDEX idx_battle_logs_player_id ON battle_logs(player_id);
CREATE INDEX idx_achievements_player_id ON achievements(player_id);

-- ===== ENABLE RLS (Row Level Security) =====
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokedex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====
-- Players können nur ihre eigenen Daten sehen
CREATE POLICY "Players can view their own data"
  ON players FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  USING (auth.uid() = id);

-- Player Pokemon Policies
CREATE POLICY "Players can view their own pokemon"
  ON player_pokemon FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert their own pokemon"
  ON player_pokemon FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update their own pokemon"
  ON player_pokemon FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Players can delete their own pokemon"
  ON player_pokemon FOR DELETE
  USING (auth.uid() = player_id);

-- Ähnliche Policies für andere Tabellen...
CREATE POLICY "Players can view their pokedex"
  ON pokedex_entries FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert pokedex entries"
  ON pokedex_entries FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can view their battle logs"
  ON battle_logs FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert battle logs"
  ON battle_logs FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can view their inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Players can update their inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = player_id);
