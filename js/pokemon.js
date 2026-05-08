// Pokemon Data & API Integration
class PokemonService {
    constructor() {
        this.pokemonCache = {};
        this.typesCache = {};
    }

    async getPokemon(nameOrId) {
        // Check Cache
        if (this.pokemonCache[nameOrId]) {
            return this.pokemonCache[nameOrId];
        }

        try {
            const response = await axios.get(`${POKEAPI_URL}/pokemon/${nameOrId}`);
            const data = response.data;

            const pokemon = {
                id: data.id,
                name: data.name,
                types: data.types.map(t => t.type.name),
                height: data.height,
                weight: data.weight,
                baseStats: {
                    hp: data.stats[0].base_stat,
                    attack: data.stats[1].base_stat,
                    defense: data.stats[2].base_stat,
                    spAtk: data.stats[3].base_stat,
                    spDef: data.stats[4].base_stat,
                    speed: data.stats[5].base_stat,
                },
                moves: data.moves.slice(0, 10).map(m => m.move.name),
                sprite: data.sprites.front_default,
                shinySprite: data.sprites.front_shiny,
                officialArt: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
            };

            // Lade Move Details
            pokemon.moveDetails = await this.getMovesDetails(pokemon.moves);

            this.pokemonCache[nameOrId] = pokemon;
            return pokemon;
        } catch (error) {
            console.error('Failed to fetch Pokemon:', error);
            return null;
        }
    }

    async getMovesDetails(moveNames) {
        const moves = [];
        for (const moveName of moveNames) {
            try {
                const response = await axios.get(`${POKEAPI_URL}/move/${moveName}`);
                const data = response.data;

                moves.push({
                    name: data.name,
                    power: data.power || 0,
                    accuracy: data.accuracy || 100,
                    type: data.type.name,
                    category: data.damage_class.name,
                    effect: data.effect_entries[0]?.effect || 'No description',
                });
            } catch (error) {
                console.error('Failed to fetch move:', moveName);
            }
        }
        return moves;
    }

    async getPokemonSpecies(pokemonId) {
        try {
            const response = await axios.get(`${POKEAPI_URL}/pokemon-species/${pokemonId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch species data:', error);
            return null;
        }
    }

    calculateStats(basePokemon, level, iv = {}, ev = {}) {
        // IV (Individual Values) und EV (Effort Values) für Variation
        const ivsDefault = { hp: 15, attack: 15, defense: 15, spAtk: 15, spDef: 15, speed: 15 };
        const evsDefault = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 };

        const ivs = { ...ivsDefault, ...iv };
        const evs = { ...evsDefault, ...ev };

        const stats = {};

        // HP: ((2 * Base + IV + (EV / 4)) * Level / 100) + Level + 5
        stats.hp = Math.floor(((2 * basePokemon.baseStats.hp + ivs.hp + evs.hp / 4) * level / 100) + level + 5);

        // Andere Stats: ((2 * Base + IV + (EV / 4)) * Level / 100) + 5
        const calcStat = (base) => Math.floor(((2 * base + ivs.attack + evs.attack / 4) * level / 100) + 5);

        stats.attack = calcStat(basePokemon.baseStats.attack);
        stats.defense = calcStat(basePokemon.baseStats.defense);
        stats.spAtk = calcStat(basePokemon.baseStats.spAtk);
        stats.spDef = calcStat(basePokemon.baseStats.spDef);
        stats.speed = calcStat(basePokemon.baseStats.speed);

        return stats;
    }

    calculateCatchRate(targetPokemonHp, maxHp, pokeballs) {
        // Vereinfachte Catch-Rate Berechnung basierend auf HP und Pokeball-Typ
        const hpFactor = 1 - (targetPokemonHp / maxHp);
        const ballMultiplier = pokeballs === 'greatball' ? 1.5 : pokeballs === 'ultraball' ? 2 : 1;
        return Math.min(0.9, hpFactor * ballMultiplier);
    }

    async getMovesAtLevel(pokemonName, level = 5) {
        try {
            const response = await axios.get(`${POKEAPI_URL}/pokemon/${pokemonName}`);
            const data = response.data;

            // Filtere Moves die auf diesem Level gelernt werden
            const movesByName = {}; // Map um Duplikate zu vermeiden

            for (let moveData of data.moves) {
                for (let versionDetail of moveData.version_group_details) {
                    // Nur Moves die durch "level-up" gelernt werden
                    if (versionDetail.move_learn_method.name === 'level-up' &&
                        versionDetail.level_learned_at <= level) {
                        const moveName = moveData.move.name;

                        // Speichere nur das höchste Level für diesen Move (falls in mehreren Versionen)
                        if (!movesByName[moveName] || versionDetail.level_learned_at > movesByName[moveName].learnLevel) {
                            movesByName[moveName] = {
                                name: moveName,
                                learnLevel: versionDetail.level_learned_at,
                            };
                        }
                    }
                }
            }

            // Konvertiere Map zu Array und sortiere
            const movesAtLevel = Object.values(movesByName);
            movesAtLevel.sort((a, b) => b.learnLevel - a.learnLevel);

            // Nimm die 4 neuesten Moves
            const selectedMoves = movesAtLevel.slice(0, 4).map(m => m.name);

            // Wenn weniger als 4 Moves, füge auch Egg-Moves oder TM-Moves hinzu
            if (selectedMoves.length < 4) {
                for (let moveData of data.moves) {
                    if (selectedMoves.length >= 4) break;

                    for (let versionDetail of moveData.version_group_details) {
                        if (selectedMoves.length >= 4) break;

                        // Egg-Moves und TM-Moves als Fallback
                        if ((versionDetail.move_learn_method.name === 'egg' ||
                            versionDetail.move_learn_method.name === 'machine') &&
                            !selectedMoves.includes(moveData.move.name)) {
                            selectedMoves.push(moveData.move.name);
                            break;
                        }
                    }
                }
            }

            // Hol die vollen Move-Details
            return await this.getMovesDetails(selectedMoves);
        } catch (error) {
            console.error('Failed to get moves at level:', error);
            return [];
        }
    }
}

const pokemonService = new PokemonService();
