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
                <p>Melde dich an oder erstelle einen Account</p>
                
                <div id="authForm">
                    <div class="form-group">
                        <label>E-Mail</label>
                        <input type="email" id="email" placeholder="deine@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Passwort</label>
                        <input type="password" id="password" placeholder="••••••••">
                    </div>
                    
                    <div id="usernameGroup" class="form-group" style="display:none;">
                        <label>Benutzername</label>
                        <input type="text" id="username" placeholder="Dein Trainer Name">
                    </div>
                    
                    <div class="button-group">
                        <button class="btn-primary" onclick="ui.handleLogin()">Anmelden</button>
                        <button class="btn-secondary" onclick="ui.toggleSignup()">Registrieren</button>
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p style="text-align: center; color: #999; margin-bottom: 10px; font-size: 14px;">oder</p>
                        <button class="btn-secondary" onclick="auth.loginWithGoogle()" style="background: white; border: 2px solid #4285F4; color: #4285F4; font-weight: 600;">
                            🔐 Mit Google anmelden
                        </button>
                    </div>
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

    showGameScreen() {
        this.currentScreen = 'game';
        const playerData = auth.getPlayerData();
        const team = inventory.getTeam();

        this.app.innerHTML = `
            <div class="game-screen">
                <div class="header">
                    <h1>⚡ Pokémon Browser</h1>
                    <div class="user-info">
                        <span>👤 ${playerData?.username || 'Trainer'}</span>
                        <span>📊 Level ${playerData?.level || 1}</span>
                        <span>🎯 Pokébälle: ${inventory.getInventory().pokeballs}</span>
                        <button class="logout-btn" onclick="auth.logout()">Abmelden</button>
                    </div>
                </div>

                <div class="main-content">
                    <div class="sidebar">
                        <h2>Menu</h2>
                        <div class="menu-item active" onclick="ui.showTeamScreen()">👥 Mein Team</div>
                        <div class="menu-item" onclick="ui.showPokedexScreen()">📖 Pokédex</div>
                        <div class="menu-item" onclick="ui.showInventoryScreen()">🎒 Inventar</div>
                        <div class="menu-item" onclick="ui.showExploreScreen()">🗺️ Erkunden</div>
                        <div class="menu-item" onclick="ui.showStatsScreen()">📈 Statistiken</div>
                    </div>

                    <div class="content" id="content">
                        <!-- Inhalte werden dynamisch geladen -->
                    </div>
                </div>
            </div>
        `;

        this.showTeamScreen();
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
        messageEl.className = type;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageEl);

        this.messageTimeout = setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

const ui = new UI();
