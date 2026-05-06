// Battle System
class BattleSystem {
    constructor() {
        this.currentBattle = null;
    }

    async startBattle(playerTeam, enemyTeam, isWildPokemon = false) {
        this.currentBattle = {
            playerTeam: playerTeam,
            enemyTeam: enemyTeam,
            currentPlayerPokemon: playerTeam[0],
            currentEnemyPokemon: enemyTeam[0],
            playerHp: playerTeam[0].hp,
            enemyHp: enemyTeam[0].hp,
            turn: 0,
            log: [],
            isWildPokemon: isWildPokemon,
            battleEnded: false,
        };

        ui.showBattleScreen(this.currentBattle);
    }

    async executeAction(actionType, actionData) {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;

        const battle = this.currentBattle;
        let log = [];

        // Spieler-Aktion
        if (actionType === 'attack') {
            const move = actionData;
            const damage = this.calculateDamage(
                battle.currentPlayerPokemon,
                battle.currentEnemyPokemon,
                move
            );

            battle.enemyHp = Math.max(0, battle.enemyHp - damage);
            log.push(`${battle.currentPlayerPokemon.name} nutzt ${move.name}! ${damage} Schaden!`);
        } else if (actionType === 'switch') {
            const newPokemon = actionData;
            log.push(`Du schickst ${newPokemon.name} raus!`);
            battle.currentPlayerPokemon = newPokemon;
            battle.playerHp = newPokemon.hp;
        } else if (actionType === 'catchWild') {
            const catchRate = pokemonService.calculateCatchRate(
                battle.enemyHp,
                battle.currentEnemyPokemon.hp,
                'pokeball'
            );

            if (Math.random() < catchRate) {
                log.push(`${battle.currentEnemyPokemon.name} wurde gefangen!`);
                battle.battleEnded = true;
                battle.won = true;
                await this.endBattle(true);
                return;
            } else {
                log.push(`${battle.currentEnemyPokemon.name} ist entkommen!`);
            }
        }

        // Gegner-Aktion (KI)
        if (!battle.battleEnded) {
            const enemyMove = battle.currentEnemyPokemon.moveDetails[
                Math.floor(Math.random() * battle.currentEnemyPokemon.moveDetails.length)
            ];

            const damage = this.calculateDamage(
                battle.currentEnemyPokemon,
                battle.currentPlayerPokemon,
                enemyMove
            );

            battle.playerHp = Math.max(0, battle.playerHp - damage);
            log.push(`${battle.currentEnemyPokemon.name} nutzt ${enemyMove.name}! ${damage} Schaden!`);
        }

        // Überprüfe auf Ende des Kampfes
        if (battle.playerHp <= 0) {
            log.push(`${battle.currentPlayerPokemon.name} ist besiegt!`);
            // Switchweapon or Gameover Check
            if (this.hasAlivePokemon(battle.playerTeam)) {
                ui.showMessage('Wähle ein anderes Pokémon!');
            } else {
                log.push('Du hast keinen Ausweg mehr! Du hast verloren!');
                battle.battleEnded = true;
                battle.won = false;
                await this.endBattle(false);
                return;
            }
        }

        if (battle.enemyHp <= 0) {
            log.push(`${battle.currentEnemyPokemon.name} ist besiegt!`);
            if (this.hasAlivePokemon(battle.enemyTeam)) {
                ui.showMessage('Gegner schickt ein neues Pokémon raus!');
                battle.currentEnemyPokemon = battle.enemyTeam.find(p => p.hp > 0);
                battle.enemyHp = battle.currentEnemyPokemon.hp;
            } else {
                log.push('Du hast gewonnen!');
                battle.battleEnded = true;
                battle.won = true;
                await this.endBattle(true);
                return;
            }
        }

        battle.log = log;
        battle.turn++;
        ui.updateBattleScreen(battle);
    }

    calculateDamage(attacker, defender, move) {
        const attack = attacker.attack || 50;
        const defense = defender.defense || 50;
        const level = attacker.level || 1;

        // Vereinfachte Schadensberechnung
        let baseDamage = ((2 * level / 5 + 2) * move.power * (attack / defense) / 50) + 2;

        // STAB (Same Type Attack Bonus): 1.5x wenn Typ passt
        if (attacker.types.includes(move.type)) {
            baseDamage *= 1.5;
        }

        // Zufälligkeit: 85% - 100%
        const randomFactor = (Math.random() * 0.15) + 0.85;
        const finalDamage = Math.floor(baseDamage * randomFactor);

        return Math.max(1, finalDamage);
    }

    hasAlivePokemon(team) {
        return team.some(p => p.hp > 0);
    }

    async endBattle(playerWon) {
        const battle = this.currentBattle;

        if (playerWon) {
            // XP verteilen
            const xpGain = 100;
            for (let pokemon of battle.playerTeam) {
                if (pokemon.hp > 0) {
                    pokemon.exp += xpGain;
                    await this.checkLevelUp(pokemon);
                }
            }
            ui.showSuccessMessage(`Gewonnen! +${xpGain} XP!`);
        } else {
            ui.showErrorMessage('Du hast verloren!');
        }

        // Speichere in Datenbank
        await this.saveBattleResult(playerWon);

        this.currentBattle = null;
        ui.showGameScreen();
    }

    async checkLevelUp(pokemon) {
        const requiredExp = GAME_CONFIG.XP_PER_LEVEL;
        while (pokemon.exp >= requiredExp && pokemon.level < GAME_CONFIG.MAX_LEVEL) {
            pokemon.exp -= requiredExp;
            pokemon.level++;

            // Recalculate Stats
            const basePokemon = await pokemonService.getPokemon(pokemon.name);
            const newStats = pokemonService.calculateStats(basePokemon, pokemon.level, pokemon.iv, pokemon.ev);
            const hpIncrease = newStats.hp - pokemon.hp;

            pokemon.hp = newStats.hp;
            pokemon.maxHp = newStats.hp;
            pokemon.attack = newStats.attack;
            pokemon.defense = newStats.defense;
            pokemon.spAtk = newStats.spAtk;
            pokemon.spDef = newStats.spDef;
            pokemon.speed = newStats.speed;

            ui.showSuccessMessage(`${pokemon.name} ist auf Level ${pokemon.level} gestiegen!`);
        }
    }

    async saveBattleResult(playerWon) {
        try {
            await sbClient.from('battle_logs').insert({
                player_id: auth.getCurrentUser().id,
                opponent: 'wild' || 'trainer',
                result: playerWon ? 'win' : 'loss',
                created_at: new Date(),
            });
        } catch (error) {
            console.error('Failed to save battle result:', error);
        }
    }
}

const battleSystem = new BattleSystem();
