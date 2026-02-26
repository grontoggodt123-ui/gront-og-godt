// Supabase konfiguration
const supabaseUrl = 'https://hpatkyorwwwmhxdxeirm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYXRreW9yd3d3bWh4ZHhlaXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTczMTgsImV4cCI6MjA4NzY5MzMxOH0.KKVJgw0HzntOhVJofGZtcw8RxVjJ7OIKD7xtRyKzOq4';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Liste over godkendte admin e-mails (ERSTAT MED DINE EGNE)
const adminEmails = ['loxi190712@gmail.com'];

let isLoginMode = true;

// Håndtering af formular på login.html
const authForm = document.getElementById('authForm');
const switchBtn = document.getElementById('switchBtn');
const submitBtn = document.getElementById('submitBtn');
const authTitle = document.getElementById('authTitle');

// Funktion til at skifte mode
const setAuthMode = (loginMode) => {
    isLoginMode = loginMode;
    if (authTitle) {
        authTitle.innerText = isLoginMode ? 'Login' : 'Opret konto';
        submitBtn.innerText = isLoginMode ? 'Log ind' : 'Opret konto';
        switchBtn.innerText = isLoginMode ? 'Skift til opret konto' : 'Skift til login';
    }
};

if (authForm) {
    // Tjek URL parametre for start-mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'signup') {
        setAuthMode(false);
    }

    // Skift mellem Login og Opret konto
    switchBtn?.addEventListener('click', () => {
        setAuthMode(!isLoginMode);
    });

    // Submit logik
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (isLoginMode) {
            // Login
            const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
            if (error) alert("Fejl: " + error.message);
            else {
                alert("Login succesfuld!");
                window.location.href = 'index.html';
            }
        } else {
            // Signup - Hvis 'Confirm email' er slået fra i Supabase, logger den automatisk ind
            const { data, error } = await _supabase.auth.signUp({ email, password });
            if (error) {
                alert("Fejl: " + error.message);
            } else {
                if (data.session) {
                    alert("Konto oprettet og du er logget ind!");
                    window.location.href = 'index.html';
                } else {
                    alert("Konto oprettet! Du kan nu logge ind.");
                    window.location.href = 'login.html';
                }
            }
        }
    });
}

// Tjek login status på tværs af sider
const checkStatus = async () => {
    const { data: { user } } = await _supabase.auth.getUser();
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminBtn = document.getElementById('adminBtn');
    const path = window.location.pathname;
    const isProtectedPage = path.includes('book.html') || path.includes('application.html');
    const isAdminPage = path.includes('admin.html');

    if (user) {
        // Tjek om brugeren er admin
        const isAdmin = adminEmails.includes(user.email);

        // Vis admin-knappen hvis man er admin
        if (adminBtn && isAdmin) {
            adminBtn.style.display = 'inline-block';
        }

        // Hvis man er logget ind, men prøver at gå på admin siden uden at være admin
        if (isAdminPage && !isAdmin) {
            window.location.href = 'index.html';
            return;
        }

        if (loginBtn) {
            loginBtn.innerText = 'Log ud';
            loginBtn.onclick = async () => {
                await _supabase.auth.signOut();
                location.reload();
            };
        }
        if (signupBtn) signupBtn.style.display = 'none';
    } else {
        // Hvis man ikke er logget ind og prøver at se en beskyttet side eller admin side
        if (isProtectedPage || isAdminPage) {
            window.location.href = 'login.html';
        }
    }
};

checkStatus();
