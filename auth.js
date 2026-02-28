// Supabase konfiguration
const supabaseUrl = 'https://nhodgtvgkbowhedrqnez.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2RndHZna2Jvd2hlZHJxbmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjc4MTUsImV4cCI6MjA4NzcwMzgxNX0.Ii4unjhP9usXjyuiCVQU7ng0QSTJmh7P2DGoD_zkTPU';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Liste over godkendte admin e-mails (ERSTAT MED DINE EGNE)
const adminEmails = ['loxi190712@gmail.com', 'devantiermathias@gmail.com'];

let isLoginMode = true;

// Håndtering af formular på login.html
const authForm = document.getElementById('authForm');
const switchBtn = document.getElementById('switchBtn');
const submitBtn = document.getElementById('submitBtn');
const authTitle = document.getElementById('authTitle');

// Funktion til at skifte mode
const setAuthMode = (loginMode) => {
    isLoginMode = loginMode;
    const usernameGroup = document.getElementById('usernameGroup');
    if (authTitle) {
        authTitle.innerText = isLoginMode ? 'Login' : 'Opret konto';
        submitBtn.innerText = isLoginMode ? 'Log ind' : 'Opret konto';
        switchBtn.innerText = isLoginMode ? 'Skift til opret konto' : 'Skift til login';
        if (usernameGroup) usernameGroup.style.display = isLoginMode ? 'none' : 'block';
    }
};

if (authForm) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'signup') setAuthMode(false);

    switchBtn?.addEventListener('click', () => setAuthMode(!isLoginMode));

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username')?.value;

        if (isLoginMode) {
            const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
            if (error) alert("Fejl: " + error.message);
            else {
                window.location.href = 'success.html?type=login';
            }
        } else {
            const { data, error } = await _supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { display_name: username } }
            });
            
            if (error) alert("Fejl: " + error.message);
            else {
                const { error: loginError } = await _supabase.auth.signInWithPassword({ email, password });
                if (loginError) window.location.href = 'login.html';
                else window.location.href = 'success.html?type=signup';
            }
        }
    });
}

const checkStatus = async () => {
    const { data: { user } } = await _supabase.auth.getUser();
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminBtn = document.getElementById('adminBtn');
    const bookBtn = document.getElementById('bookBtn');
    const userDisplay = document.getElementById('userEmail');
    
    const path = window.location.pathname;
    const isProtectedPage = path.includes('book.html') || path.includes('application.html') || path.includes('contact.html');
    const isAdminPage = path.includes('admin.html') || path.includes('aktive.html');

    // Håndter book knappen på forsiden
    if (bookBtn) {
        bookBtn.onclick = () => {
            if (user) {
                window.location.href = 'book.html';
            } else {
                window.location.href = 'success.html?type=need_account';
            }
        };
    }

    if (user) {
        if (userDisplay) userDisplay.innerText = user.user_metadata?.display_name || user.email;
        const isAdmin = adminEmails.includes(user.email);

        if (adminBtn && isAdmin) adminBtn.style.display = 'inline-block';
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
        if (isProtectedPage || isAdminPage) window.location.href = 'login.html';
    }
};

checkStatus();
