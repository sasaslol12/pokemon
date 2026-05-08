// UI Management
class UI {
    constructor() {
        this.app = document.getElementById('app');
        this.currentScreen = null;
        this.messageTimeout = null;
    }

    showAuthScreen() {
        this.currentScreen = 'auth';
        this.app.innerHTML = `
            <div class="auth-screen">
                <h1>⚡ Pokémon Browser</h1>
                <p>Login with Google to play</p>
                
                <div style="margin-top: 50px; text-align: center;">
                    <button class="btn-secondary" onclick="auth.loginWithGoogle()" style="background: white; border: 2px solid #4285F4; color: #4285F4; font-weight: 600; padding: 15px 30px; font-size: 16px; width: 100%; max-width: 300px;">
                        🔐 Sign in with Google
                    </button>
                </div>
            </div>
        `;
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showErrorMessage('Bitte füllen Sie alle Felder aus');
            return;
        }

        auth.login(email, password);
    }

    handleSignup() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;

        if (!email || !password || !username) {
            this.showErrorMessage('Bitte füllen Sie alle Felder aus');
            return;
        }

        auth.signup(email, password, username);
    }

    toggleSignup() {
        const usernameGroup = document.getElementById('usernameGroup');
        const button = event.target;

        if (usernameGroup.style.display === 'none') {
            usernameGroup.style.display = 'block';
            button.textContent = 'Anmelden';
            document.querySelector('.btn-primary').onclick = () => this.handleSignup();
            document.querySelector('.btn-primary').textContent = 'Registrieren';
        } else {
            usernameGroup.style.display = 'none';
            button.textContent = 'Registrieren';
            document.querySelector('.btn-primary').onclick = () => this.handleLogin();
            document.querySelector('.btn-primary').textContent = 'Anmelden';
        }
    }

    showUsernameScreen() {
        this.currentScreen = 'username';
        this.app.innerHTML = `
            <div class="auth-screen">
                <h1>👤 Wähle deinen Namen</h1>
                <p>Dieser Name wird von anderen Trainern sichtbar sein</p>
                
                <div id="usernameForm" style="margin-top: 30px;">
                    <div class="form-group">
                        <label>Trainer Name</label>
                        <input type="text" id="newUsername" placeholder="3-14 Zeichen (A-Z, 0-9)" maxlength="14" autofocus>
                        <small style="color: #999; margin-top: 5px; display: block;">
                            ✓ 3-14 Zeichen | ✓ Nur Buchstaben & Zahlen
                        </small>
                    </div>

                    <div id="feedback" style="margin: 15px 0; display: none; padding: 10px; border-radius: 8px;">
                    </div>

                    <div class="button-group" style="margin-top: 30px;">
                        <button class="btn-primary" onclick="ui.handleUsernameSubmit()">Namen bestätigen</button>
                    </div>
                </div>
            </div>
        `;

        // Enter-Taste Unterstützung
        document.getElementById('newUsername').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUsernameSubmit();
            }
        });

        // Live-Feedback beim Tippen
        document.getElementById('newUsername').addEventListener('input', (e) => {
            const username = e.target.value;
            const feedback = document.getElementById('feedback');

            if (username.length === 0) {
                feedback.style.display = 'none';
                return;
            }

            if (username.length < 3) {
                feedback.style.display = 'block';
                feedback.style.background = '#fff3cd';
                feedback.style.color = '#856404';
                feedback.textContent = `⚠️ Mindestens ${3 - username.length} Zeichen mehr nötig`;
            } else if (username.length > 14) {
                feedback.style.display = 'block';
                feedback.style.background = '#f8d7da';
                feedback.style.color = '#721c24';
                feedback.textContent = `❌ Maximal 14 Zeichen erlaubt`;
            } else if (!/^[a-zA-Z0-9]*$/.test(username)) {
                feedback.style.display = 'block';
                feedback.style.background = '#f8d7da';
                feedback.style.color = '#721c24';
                feedback.textContent = `❌ Nur Buchstaben & Zahlen erlaubt`;
            } else {
                feedback.style.display = 'block';
                feedback.style.background = '#d4edda';
                feedback.style.color = '#155724';
                feedback.textContent = `✓ ${username.length}/14 Zeichen`;
            }
        });
    }

    async handleUsernameSubmit() {
        const username = document.getElementById('newUsername').value.trim();

        if (username.length < 3 || username.length > 14 || !/^[a-zA-Z0-9]*$/.test(username)) {
            this.showErrorMessage('Username: 3-14 Zeichen, nur Buchstaben & Zahlen!');
            return;
        }

        // Disable Button während Verarbeitung
        const btn = document.querySelector('.btn-primary');
        btn.disabled = true;
        btn.textContent = 'Wird überprüft...';

        const success = await auth.setUsername(username);

        if (!success) {
            btn.disabled = false;
            btn.textContent = 'Namen bestätigen';
        }
    }

    showStarterScreen() {
        this.currentScreen = 'starter';
        this.app.innerHTML = `
            <div class="auth-screen">
                <h1>🎮 Wähle dein Starter-Pokémon</h1>
                <p>Dies wird dein erstes Pokémon auf Level 5</p>
                
                <div id="starterGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; margin-top: 25px;">
                    <!-- Starters werden hier eingefügt -->
                </div>
            </div>
        `;

        this.loadStarterGrid();
    }

    async loadStarterGrid() {
        const grid = document.getElementById('starterGrid');
        grid.innerHTML = '';

        // Gruppiere Starters nach Generation
        const byGen = {};
        for (let starter of GAME_CONFIG.STARTER_POKEMON) {
            if (!byGen[starter.gen]) {
                byGen[starter.gen] = [];
            }
            byGen[starter.gen].push(starter.name);
        }

        // Zeige alle Starters
        for (let starter of GAME_CONFIG.STARTER_POKEMON) {
            const pokemonData = await pokemonService.getPokemon(starter.name);

            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div style="font-size: 11px; color: #999;">Gen ${starter.gen}</div>
                <img src="${pokemonData.sprite}" alt="${pokemonData.name}" class="pokemon-sprite">
                <h3 style="margin: 8px 0;">${pokemonData.name}</h3>
                <button class="btn-primary" style="width: 100%; padding: 8px; font-size: 12px;">Wählen</button>
            `;

            card.querySelector('button').addEventListener('click', async (e) => {
                e.stopPropagation();
                const btn = e.target;
                btn.disabled = true;
                btn.textContent = '...';

                // Verwende englischen Namen für Datenbankabfrage
                const success = await inventory.addPokemonToTeam(starter.englishName, GAME_CONFIG.STARTER_LEVEL);

                if (success) {
                    ui.showSuccessMessage('Starter-Pokémon gewählt!');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    ui.showTeamSetupScreen();
                } else {
                    btn.disabled = false;
                    btn.textContent = 'Wählen';
                }
            });

            grid.appendChild(card);
        }
    }

    async selectStarter(starterName) {
        // Diese Methode wird nicht mehr verwendet
    }

    async showTeamSetupScreen() {
        this.currentScreen = 'teamSetup';

        this.app.innerHTML = `
            <div class="team-setup-screen">
                <div class="header">
                    <h1>🎯 Stelle dein Team zusammen</h1>
                    <p>Ziehe Pokémon in die 6 Team-Slots</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; max-width: 1200px; margin: 0 auto;">
                    <!-- Team Slots -->
                    <div class="team-slots">
                        <h3>👥 Dein Team</h3>
                        <div id="teamSlotsContainer" style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                            ${Array.from({ length: 6 }, (_, i) => `
                                <div class="team-slot" data-slot="${i}" draggable="false" style="
                                    border: 2px dashed #ccc;
                                    border-radius: 8px;
                                    padding: 12px;
                                    min-height: 60px;
                                    background: #f9f9f9;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                ">
                                    <div style="color: #999; font-size: 12px;">Slot ${i + 1}</div>
                                    <div id="slot-${i}-content" style="font-weight: bold; margin-top: 5px;"></div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 20px; padding: 12px;" onclick="ui.startBattle()">
                            ⚔️ Kampf beginnen
                        </button>
                    </div>

                    <!-- Pokemon Inventar -->
                    <div class="inventory-select">
                        <h3>📦 Verfügbare Pokémon</h3>
                        <div id="inventoryListContainer" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                            gap: 10px;
                            max-height: 600px;
                            overflow-y: auto;
                            padding: 10px;
                            background: #f0f0f0;
                            border-radius: 8px;
                        ">
                            <!-- Pokemon werden hier eingefügt -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadTeamSetupInventory();
        this.setupTeamDragDrop();
    }

    async loadTeamSetupInventory() {
        const container = document.getElementById('inventoryListContainer');
        container.innerHTML = '';

        await inventory.loadPlayerTeam();
        const team = inventory.playerTeam;

        if (team.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; color: #999;">Keine Pokémon verfügbar</p>';
            return;
        }

        for (let pokemon of team) {
            const card = document.createElement('div');
            card.className = 'team-pokemon-card';
            card.draggable = true;
            card.dataset.pokemonId = pokemon.id;
            card.dataset.pokemonName = pokemon.name;
            card.innerHTML = `
                <img src="${pokemon.sprite}" alt="${pokemon.name}" style="width: 80px; height: 80px; image-rendering: pixelated;">
                <div style="font-size: 11px; font-weight: bold; text-align: center; margin-top: 5px;">${pokemon.name}</div>
                <div style="font-size: 10px; color: #666; text-align: center;">Lv.${pokemon.level}</div>
            `;

            card.style.cursor = 'grab';
            card.style.padding = '8px';
            card.style.background = 'white';
            card.style.borderRadius = '6px';
            card.style.textAlign = 'center';
            card.style.border = '1px solid #ddd';
            card.style.transition = 'all 0.2s';

            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('pokemonId', pokemon.id);
                e.dataTransfer.setData('pokemonName', pokemon.name);
                e.dataTransfer.setData('pokemonSprite', pokemon.sprite);
                e.dataTransfer.setData('pokemonLevel', pokemon.level);
                card.style.opacity = '0.6';
            });

            card.addEventListener('dragend', (e) => {
                card.style.opacity = '1';
            });

            container.appendChild(card);
        }
    }

    setupTeamDragDrop() {
        const slots = document.querySelectorAll('.team-slot');

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                slot.style.borderColor = '#FF6347';
                slot.style.background = '#ffe6e6';
            });

            slot.addEventListener('dragleave', (e) => {
                slot.style.borderColor = '#ccc';
                slot.style.background = '#f9f9f9';
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.style.borderColor = '#ccc';
                slot.style.background = '#f9f9f9';

                const pokemonId = e.dataTransfer.getData('pokemonId');
                const pokemonName = e.dataTransfer.getData('pokemonName');
                const pokemonSprite = e.dataTransfer.getData('pokemonSprite');
                const pokemonLevel = e.dataTransfer.getData('pokemonLevel');

                const slotIndex = slot.dataset.slot;

                // Speichere in activeTeam
                const pokemon = inventory.playerTeam.find(p => p.id === pokemonId);
                if (pokemon) {
                    inventory.activeTeam[slotIndex] = pokemon;

                    // Update UI
                    const contentDiv = document.getElementById(`slot-${slotIndex}-content`);
                    contentDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${pokemonSprite}" alt="${pokemonName}" style="width: 40px; height: 40px; image-rendering: pixelated;">
                            <div>
                                <div>${pokemonName}</div>
                                <div style="font-size: 11px; color: #666;">Level ${pokemonLevel}</div>
                            </div>
                        </div>
                    `;

                    slot.style.borderColor = '#4CAF50';
                    slot.style.background = '#e8f5e9';
                    slot.style.borderStyle = 'solid';
                }
            });
        });
    }

    startBattle() {
        // Prüfe ob mindestens 1 Pokémon im Team
        const teamCount = inventory.activeTeam.filter(p => p !== null).length;
        if (teamCount === 0) {
            this.showErrorMessage('Du brauchst mindestens 1 Pokémon!');
            return;
        }

        this.showSuccessMessage(`Team mit ${teamCount} Pokémon bereit!`);
        // Kampf wird später implementiert
        console.log('Aktives Team:', inventory.activeTeam);
    }

    showGameScreen() {
        this.currentScreen = 'game';
        const playerData = auth.getPlayerData();

        this.app.innerHTML = `
            <div class="game-screen">
                <div class="header">
                    <h1>⚡ Pokémon Sammler</h1>
                    <div class="user-info">
                        <span>👤 ${playerData?.username || 'Trainer'}</span>
                        <button class="logout-btn" onclick="auth.logout()">Abmelden</button>
                    </div>
                </div>

                <div class="tabs" style="display: flex; gap: 0; border-bottom: 2px solid #ddd; margin: 20px 20px 0;">
                    <button id="tab-pokedex" class="tab-btn" style="padding: 12px 20px; border: none; background: none; cursor: pointer; font-size: 16px; color: #666; border-bottom: 3px solid transparent; margin-bottom: -2px;" onclick="ui.switchTab('pokedex')">📖 Pokédex</button>
                    <button id="tab-inventory" class="tab-btn" style="padding: 12px 20px; border: none; background: none; cursor: pointer; font-size: 16px; color: #666; border-bottom: 3px solid transparent; margin-bottom: -2px;" onclick="ui.switchTab('inventory')">🎒 Inventar</button>
                </div>

                <!-- Pokédex Tab -->
                <div id="pokedex-tab" class="tab-content">
                    <div class="pokedex-container">
                        <div id="pokedex-list" class="pokedex-grid">
                            <div class="loading">
                                <div class="spinner"></div>
                                <p>Pokémon werden geladen...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inventar Tab -->
                <div id="inventory-tab" class="tab-content" style="display: none;">
                    <div id="inventory-list" class="pokedex-grid">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Team wird geladen...</p>
                        </div>
                    </div>
                </div>

                <!-- Pokemon Detail Modal (Pokédex) -->
                <div id="pokemonModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalPokemonName">Pokemon</h2>
                            <button class="close-btn" onclick="ui.closePokemonDetail()">&times;</button>
                        </div>
                        
                        <div class="sprite-comparison">
                            <div class="sprite-container">
                                <h4>Normal</h4>
                                <img id="normalSprite" src="" alt="Normal">
                            </div>
                            <div class="sprite-container">
                                <h4>✨ Shiny</h4>
                                <img id="shinySprite" src="" alt="Shiny">
                            </div>
                        </div>

                        <div class="pokemon-detail-stats">
                            <div class="detail-stat">
                                <div class="detail-stat-label">HP</div>
                                <div class="detail-stat-value" id="statHP">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Angriff</div>
                                <div class="detail-stat-value" id="statAttack">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Verteidigung</div>
                                <div class="detail-stat-value" id="statDefense">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Sp.Atk</div>
                                <div class="detail-stat-value" id="statSpAtk">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Sp.Def</div>
                                <div class="detail-stat-value" id="statSpDef">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Initiative</div>
                                <div class="detail-stat-value" id="statSpeed">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inventory Detail Modal -->
                <div id="inventoryModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="inventoryModalName">Pokémon</h2>
                            <button class="close-btn" onclick="ui.closeInventoryDetail()">&times;</button>
                        </div>
                        
                        <div class="sprite-comparison">
                            <div class="sprite-container">
                                <img id="invSprite" src="" alt="Pokemon" style="max-width: 200px;">
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0 0 5px 0;"><strong>Level</strong>: <span id="invLevel">-</span></p>
                                <p style="margin: 0 0 10px 0;"><strong>Gefangen am:</strong> <span id="invCaughtDate">-</span></p>
                                
                                <h4>Attacken (Level 5):</h4>
                                <div id="invMovesList" style="list-style: none; padding: 0; margin: 0;">
                                    <div class="loading"><div class="spinner"></div></div>
                                </div>
                            </div>
                        </div>

                        <div class="pokemon-detail-stats">
                            <div class="detail-stat">
                                <div class="detail-stat-label">HP</div>
                                <div class="detail-stat-value" id="invStatHP">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Angriff</div>
                                <div class="detail-stat-value" id="invStatAttack">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Verteidigung</div>
                                <div class="detail-stat-value" id="invStatDefense">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Sp.Atk</div>
                                <div class="detail-stat-value" id="invStatSpAtk">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Sp.Def</div>
                                <div class="detail-stat-value" id="invStatSpDef">-</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Initiative</div>
                                <div class="detail-stat-value" id="invStatSpeed">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.switchTab('pokedex');
    }

    switchTab(tabName) {
        // Verstecke alle Tabs
        document.getElementById('pokedex-tab').style.display = 'none';
        document.getElementById('inventory-tab').style.display = 'none';

        // Entferne aktive Klasse von allen Buttons
        document.getElementById('tab-pokedex').style.borderColor = 'transparent';
        document.getElementById('tab-pokedex').style.color = '#666';
        document.getElementById('tab-inventory').style.borderColor = 'transparent';
        document.getElementById('tab-inventory').style.color = '#666';

        if (tabName === 'pokedex') {
            document.getElementById('pokedex-tab').style.display = 'block';
            document.getElementById('tab-pokedex').style.borderColor = '#FF6347';
            document.getElementById('tab-pokedex').style.color = '#333';
            this.loadPokedexList();
        } else {
            document.getElementById('inventory-tab').style.display = 'block';
            document.getElementById('tab-inventory').style.borderColor = '#FF6347';
            document.getElementById('tab-inventory').style.color = '#333';
            this.loadInventoryTab();
        }
    }

    async loadPokedexList() {
        const container = document.getElementById('pokedex-list');

        try {
            // Lade erste 151 Pokémon (Gen 1)
            const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151&offset=0');
            const pokemonList = response.data.results;

            container.innerHTML = '';

            for (let pokemon of pokemonList) {
                const pokemonData = await pokemonService.getPokemon(pokemon.name);

                const types = pokemonData.types.map(t =>
                    `<div class="type-badge ${t}">${t}</div>`
                ).join('');

                const card = document.createElement('div');
                card.className = 'pokemon-card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <div class="pokemon-id">#${pokemonData.id}</div>
                    <img src="${pokemonData.sprite}" alt="${pokemonData.name}" class="pokemon-sprite">
                    <div class="pokemon-info">
                        <h3>${pokemonData.name}</h3>
                        <div class="pokemon-types">
                            ${types}
                        </div>
                    </div>
                `;

                // Click-Handler für Detail-View
                card.addEventListener('click', () => {
                    this.showPokemonDetail(pokemonData);
                });

                container.appendChild(card);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Pokédex:', error);
            container.innerHTML = '<div class="empty-message">Fehler beim Laden der Pokémon!</div>';
        }
    }

    showPokemonDetail(pokemonData) {
        const modal = document.getElementById('pokemonModal');

        // Befülle Modal mit Daten
        document.getElementById('modalPokemonName').textContent = pokemonData.name;
        document.getElementById('normalSprite').src = pokemonData.sprite;
        document.getElementById('shinySprite').src = pokemonData.shinySprite || pokemonData.sprite;

        // Base Stats
        document.getElementById('statHP').textContent = pokemonData.baseStats.hp;
        document.getElementById('statAttack').textContent = pokemonData.baseStats.attack;
        document.getElementById('statDefense').textContent = pokemonData.baseStats.defense;
        document.getElementById('statSpAtk').textContent = pokemonData.baseStats.spAtk;
        document.getElementById('statSpDef').textContent = pokemonData.baseStats.spDef;
        document.getElementById('statSpeed').textContent = pokemonData.baseStats.speed;

        // Zeige Modal
        modal.classList.add('active');

        // Close-Button für außerhalb des Modals
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePokemonDetail();
            }
        });
    }

    closePokemonDetail() {
        const modal = document.getElementById('pokemonModal');
        modal.classList.remove('active');
    }

    async loadInventoryTab() {
        const container = document.getElementById('inventory-list');

        try {
            await inventory.loadPlayerTeam();
            const team = inventory.playerTeam;

            container.innerHTML = '';

            if (team.length === 0) {
                container.innerHTML = '<div class="empty-message" style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">Du hast noch kein Pokémon!</div>';
                return;
            }

            for (let pokemon of team) {
                const card = document.createElement('div');
                card.className = 'pokemon-card';
                card.style.cursor = 'pointer';
                card.innerHTML = `
                    <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-sprite">
                    <div class="pokemon-info">
                        <h3>${pokemon.name}</h3>
                        <div style="font-size: 12px; color: #666;">Level ${pokemon.level}</div>
                    </div>
                `;

                // Click-Handler für Detail-View
                card.addEventListener('click', () => {
                    this.showInventoryDetail(pokemon);
                });

                container.appendChild(card);
            }
        } catch (error) {
            console.error('Fehler beim Laden des Inventars:', error);
            container.innerHTML = '<div class="empty-message">Fehler beim Laden!</div>';
        }
    }

    async showInventoryDetail(pokemon) {
        const modal = document.getElementById('inventoryModal');

        // Befülle Modal mit Daten
        document.getElementById('inventoryModalName').textContent = pokemon.name;
        document.getElementById('invSprite').src = pokemon.sprite;
        document.getElementById('invLevel').textContent = pokemon.level;

        // Formatiere Datum: YYYY-MM-DD
        const caughtDate = new Date(pokemon.caughtAt);
        const formattedDate = caughtDate.toISOString().split('T')[0];
        document.getElementById('invCaughtDate').textContent = formattedDate;

        // Stats
        document.getElementById('invStatHP').textContent = pokemon.hp;
        document.getElementById('invStatAttack').textContent = pokemon.attack;
        document.getElementById('invStatDefense').textContent = pokemon.defense;
        document.getElementById('invStatSpAtk').textContent = pokemon.spAtk;
        document.getElementById('invStatSpDef').textContent = pokemon.spDef;
        document.getElementById('invStatSpeed').textContent = pokemon.speed;

        // Lade Moves für Level 5
        const movesList = document.getElementById('invMovesList');
        try {
            // Verwende englischen Namen für API-Abfrage
            const moves = await pokemonService.getMovesAtLevel(pokemon.englishName || pokemon.name, GAME_CONFIG.STARTER_LEVEL);

            movesList.innerHTML = '';
            if (moves.length === 0) {
                movesList.innerHTML = '<p style="color: #999;">Keine Attacken auf Level 5</p>';
            } else {
                moves.forEach(move => {
                    const moveEl = document.createElement('div');
                    moveEl.style.cssText = 'padding: 8px; margin: 5px 0; background: #f5f5f5; border-radius: 4px; font-size: 12px;';
                    moveEl.innerHTML = `
                        <strong>${move.name}</strong> (${move.type}) - 
                        <span style="color: #666;">Power: ${move.power || '-'} | Accuracy: ${move.accuracy}%</span>
                    `;
                    movesList.appendChild(moveEl);
                });
            }
        } catch (error) {
            console.error('Fehler beim Laden der Attacken:', error);
            movesList.innerHTML = '<p style="color: #999;">Fehler beim Laden</p>';
        }

        // Zeige Modal
        modal.classList.add('active');

        // Close-Button für außerhalb des Modals
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeInventoryDetail();
            }
        });
    }

    closeInventoryDetail() {
        const modal = document.getElementById('inventoryModal');
        modal.classList.remove('active');
    }

    showTeamScreen() {
        const team = inventory.getTeam();
        let content = '<h2>👥 Mein Team</h2>';

        if (team.length === 0) {
            content += '<div class="empty-message">Du hast noch kein Pokémon! Begib dich zum Erkunden.</div>';
        } else {
            content += '<div class="inventory-grid">';
            team.forEach(pokemon => {
                content += `
                    <div class="pokemon-card">
                        <img src="${pokemon.officialArt || pokemon.sprite}" alt="${pokemon.name}">
                        <h3>${pokemon.name}</h3>
                        <span class="level-badge">Level ${pokemon.level}</span>
                        <div class="pokemon-stats">
                            <div class="stat">
                                <div class="stat-label">HP</div>
                                <div class="stat-value">${pokemon.hp}/${pokemon.maxHp}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">Angriff</div>
                                <div class="stat-value">${pokemon.attack}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">Verteidigung</div>
                                <div class="stat-value">${pokemon.defense}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">Sp.Atk</div>
                                <div class="stat-value">${pokemon.spAtk}</div>
                            </div>
                        </div>
                        <div class="hp-bar">
                            <div class="hp-fill" style="width: ${(pokemon.hp / pokemon.maxHp) * 100}%">
                                ${Math.round((pokemon.hp / pokemon.maxHp) * 100)}%
                            </div>
                        </div>
                    </div>
                `;
            });
            content += '</div>';
        }

        document.getElementById('content').innerHTML = content;
        this.updateMenuActive('Mein Team');
    }

    showPokedexScreen() {
        let content = '<h2>📖 Pokédex</h2>';
        content += `<p>Pokémon gefangen: ${inventory.pokedex.length}</p>`;
        content += '<div class="inventory-grid">';

        inventory.pokedex.forEach(pokemon => {
            content += `
                <div class="pokemon-card">
                    <h3>${pokemon.name}</h3>
                    <p>ID: ${pokemon.id}</p>
                </div>
            `;
        });

        content += '</div>';
        document.getElementById('content').innerHTML = content;
        this.updateMenuActive('Pokédex');
    }

    showInventoryScreen() {
        const inv = inventory.getInventory();
        let content = '<h2>🎒 Inventar</h2>';
        content += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">';

        for (const [item, quantity] of Object.entries(inv)) {
            if (quantity > 0) {
                content += `
                    <div class="pokemon-card">
                        <h4>${item.replace(/_/g, ' ')}</h4>
                        <p>Menge: ${quantity}</p>
                        <button class="btn-primary" style="margin-top: 10px;">Verwenden</button>
                    </div>
                `;
            }
        }

        content += '</div>';
        document.getElementById('content').innerHTML = content;
        this.updateMenuActive('Inventar');
    }

    showExploreScreen() {
        let content = `
            <h2>🗺️ Erkunden</h2>
            <p>Erkunde die Welt und finde Pokémon!</p>
            <div style="margin-top: 20px;">
                <button class="btn-primary" style="padding: 20px 40px; font-size: 18px;" onclick="game.searchWildPokemon()">
                    Wildnis durchsuchen
                </button>
                <p style="margin-top: 10px; color: #999;">Kosten: 1 Bewegungspunkt</p>
            </div>
        `;
        document.getElementById('content').innerHTML = content;
        this.updateMenuActive('Erkunden');
    }

    showStatsScreen() {
        const playerData = auth.getPlayerData();
        let content = `
            <h2>📈 Statistiken</h2>
            <div class="pokemon-stats">
                <div class="stat">
                    <div class="stat-label">Spieler Level</div>
                    <div class="stat-value">${playerData?.level || 1}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Erfahrung</div>
                    <div class="stat-value">${playerData?.exp || 0}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Pokémon</div>
                    <div class="stat-value">${inventory.getTeam().length}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Pokédex</div>
                    <div class="stat-value">${inventory.pokedex.length}</div>
                </div>
            </div>
        `;
        document.getElementById('content').innerHTML = content;
        this.updateMenuActive('Statistiken');
    }

    showBattleScreen(battle) {
        const player = battle.currentPlayerPokemon;
        const enemy = battle.currentEnemyPokemon;

        let content = `
            <div class="battle-screen">
                <h2>🔥 Pokémon Kampf!</h2>
                
                <div class="battle-arena">
                    <div class="pokemon-battle">
                        <img src="${enemy.officialArt || enemy.sprite}" alt="${enemy.name}">
                        <h3>${enemy.name}</h3>
                        <span class="level-badge">Level ${enemy.level}</span>
                        <div class="battle-stats">
                            <h4>HP</h4>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${Math.max(0, (battle.enemyHp / enemy.hp) * 100)}%">
                                    ${Math.round(Math.max(0, (battle.enemyHp / enemy.hp) * 100))}%
                                </div>
                            </div>
                            <small>${Math.max(0, battle.enemyHp)} / ${enemy.hp}</small>
                        </div>
                    </div>

                    <div class="pokemon-battle">
                        <img src="${player.officialArt || player.sprite}" alt="${player.name}">
                        <h3>${player.name}</h3>
                        <span class="level-badge">Level ${player.level}</span>
                        <div class="battle-stats">
                            <h4>HP</h4>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${Math.max(0, (battle.playerHp / player.hp) * 100)}%">
                                    ${Math.round(Math.max(0, (battle.playerHp / player.hp) * 100))}%
                                </div>
                            </div>
                            <small>${Math.max(0, battle.playerHp)} / ${player.hp}</small>
                        </div>
                    </div>
                </div>

                <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; min-height: 80px;">
                    <div id="battleLog">
                        ${battle.log.map(l => `<p>→ ${l}</p>`).join('')}
                    </div>
                </div>

                <div class="actions">
                    ${player.moveDetails.map(move => `
                        <button class="action-btn" onclick="battleSystem.executeAction('attack', ${JSON.stringify(move).replace(/"/g, '&quot;')})">
                            ${move.name}<br><small>${move.power || '-'} PWR</small>
                        </button>
                    `).join('')}
                    ${battle.isWildPokemon ? `
                        <button class="action-btn" onclick="battleSystem.executeAction('catchWild', null)">
                            🎯 Fangen
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('content').innerHTML = content;
    }

    updateBattleScreen(battle) {
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.innerHTML = battle.log.map(l => `<p>→ ${l}</p>`).join('');
            battleLog.scrollTop = battleLog.scrollHeight;
        }
    }

    updateMenuActive(name) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.includes(name)) {
                item.classList.add('active');
            }
        });
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type = 'info') {
        if (this.messageTimeout) clearTimeout(this.messageTimeout);

        const messageEl = document.createElement('div');
        messageEl.className = `${type} message-fixed`;
        messageEl.textContent = message;

        document.body.appendChild(messageEl);

        this.messageTimeout = setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

const ui = new UI();
