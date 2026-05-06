// Main Game Logic
class Game {
    constructor() {
        this.isRunning = false;
        this.currentLocation = null;
    }

    async init() {
        this.isRunning = true;
        // Alles wird durch Auth in config.js initialisiert
    }

    async loadPlayerTeam() {
        await inventory.loadPlayerTeam();
    }

    async loadInventory() {
        inventory.loadInventory();
    }

    async searchWildPokemon() {
        ui.showMessage('Suche nach Pokémon...', 'info');

        // Wähle zufällig ein Pokémon aus einer Liste
        const wildPokemons = [
            'bulbasaur', 'charmander', 'squirtle', 'pidgeot', 'raticate',
            'spearow', 'jigglypuff', 'zubat', 'oddish', 'bellsprout',
            'paras', 'venonat', 'diglett', 'meowth', 'farfetchd',
            'shellder', 'ghastly', 'haunter', 'drowzee', 'krabby'
        ];

        const randomPokemon = wildPokemons[Math.floor(Math.random() * wildPokemons.length)];
        const basePokemon = await pokemonService.getPokemon(randomPokemon);

        if (!basePokemon) {
            ui.showErrorMessage('Kein Pokémon gefunden!');
            return;
        }

        // Generiere zufälliges Wild-Pokémon
        const wildLevel = Math.floor(Math.random() * 20) + 1;
        const iv = {
            hp: Math.floor(Math.random() * 32),
            attack: Math.floor(Math.random() * 32),
            defense: Math.floor(Math.random() * 32),
            spAtk: Math.floor(Math.random() * 32),
            spDef: Math.floor(Math.random() * 32),
            speed: Math.floor(Math.random() * 32),
        };

        const stats = pokemonService.calculateStats(basePokemon, wildLevel, iv, {});

        const wildPokemon = {
            ...basePokemon,
            level: wildLevel,
            exp: 0,
            hp: stats.hp,
            maxHp: stats.hp,
            attack: stats.attack,
            defense: stats.defense,
            spAtk: stats.spAtk,
            spDef: stats.spDef,
            speed: stats.speed,
            iv: iv,
        };

        // Starte Kampf
        const playerTeam = inventory.getTeam();
        if (playerTeam.length === 0) {
            ui.showErrorMessage('Du brauchst ein Pokémon um zu kämpfen!');
            return;
        }

        ui.showSuccessMessage(`Ein wildes ${basePokemon.name} ist erschienen!`);
        await battleSystem.startBattle(playerTeam, [wildPokemon], true);
    }

    async catchPokemon(pokemonName, level = 5) {
        const success = await inventory.addPokemonToTeam(pokemonName, level);
        if (success) {
            await inventory.addToPokedex(
                (await pokemonService.getPokemon(pokemonName)).id,
                pokemonName
            );
        }
        return success;
    }

    async savePlayerProgress() {
        try {
            // Update player level and exp
            const team = inventory.getTeam();
            if (team.length > 0) {
                // Berechne durchschnittliches Level
                const avgLevel = Math.floor(team.reduce((sum, p) => sum + p.level, 0) / team.length);

                // Update in Datenbank
                for (let pokemon of team) {
                    await inventory.updateTeamPokemon(pokemon);
                }
            }
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
}

const game = new Game();

// Event Listener
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});

// Auto-save every 5 minutes
setInterval(() => {
    if (auth.getCurrentUser()) {
        game.savePlayerProgress();
    }
}, 300000);

// CSS Animation für Messages hinzufügen
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
