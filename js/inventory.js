// Inventory & Pokemon Collection
class Inventory {
    constructor() {
        this.inventory = {
            pokeballs: 20,
            greatballs: 0,
            ultraballs: 0,
            potions: 10,
            super_potions: 0,
            antidotes: 0,
        };
        this.playerTeam = [];
        this.activeTeam = [null, null, null, null, null, null]; // 6 Slots für Kampf-Team
        this.pokedex = [];
    }

    async loadPlayerTeam() {
        try {
            const { data, error } = await sbClient
                .from('player_pokemon')
                .select('*')
                .eq('player_id', auth.getCurrentUser().id);

            if (error) throw error;

            this.playerTeam = [];
            for (let pokemonData of data || []) {
                const basePokemon = await pokemonService.getPokemon(pokemonData.pokemon_name);
                const pokemon = {
                    id: pokemonData.id,
                    ...basePokemon,
                    level: pokemonData.level,
                    exp: pokemonData.exp,
                    hp: pokemonData.current_hp,
                    maxHp: pokemonData.max_hp,
                    attack: pokemonData.attack,
                    defense: pokemonData.defense,
                    spAtk: pokemonData.sp_atk,
                    spDef: pokemonData.sp_def,
                    speed: pokemonData.speed,
                    iv: pokemonData.iv_values || {},
                    ev: pokemonData.ev_values || {},
                    caughtAt: new Date(pokemonData.caught_at),
                };
                this.playerTeam.push(pokemon);
            }

            localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(this.playerTeam));
        } catch (error) {
            console.error('Failed to load player team:', error);
        }
    }

    async addPokemonToTeam(pokemonName, level = 5) {
        if (this.playerTeam.length >= GAME_CONFIG.MAX_POKEMON_IN_TEAM) {
            ui.showErrorMessage('Dein Team ist voll!');
            return false;
        }

        try {
            const basePokemon = await pokemonService.getPokemon(pokemonName);

            // Generiere IVs (zufällig zwischen 0-31)
            const iv = {
                hp: Math.floor(Math.random() * 32),
                attack: Math.floor(Math.random() * 32),
                defense: Math.floor(Math.random() * 32),
                spAtk: Math.floor(Math.random() * 32),
                spDef: Math.floor(Math.random() * 32),
                speed: Math.floor(Math.random() * 32),
            };

            const stats = pokemonService.calculateStats(basePokemon, level, iv, {});

            const { data, error } = await sbClient
                .from('player_pokemon')
                .insert({
                    player_id: auth.getCurrentUser().id,
                    pokemon_name: pokemonName,
                    pokemon_id: basePokemon.id,
                    level: level,
                    exp: 0,
                    current_hp: stats.hp,
                    max_hp: stats.hp,
                    attack: stats.attack,
                    defense: stats.defense,
                    sp_atk: stats.spAtk,
                    sp_def: stats.spDef,
                    speed: stats.speed,
                    iv_values: iv,
                    caught_at: new Date(),
                })
                .select();

            if (error) throw error;

            const newPokemon = {
                id: data[0].id,
                ...basePokemon,
                level: level,
                exp: 0,
                hp: stats.hp,
                maxHp: stats.hp,
                attack: stats.attack,
                defense: stats.defense,
                spAtk: stats.spAtk,
                spDef: stats.spDef,
                speed: stats.speed,
                iv: iv,
                caughtAt: new Date(),
            };

            this.playerTeam.push(newPokemon);
            localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(this.playerTeam));

            ui.showSuccessMessage(`${pokemonName} wurde deinem Team hinzugefügt!`);
            return true;
        } catch (error) {
            console.error('Failed to add pokemon to team:', error);
            ui.showErrorMessage('Fehler beim Hinzufügen von Pokémon');
            return false;
        }
    }

    async updateTeamPokemon(pokemon) {
        try {
            await sbClient
                .from('player_pokemon')
                .update({
                    level: pokemon.level,
                    exp: pokemon.exp,
                    current_hp: pokemon.hp,
                    max_hp: pokemon.maxHp,
                    attack: pokemon.attack,
                    defense: pokemon.defense,
                    sp_atk: pokemon.spAtk,
                    sp_def: pokemon.spDef,
                    speed: pokemon.speed,
                })
                .eq('id', pokemon.id);
        } catch (error) {
            console.error('Failed to update pokemon:', error);
        }
    }

    addItem(itemName, quantity = 1) {
        if (this.inventory[itemName]) {
            this.inventory[itemName] += quantity;
        } else {
            this.inventory[itemName] = quantity;
        }
        this.saveInventory();
    }

    useItem(itemName) {
        if (this.inventory[itemName] && this.inventory[itemName] > 0) {
            this.inventory[itemName]--;
            this.saveInventory();
            return true;
        }
        return false;
    }

    getTeam() {
        return this.playerTeam;
    }

    getInventory() {
        return this.inventory;
    }

    saveInventory() {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory));
    }

    loadInventory() {
        const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        if (saved) {
            this.inventory = JSON.parse(saved);
        }
    }

    async addToPokedex(pokemonId, pokemonName) {
        try {
            const exists = this.pokedex.find(p => p.id === pokemonId);
            if (!exists) {
                this.pokedex.push({ id: pokemonId, name: pokemonName, caughtAt: new Date() });

                await sbClient
                    .from('pokedex_entries')
                    .insert({
                        player_id: auth.getCurrentUser().id,
                        pokemon_id: pokemonId,
                        pokemon_name: pokemonName,
                    })
                    .select();
            }
        } catch (error) {
            console.error('Failed to add to pokedex:', error);
        }
    }
}

const inventory = new Inventory();
