# 🎮 Pokémon Browser Game

Ein vollständiges Browser-basiertes Pokémon-Spiel mit echten Pokémon-Daten, Kämpfe, Leveling und Account-System über Supabase.

## ✨ Features

- **Authentifizierung**: Login/Signup mit Supabase Auth
- **Pokémon Sammlung**: Finde und fange Pokémon mit realen Stats
- **Kämpfe**: Real-time Kämpfe gegen wilde Pokémon
- **Leveling System**: Pokémon leveln und Stats erhöhen
- **Team Management**: Verwalte ein Team von bis zu 6 Pokémon
- **Pokédex**: Dokumentiere deine gefangenen Pokémon
- **Cross-Device**: Account-System mit Supabase für nahtlose Multi-Device-Nutzung
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Mobile

## 🚀 Quick Start

### 1. **Supabase Setup**

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Gehe zu "SQL Editor" und kopiere/paste den Inhalt von `SUPABASE_SETUP.sql`
4. Führe alle SQL-Befehle aus
5. Gehe zu "Settings" → "API" und kopiere:
   - **Project URL** (als `SUPABASE_URL`)
   - **Anon Key** (als `SUPABASE_KEY`)

### 2. **Konfiguration**

Öffne `js/config.js` und ersetze:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

Mit deinen echten Werten aus Supabase.

### 3. **Starten**

Öffne einfach `index.html` in deinem Browser oder nutze einen lokalen Server:

```bash
# Mit Python 3
python -m http.server 8000

# Mit Node.js (http-server installieren)
npx http-server
```

Dann öffne: `http://localhost:8000`

## 📁 Projektstruktur

```
pkmn/
├── index.html              # Hauptseite
├── styles.css              # Styling
├── SUPABASE_SETUP.sql      # Datenbank-Schema
├── README.md               # Diese Datei
└── js/
    ├── config.js           # Supabase & Konstanten
    ├── auth.js             # Authentifizierung
    ├── pokemon.js          # Pokemon API Integration
    ├── battle.js           # Kämpf-System
    ├── inventory.js        # Pokemon Team & Inventory
    ├── ui.js               # UI Management
    └── game.js             # Hauptspiel-Logik
```

## 🎮 Spielmechaniken

### Pokémon fangen
1. Gehe zu "Erkunden" → "Wildnis durchsuchen"
2. Du kämpfst gegen ein wildes Pokémon
3. Reduziere die HP und nutze Pokébälle zum Fangen

### Kämpfe
- Wähle einen Move deines Pokémon
- Der Gegner antwortet automatisch
- Überwinde die Gegner-HP auf 0 um zu gewinnen

### Leveling
- Pokémon erhalten XP nach Kämpfen
- Bei genug XP levelst du auf und Stats erhöhen sich
- Level-Up basiert auf echtem Pokémon Level-System

### Team Management
- Fange bis zu 6 Pokémon
- Verwalte dein Team im "Mein Team" Tab
- Sehe alle Stats und HP-Status

## 🔧 Erweiterungen

### Trainer-Kämpfe
Implementiert durch `trainers` Tabelle - Füge NPC-Trainer mit Teams hinzu

### Items
- Pokébälle verschiedener Typen
- Heiltränke für HP-Recovery
- Status-Heiler

### Shiny Pokémon
Füge eine 1/4096 Chance für Shiny-Varianten hinzu

### Quests/Story
Zeitbasierte Quests mit Rewards

### Multi-Player
Nutze Supabase Realtime für Live-Multiplayer-Kämpfe

## 🔑 API Integration

Das Spiel nutzt:
- **[Pokémon API](https://pokeapi.co/)** - Echte Pokémon-Daten (kostenlos, keine Auth nötig)
- **[Supabase](https://supabase.com)** - Database & Authentication

## 📊 Datenbank-Schema

### Wichtige Tabellen:
- `players` - Spieler-Profil
- `player_pokemon` - Pokémon im Team
- `pokedex_entries` - Gefangene Pokémon
- `battle_logs` - Kampf-Statistiken
- `inventory` - Items

Siehe `SUPABASE_SETUP.sql` für vollständiges Schema.

## 🐛 Debugging

### Browser Console
Drücke `F12` im Browser und gehe zum "Console" Tab um Fehler zu sehen

### Common Issues:

**"Supabase URL/Key not found"**
→ Überprüfe `js/config.js` - Credentials eintragen

**"Pokemon API Fehler"**
→ Überprüfe Internet-Verbindung und pokeapi.co Verfügbarkeit

**"Auth nicht funktioniert"**
→ Überprüfe Supabase Auth-Settings

## 📱 Browser-Support

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 🔒 Sicherheit

- **RLS (Row Level Security)** - Spieler sehen nur ihre Daten
- **Auth.js** - Alle Requests authentifiziert
- **.env.local** - (Zukünftig) für Secrets

## 📈 Performance-Tipps

1. Pokemon werden gecacht
2. Daten lokal gespeichert (localStorage)
3. Auto-save alle 5 Minuten
4. Lazy-loading von Pokemon-Details

## 🎨 Styling

- **Farben**: Lila (`#667eea`), Rosa (`#764ba2`)
- **Font**: Segoe UI / System Default
- **Responsive**: Mobile-first Design

## 🤝 Beitragen

Dieses Projekt ist für private Nutzung. Für Verbesserungen:
1. Fork das Projekt
2. Erstelle einen Branch
3. Mache deine Änderungen
4. Sende einen Pull Request

## 📝 Lizenz

Dieses Projekt nutzt:
- Pokémon-Daten von [PokeAPI](https://pokeapi.co/) (unter CC0-Lizenz)
- Supabase (kostenlos mit 50,000 Requests/Monat)

Pokémon ist ein Trademark von Nintendo/The Pokémon Company.

## 🚀 Nächste Schritte

1. ✅ Projektstruktur erstellt
2. ✅ Authentication integriert
3. ✅ Battle-System implementiert
4. ⏳ Weitere Features:
   - [ ] Trainer-Kämpfe
   - [ ] Global Leaderboard
   - [ ] Trade-System
   - [ ] Items in Kämpfen nutzen
   - [ ] Pokémon-Evolutionen

## 💬 Kontakt & Support

Dokumentation: Siehe Code-Kommentare
API Reference: https://pokeapi.co/docs/v2

---

**Happy Gaming! 🎮⚡**
