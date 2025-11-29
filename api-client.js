// ========================================
// COUSINS VAULT - API CLIENT
// JavaScript client for PHP backend integration
// ========================================

class CousinVaultAPI {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.token = this.getStoredToken();
        this.currentUser = null;
        
        // Initialize asynchronously
        this.initPromise = this.init();
    }
    
    getBaseURL() {
        // Auto-detect base URL for InfinityFree or local development
        const hostname = window.location.hostname;
        if (hostname.includes('infinityfreeapp.com') || hostname.includes('infinityfree.com')) {
            return window.location.origin;
        }
        return window.location.origin;
    }
    
    async init() {
        console.log('🚀 Initializing Cousins Vault API Client');
        console.log('📍 Base URL:', this.baseURL);
        console.log('🔑 Token found:', !!this.token);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        console.log('📄 DOM ready, checking auth status...');

        // If token was recovered from session fallback but not saved under the primary key,
        // persist it so other pages and legacy scripts can find it as `cousinsvault_token`.
        try {
            if (this.token && !localStorage.getItem('cousinsvault_token')) {
                console.log('🔁 Persisting token to primary storage key `cousinsvault_token` from session fallback');
                this.setToken(this.token);
            }
        } catch (e) {
            console.warn('⚠️ Could not persist token to localStorage:', e);
        }

        // If a full session object exists, hydrate currentUser immediately so pages
        // display a logged-in state while we validate the token with the server.
        try {
            const sessionRaw = localStorage.getItem('cousinsvault_session');
            if (sessionRaw) {
                try {
                    const sessionObj = JSON.parse(sessionRaw);
                    // Support different expiry field names and normalize
                    const rawExpiry = sessionObj.expires_at || sessionObj.expiresAt || sessionObj.expires || (sessionObj.data && sessionObj.data.expires_at) || null;
                    if (rawExpiry) {
                        let parsed = new Date(rawExpiry);
                        if (isNaN(parsed.getTime())) {
                            // Try converting common MySQL datetime 'YYYY-MM-DD HH:MM:SS' to ISO
                            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(rawExpiry)) {
                                parsed = new Date(rawExpiry.replace(' ', 'T'));
                            } else if (!isNaN(Number(rawExpiry))) {
                                parsed = new Date(Number(rawExpiry) * 1000);
                            }
                        }
                        // If parsed expiry is valid and in future, hydrate user
                        if (!isNaN(parsed.getTime())) {
                            if (new Date() < parsed) {
                                const user = sessionObj.user || (sessionObj.data && sessionObj.data.user) || null;
                                if (user) {
                                    this.currentUser = user;
                                    this.updateAuthDisplay();
                                    console.log('🔁 Hydrated API client currentUser from session storage:', this.currentUser.name || this.currentUser.username || '(no name)');
                                }
                            }
                        }
                    } else {
                        // No expiry found — assume persistent session and hydrate if user present
                        const user = sessionObj.user || (sessionObj.data && sessionObj.data.user) || null;
                        if (user) {
                            this.currentUser = user;
                            this.updateAuthDisplay();
                            console.log('🔁 Hydrated API client currentUser from persistent session storage:', this.currentUser.name || this.currentUser.username || '(no name)');
                        }
                    }
                    // Also ensure token stored under primary key
                    if (sessionObj.token && !localStorage.getItem('cousinsvault_token')) {
                        try { localStorage.setItem('cousinsvault_token', sessionObj.token); } catch (e) {}
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to parse cousinsvault_session during hydration:', e);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error reading session for hydration:', e);
        }
        
        // Check authentication status on load
        await this.checkAuthStatus();
        
        // Intercept form submissions and localStorage calls
        this.interceptFormSubmissions();
        this.replaceLocalStorageCalls();
        
        console.log('✅ API Client initialization complete');
    }
    
    // ========================================
    // AUTHENTICATION METHODS
    // ========================================
    
    async login(email, password) {
        try {
            const response = await this.makeRequest('/api/v1/auth', {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }, '?action=login');
            
            if (response.success) {
                this.setToken(response.data.token);
                this.currentUser = response.data.user;
                this.updateAuthDisplay();
                return response;
            }
            throw new Error(response.error || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async signup(userData) {
        try {
            const response = await this.makeRequest('/api/v1/auth', {
                method: 'POST',
                body: JSON.stringify(userData)
            }, '?action=signup');
            
            if (response.success) {
                this.setToken(response.data.token);
                this.currentUser = response.data.user;
                this.updateAuthDisplay();
                return response;
            }
            throw new Error(response.error || 'Signup failed');
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            if (this.token) {
                await this.makeRequest('/api/v1/auth', {
                    method: 'POST'
                }, '?action=logout');
            }
            
            this.clearToken();
            this.currentUser = null;
            this.updateAuthDisplay();
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            this.clearToken();
            this.currentUser = null;
            window.location.reload();
        }
    }
    
    async checkAuthStatus() {
        if (!this.token) {
            this.updateAuthDisplay();
            return false;
        }
        
        try {
            const response = await this.makeRequest('/api/v1/auth', {
                method: 'GET'
            }, '?action=check');
            
            if (response.success && response.data.authenticated) {
                // Get full profile
                const profile = await this.getProfile();
                if (profile.success) {
                    this.currentUser = profile.data.profile;
                    this.updateAuthDisplay();
                    console.log('✅ User authenticated:', this.currentUser.name);
                    return true;
                }
            }
            
            // Auth failed according to server response. Do NOT automatically clear local session or token
            // because the server may be down or auth DB unreachable (we want client-side persistence).
            console.warn('⚠️ Authentication check returned not-authenticated; keeping local session for UX.');
            // Ensure UI reflects either hydrated user (if present) or logged-out state
            this.updateAuthDisplay();
            return false;
            
        } catch (error) {
            // Be defensive: never clear local session/token on auth check errors.
            // Some endpoints may intermittently return 401 or fail on certain pages (e.g., events),
            // and we should not force-logout the user because of that.
            console.error('Auth check error (retaining local session):', error);
            this.updateAuthDisplay();
            return false;
        }
    }
    
    async getProfile() {
        return await this.makeRequest('/api/v1/auth', {
            method: 'GET'
        }, '?action=profile');
    }
    
    // ========================================
    // GALLERY METHODS
    // ========================================
    
    async getGalleryItems(filters = {}) {
        const params = new URLSearchParams({
            action: 'list',
            ...filters
        });
        
        return await this.makeRequest('/api/v1/gallery', {
            method: 'GET'
        }, `?${params.toString()}`);
    }
    
    async getGalleryItem(id) {
        return await this.makeRequest('/api/v1/gallery', {
            method: 'GET'
        }, `?action=item&id=${id}`);
    }
    
    async uploadFile(formData) {
        // Special handling for file uploads
        return await this.makeRequest('/api/v1/gallery', {
            method: 'POST',
            body: formData
        }, '?action=upload', false); // Don't set Content-Type for FormData
    }
    
    async toggleLike(itemId) {
        return await this.makeRequest('/api/v1/gallery', {
            method: 'POST',
            body: JSON.stringify({ item_id: itemId })
        }, '?action=like');
    }
    
    async getGalleryStats() {
        return await this.makeRequest('/api/v1/gallery', {
            method: 'GET'
        }, '?action=stats');
    }
    
    // ========================================
    // EVENTS METHODS
    // ========================================
    
    async getEvents(filters = {}) {
        const params = new URLSearchParams({
            action: 'list',
            ...filters
        });
        
        return await this.makeRequest('/api/v1/events', {
            method: 'GET'
        }, `?${params.toString()}`);
    }
    
    async getEvent(id) {
        return await this.makeRequest('/api/v1/events', {
            method: 'GET'
        }, `?action=event&id=${id}`);
    }
    
    async createEvent(eventData) {
        return await this.makeRequest('/api/v1/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        }, '?action=create');
    }
    
    async updateEvent(eventData) {
        return await this.makeRequest('/api/v1/events', {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }
    
    async deleteEvent(id) {
        return await this.makeRequest('/api/v1/events', {
            method: 'DELETE'
        }, `?id=${id}`);
    }
    
    async submitRSVP(rsvpData) {
        return await this.makeRequest('/api/v1/events', {
            method: 'POST',
            body: JSON.stringify(rsvpData)
        }, '?action=rsvp');
    }
    
    async getCalendarEvents(month, year) {
        return await this.makeRequest('/api/v1/events', {
            method: 'GET'
        }, `?action=calendar&month=${month}&year=${year}`);
    }
    
    async getUpcomingEvents(limit = 5) {
        return await this.makeRequest('/api/v1/events', {
            method: 'GET'
        }, `?action=upcoming&limit=${limit}`);
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    async makeRequest(endpoint, options = {}, queryString = '', setContentType = true) {
        const url = this.baseURL + endpoint + queryString;
        
        const defaultHeaders = {};
        
        if (this.token) {
            defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }
        
        if (setContentType && !(options.body instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            // Handle token expiration: do NOT automatically clear local session here.
            // Let the caller decide how to handle auth failures so we don't aggressively log the user out
            // when an endpoint (or an alternate events DB) is temporarily unreachable.
            if (response.status === 401 && data && data.error && data.error.toLowerCase().includes('token')) {
                console.warn('⚠️ API returned 401 token error; throwing to caller (no automatic local clear)');
                throw new Error('Session expired or invalid token');
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }
    
    setToken(token) {
        console.log('💾 Setting token:', token ? '✅ Valid token' : '❌ Empty token');
        this.token = token;
        
        if (token) {
            try {
                localStorage.setItem('cousinsvault_token', token);
                console.log('💾 Token saved to localStorage');
                
                // Verify it was saved
                const verification = localStorage.getItem('cousinsvault_token');
                console.log('🔍 Verification - Token in localStorage:', !!verification);
                
                if (!verification) {
                    console.error('❌ TOKEN SAVE FAILED! LocalStorage not working!');
                    // Try alternative storage methods
                    this.tryAlternativeStorage(token);
                } else if (verification !== token) {
                    console.error('❌ TOKEN MISMATCH! Saved token differs from original');
                } else {
                    console.log('✅ Token successfully verified in storage');
                }
                
            } catch (error) {
                console.error('❌ LocalStorage error:', error);
                this.tryAlternativeStorage(token);
            }
        } else {
            console.warn('⚠️ Attempted to set empty/null token');
        }
    }
    
    getStoredToken() {
        try {
            const token = localStorage.getItem('cousinsvault_token');
            if (token) {
                console.log('🔍 Retrieved token from localStorage');
                return token;
            }
        } catch (error) {
            console.error('❌ Error reading from localStorage:', error);
        }
        
        // Fallback: some pages store a full session object under 'cousinsvault_session'
        try {
            const sessionRaw = localStorage.getItem('cousinsvault_session');
            if (sessionRaw) {
                const sessionObj = JSON.parse(sessionRaw);
                if (sessionObj && sessionObj.token) {
                    console.log('🔍 Retrieved token from cousinsvault_session fallback');
                    return sessionObj.token;
                }
            }
        } catch (err) {
            console.error('❌ Error reading cousinsvault_session fallback:', err);
        }
        
        // Try alternative storage (cookies as fallback)
        const cookieToken = this.getTokenFromCookie();
        if (cookieToken) {
            console.log('🔍 Retrieved token from cookie fallback');
            return cookieToken;
        }
        
        return null;
    }
    
    clearToken() {
        this.token = null;
        try {
            localStorage.removeItem('cousinsvault_token');
            localStorage.removeItem('cousinsvault_session'); // Clear old session data
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
        }
        
        // Also clear cookie fallback
        this.clearTokenFromCookie();
    }
    
    tryAlternativeStorage(token) {
        console.log('🔄 Trying alternative storage (cookies)...');
        try {
            // Store as secure cookie as fallback
            document.cookie = `cousinsvault_token=${token}; path=/; secure; samesite=strict; max-age=${24*60*60}`;
            console.log('🍪 Token stored in cookie as fallback');
        } catch (error) {
            console.error('❌ Cookie storage also failed:', error);
        }
    }
    
    getTokenFromCookie() {
        try {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'cousinsvault_token') {
                    return value;
                }
            }
        } catch (error) {
            console.error('❌ Error reading cookie:', error);
        }
        return null;
    }
    
    clearTokenFromCookie() {
        try {
            document.cookie = 'cousinsvault_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (error) {
            console.error('❌ Error clearing cookie:', error);
        }
    }
    
    updateAuthDisplay() {
        // Delegate visual auth state to SimpleAuthManager when available
        if (window.authManager && typeof authManager.updateAuthDisplay === 'function') {
            try {
                // If API client has a fresher user object, sync it over
                if (this.currentUser && !authManager.currentUser) {
                    authManager.currentUser = this.currentUser;
                }
                authManager.updateAuthDisplay();
                console.log('🖄 Auth display updated via SimpleAuthManager');
                return;
            } catch (e) {
                console.warn('⚠️ Failed to delegate auth display to SimpleAuthManager:', e);
            }
        }

        // If SimpleAuthManager is not present on this page, avoid manipulating
        // the header directly to prevent conflicting auth UIs.
        console.log('🖄 Auth display update skipped (no SimpleAuthManager on this page).');
    }
    
    showUserMenu() {
        if (confirm('Do you want to sign out?')) {
            this.logout();
        }
    }
    
    // ========================================
    // BACKWARD COMPATIBILITY
    // ========================================
    
    interceptFormSubmissions() {
        // Intercept authentication forms
        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                await this.handleLoginForm(e.target);
            } else if (e.target.id === 'signupForm') {
                e.preventDefault();
                await this.handleSignupForm(e.target);
            } else if (e.target.id === 'eventForm') {
                e.preventDefault();
                await this.handleEventForm(e.target);
            }
        });
    }
    
    async handleLoginForm(form) {
        const formData = new FormData(form);
        const email = formData.get('email') || document.getElementById('loginEmail')?.value;
        const password = formData.get('password') || document.getElementById('loginPassword')?.value;
        
        try {
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner"></div>';
            
            console.log('🔐 Attempting login for:', email);
            const response = await this.login(email, password);
            console.log('✅ Login response:', response);
            console.log('🔑 Token stored:', !!this.token);
            console.log('👤 Current user:', this.currentUser?.name);
            
            // Verify token was saved
            const storedToken = localStorage.getItem('cousinsvault_token');
            console.log('💾 Token in localStorage:', !!storedToken);
            
            if (!storedToken) {
                console.error('❌ Token not saved to localStorage!');
                this.showToast('Login failed - session not saved', 'error');
                return;
            }
            
            this.showToast('Login successful! Redirecting...', 'success');
            
            // Wait longer before redirect to ensure token is saved
            setTimeout(() => {
                console.log('🔄 Redirecting to index.html');
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showToast(error.message, 'error');
        } finally {
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">Sign In to Vault</span>';
        }
    }
    
    async handleSignupForm(form) {
        const formData = new FormData(form);
        
        const userData = {
            name: formData.get('name') || document.getElementById('signupName')?.value,
            email: formData.get('email') || document.getElementById('signupEmail')?.value,
            username: formData.get('username') || document.getElementById('signupEmail')?.value?.split('@')[0],
            password: formData.get('password') || document.getElementById('signupPassword')?.value,
            role: this.getSelectedRole() || 'contributor'
        };
        
        try {
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner"></div>';
            
            console.log('🔐 Attempting signup for:', userData.email);
            const response = await this.signup(userData);
            console.log('✅ Signup response:', response);
            console.log('🔑 Token stored:', !!this.token);
            console.log('👤 Current user:', this.currentUser?.name);
            
            // Verify token was saved
            const storedToken = localStorage.getItem('cousinsvault_token');
            console.log('💾 Token in localStorage:', !!storedToken);
            
            if (!storedToken) {
                console.error('❌ Token not saved to localStorage!');
                this.showToast('Signup failed - session not saved', 'error');
                return;
            }
            
            this.showToast('Registration successful! Welcome to Cousins Vault!', 'success');
            
            // Wait longer before redirect
            setTimeout(() => {
                console.log('🔄 Redirecting to index.html');
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            this.showToast(error.message, 'error');
        } finally {
            const submitBtn = form.querySelector('[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">Create Family Account</span>';
        }
    }
    
    getSelectedRole() {
        const selectedRole = document.querySelector('.role-option.selected');
        return selectedRole ? selectedRole.dataset.role : 'contributor';
    }
    
    replaceLocalStorageCalls() {
        // Replace localStorage usage with API calls
        
        // Replace gallery data loading
        if (window.galleryManager) {
            const originalLoadGalleryData = window.galleryManager.loadGalleryData;
            window.galleryManager.loadGalleryData = async () => {
                try {
                    const response = await this.getGalleryItems();
                    return response.success ? response.data.items : [];
                } catch (error) {
                    console.error('Failed to load gallery data:', error);
                    return [];
                }
            };
        }
        
        // Replace event data loading
        if (window.eventManager) {
            const originalLoadEvents = window.eventManager.loadEvents;
            window.eventManager.loadEvents = async () => {
                try {
                    const response = await this.getEvents();
                    return response.success ? response.data.events : [];
                } catch (error) {
                    console.error('Failed to load events:', error);
                    return [];
                }
            };
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#3498DB'};
            z-index: 3000;
            animation: toastSlideIn 0.4s ease;
            max-width: 300px;
            color: #333;
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }
    
    // ========================================
    // MIGRATION HELPERS
    // ========================================
    
    async migrateLocalStorageData() {
        // Helper method to migrate existing localStorage data to backend
        try {
            // Migrate gallery data
            const galleryData = localStorage.getItem('cousinsVaultGallery');
            if (galleryData) {
                const items = JSON.parse(galleryData);
                console.log('Found gallery data to migrate:', items.length, 'items');
                // Note: File uploads would need to be handled separately
            }
            
            // Migrate event data
            const eventData = localStorage.getItem('familyEvents');
            if (eventData) {
                const events = JSON.parse(eventData);
                console.log('Found event data to migrate:', events.length, 'events');
                // Could create events via API here
            }
            
            // Migrate user preferences
            const userData = localStorage.getItem('cousinsvault_session');
            if (userData) {
                console.log('Found user session data to check');
            }
            
        } catch (error) {
            console.error('Migration error:', error);
        }
    }
}

// Initialize API client
const api = new CousinVaultAPI();

// Make API client globally available
window.api = api;
window.cousinVaultAPI = api;

// Add CSS for toast animations if not already present
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes toastSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes toastSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Backward compatibility for existing code
window.authManager = {
    currentUser: () => api.currentUser,
    login: (email, password) => api.login(email, password),
    logout: () => api.logout(),
    signup: (userData) => api.signup(userData)
};

window.authDisplayManager = {
    showUserMenu: () => api.showUserMenu(),
    currentUser: api.currentUser
};

console.log('🔌 Cousins Vault API Client initialized');
console.log('🌐 Base URL:', api.baseURL);
console.log('🔑 Authentication:', api.currentUser ? 'Logged in as ' + api.currentUser.name : 'Not authenticated');