/**
 * Auth Logic - Google Sign-In Updated
 */

const Auth = {
    key: 'currentUser',

    // Callback for Google Sign-In
    handleGoogleSignIn: async (response) => {
        try {
            // 1. Decode JWT (Google credential)
            const payload = Auth.parseJwt(response.credential);
            const { email, name, picture } = payload;

            // 2. Check if user exists in DB
            const db = DB.get();
            let user = db.users.find(u => u.email === email);

            if (user) {
                // User exists -> Login
                Auth.sessionLogin(user);
            } else {
                // New User -> Show Profile Completion Modal
                window.pendingGoogleUser = { email, name, picture };
                document.getElementById('profile-completion-modal').classList.remove('hidden');
                populateBranches(); // Ensure branches are loaded for the modal
            }
        } catch (error) {
            console.error('Auth Error:', error);
            alert("Google Sign-In failed. Please try again.");
        }
    },

    // Helper to decode Google JWT
    parseJwt: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },

    // Save user to session and redirect
    sessionLogin: (user) => {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'student') window.location.href = "student/dashboard.html";
        else if (user.role === 'professor') window.location.href = "professor/dashboard.html";
        else window.location.href = "warden/dashboard.html";
    },

    registerGoogleUser: (details) => {
        if (!window.pendingGoogleUser) return { success: false, message: 'No session found' };

        const newUser = {
            id: details.rollNo,
            role: 'student',
            name: window.pendingGoogleUser.name,
            email: window.pendingGoogleUser.email,
            picture: window.pendingGoogleUser.picture,
            ...details
        };

        const result = DB.registerUser(newUser);
        if (result.success) {
            Auth.sessionLogin(newUser);
        }
        return result;
    },

    logout: () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    },

    getCurrentUser: () => {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    },

    checkAuth: () => {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
           const pathPrefix = window.location.pathname.includes('/student/') || 
                             window.location.pathname.includes('/professor/') || 
                             window.location.pathname.includes('/warden/') ? '../' : '';
           window.location.href = pathPrefix + 'index.html';
           return null;
        }
        return JSON.parse(user);
    },

    updateProfile: (details) => {
        const currentUser = Auth.getCurrentUser();
        if(!currentUser) return { success: false, message: 'Not logged in' };
        
        const result = DB.updateUser(currentUser.email, details);
        if(result.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            return { success: true };
        }
        return result;
    }
};
