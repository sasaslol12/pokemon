// Authentication System
class Auth {
    constructor() {
        this.currentUser = null;
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            this.currentUser = user;
            
            if (user) {
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Erstelle User Profile in der Datenbank
            const { error: profileError } = await supabase
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
            const { data, error } = await supabase.auth.signInWithPassword({
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
            await supabase.auth.signOut();
            this.currentUser = null;
            ui.showAuthScreen();
            ui.showSuccessMessage('Abgemeldet');
        } catch (error) {
            ui.showErrorMessage('Logout fehlgeschlagen: ' + error.message);
        }
    }

    async loadPlayerData() {
        try {
            const { data, error } = await supabase
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
