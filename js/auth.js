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

                // Prüfe ob Player bereits ein Pokémon hat
                const { data: pokemonData } = await sbClient
                    .from('player_pokemon')
                    .select('id')
                    .eq('player_id', this.currentUser.id)
                    .limit(1);

                // Wenn kein Pokémon, zeige Starter-Wahl
                if (!pokemonData || pokemonData.length === 0) {
                    await this.loadPlayerData();
                    ui.showStarterScreen();
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
            ui.showSuccessMessage('Account created! Welcome!');
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Signup failed: ' + error.message);
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
            ui.showSuccessMessage('Successfully signed in!');
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Login failed: ' + error.message);
            return false;
        }
    }

    async logout() {
        try {
            await sbClient.auth.signOut();
            this.currentUser = null;
            ui.showAuthScreen();
            ui.showSuccessMessage('Signed out');
        } catch (error) {
            ui.showErrorMessage('Logout failed: ' + error.message);
        }
    }

    async loginWithGoogle() {
        try {
            // Dynamische Redirect-URL für GitHub Pages & lokale Entwicklung
            let redirectUrl = window.location.origin;

            // Für GitHub Pages: z.B. https://username.github.io/pkmn/
            if (window.location.pathname !== '/') {
                const pathParts = window.location.pathname.split('/').filter(p => p);
                if (pathParts.length > 0) {
                    redirectUrl = window.location.origin + '/' + pathParts[0] + '/';
                }
            }

            // Für lokale Entwicklung mit Port
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                redirectUrl = `http://${window.location.hostname}:${window.location.port || 8000}`;
            }

            console.log('Google OAuth Redirect URL:', redirectUrl);

            const { data, error } = await sbClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });
            if (error) throw error;
        } catch (error) {
            ui.showErrorMessage('Google login failed: ' + error.message);
            console.error('Google OAuth Error:', error);
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
                ui.showErrorMessage('Username: 3-14 characters, letters & numbers only');
                return false;
            }

            // Überprüfe ob Name verfügbar ist
            const available = await this.checkUsernameAvailable(username);
            if (!available) {
                ui.showErrorMessage('This username is already taken!');
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
            ui.showSuccessMessage(`Welcome, ${username}!`);
            ui.showGameScreen();
            return true;
        } catch (error) {
            ui.showErrorMessage('Error saving: ' + error.message);
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
