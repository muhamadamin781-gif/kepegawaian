const Auth = {
    sessionKey: 'pegawai_active_session',
    API_URL: location.origin,

    init() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    async handleLogin() {
        const nip = document.getElementById('login_nip').value.trim();
        const password = document.getElementById('login_password').value;

        if (!nip || !password) {
            alert('NIP dan Password wajib diisi');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/api/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nip, password })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const result = await response.json();

            if (result.success) {

                // simpan token + user
                sessionStorage.setItem(this.sessionKey, JSON.stringify({
                    token: result.token,          // JWT
                    nip: result.user.nip,
                    nama: result.user.nama,
                    role: result.user.role,
                    loginTime: Date.now(),
                    expired: Date.now() + (1000 * 60 * 60 * 8) // 8 jam
                }));

                window.location.href = "dashboard.html";

            } else {
                alert(result.message || 'Login gagal');
            }

        } catch (err) {
            console.error(err);
            alert('Gagal koneksi server');
        }
    },

    getSession() {
        const data = sessionStorage.getItem(this.sessionKey);
        if (!data) return null;

        const session = JSON.parse(data);

        // cek expired
        if (Date.now() > session.expired) {
            this.logout();
            return null;
        }

        return session;
    },

    isLogin() {
        return this.getSession() !== null;
    },

    logout() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.href = "login.html";
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
