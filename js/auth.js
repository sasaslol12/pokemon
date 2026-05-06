// Authentication System
class Auth {
    constructor() {
        this.currentUser = null;
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {
            const { data: { user } } = await sbClient.auth.getUser();
            this.currentUser = user;

            if (user) {
                // Überprüfe ob Player Profile existiert
                const { data: playerData, error } = await sbClient
                    .from('players')
                    .select('username')
                    .eq('id', this.currentUser.id)
                    .single();

                // Wenn kein Username, zeige Username-Screen (zB nach Google OAuth)
                if (!playerData || !playerData.username) {
                    ui.showUsernameScreen();
                    return;
                }

                await this.loadPlayerData();
                ui.showGameScreen();
            } else {
                ui.showAuthScreen();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            ui.showAuthScreen();
        }
    }

    async signup(email, password, username) {
        try {
            const { data, error } = await sbClient.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Erstelle User Profile in der Datenbank
            const { error: profileError } = await sbClient
                .from('players')
                .insert({
                    id: data.user.id,
                    email: email,
                    username: username,
                    level: 1,
                    exp: 0,
                    pokeballs: 20,
                    created_at: new Date(),
                });

            if (profileError) throw profileError;

            this.currentUser = data.user;
            await this.loadPlayerData();
            ui.showSuccessMessage('Account erstellt! Willkommen!');
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Signup fehlgeschlagen: ' + error.message);
            return false;
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await sbClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            this.currentUser = data.user;
            await this.loadPlayerData();
            ui.showSuccessMessage('Erfolgreich angemeldet!');
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Login fehlgeschlagen: ' + error.message);
            return false;
        }
    }

    async logout() {
        try {
            await sbClient.auth.signOut();
            this.currentUser = null;
            ui.showAuthScreen();
            ui.showSuccessMessage('Abgemeldet');
        } catch (error) {
            ui.showErrorMessage('Logout fehlgeschlagen: ' + error.message);
        }
    }

    async loginWithGoogle() {
        try {
            const { data, error } = await sbClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            ui.showErrorMessage('Google Login fehlgeschlagen: ' + error.message);
        }
    }

    validateUsername(username) {
        // 3-14 Zeichen, nur Buchstaben und Zahlen
        const regex = /^[a-zA-Z0-9]{3,14}$/;
        return regex.test(username);
    }

    async checkUsernameAvailable(username) {
        try {
            const { data, error } = await sbClient
                .from('players')
                .select('id')
                .eq('username', username)
                .single();

            // Wenn data nicht null ist, existiert der Name bereits
            return data === null;
        } catch (error) {
            // Wenn Fehler auftritt (normalerweise "nicht gefunden"), ist der Name verfügbar
            return true;
        }
    }

    async setUsername(username) {
        try {
            // Validiere Format
            if (!this.validateUsername(username)) {
                ui.showErrorMessage('Username: 3-14 Zeichen, nur Buchstaben & Zahlen');
                return false;
            }

            // Überprüfe ob Name verfügbar ist
            const available = await this.checkUsernameAvailable(username);
            if (!available) {
                ui.showErrorMessage('Dieser Name ist bereits vergeben!');
                return false;
            }

            // Erstelle oder update Player Profile
            const { data: existing } = await sbClient
                .from('players')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (existing) {
                // Update
                const { error } = await sbClient
                    .from('players')
                    .update({ username: username })
                    .eq('id', this.currentUser.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await sbClient
                    .from('players')
                    .insert({
                        id: this.currentUser.id,
                        email: this.currentUser.email,
                        username: username,
                        level: 1,
                        exp: 0,
                        pokeballs: 20,
                        created_at: new Date(),
                    });

                if (error) throw error;
            }

            await this.loadPlayerData();
            ui.showSuccessMessage(`Willkommen, ${username}!`);
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Fehler beim Speichern: ' + error.message);
            return false;
        }
    }

    async loadPlayerData() {
        try {
            const { data, error } = await sbClient
                .from('players')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            this.playerData = data;
            localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(data));

            // Lade Team und Inventory
            await game.loadPlayerTeam();
            await game.loadInventory();
        } catch (error) {
            console.error('Failed to load player data:', error);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getPlayerData() {
        return this.playerData;
    }
}

const auth = new Auth();
