// Simple Authentication Manager for Index Page
// Handles display of login state and user menu

class SimpleAuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('SimpleAuthManager initializing...');
        this.loadUserSession();
        this.updateAuthDisplay();
        console.log('SimpleAuthManager initialized with user:', this.currentUser?.name || 'None');

        // If the global API client is present, wait for it to finish initializing
        // and then refresh the auth display from the API's authenticated user.
        if (window.api && api.initPromise) {
            api.initPromise.then(() => {
                try {
                    if (api.currentUser) {
                        this.currentUser = api.currentUser;
                        this.updateAuthDisplay();
                        console.log('SimpleAuthManager: synced currentUser from API client:', this.currentUser.name);
                    }
                } catch (e) {
                    console.warn('SimpleAuthManager: could not sync with API client', e);
                }
            }).catch(err => {
                console.warn('SimpleAuthManager: api.initPromise failed', err);
            });
        }
    }

    loadUserSession() {
        const session = localStorage.getItem('cousinsvault_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date();
                // If an expiry exists, honor it; otherwise assume persistent session
                if (sessionData.expires_at) {
                    const expiresAt = new Date(sessionData.expires_at);
                    if (!isNaN(expiresAt.getTime())) {
                        if (now < expiresAt && sessionData.user) {
                            this.currentUser = sessionData.user;
                            console.log('User session loaded (with expiry):', this.currentUser);
                        } else {
                            // Session expired
                            console.log('Session expired, clearing...');
                            localStorage.removeItem('cousinsvault_session');
                        }
                    } else {
                        // Invalid expiry format — do not clear session, assume persistent if user present
                        if (sessionData.user) {
                            this.currentUser = sessionData.user;
                            console.log('User session loaded (invalid expiry assumed persistent):', this.currentUser);
                        }
                    }
                } else {
                    // No expiry set — assume persistent session
                    if (sessionData.user) {
                        this.currentUser = sessionData.user;
                        console.log('User session loaded (no expiry, persistent):', this.currentUser);
                    }
                }
            } catch (e) {
                console.log('Invalid session data, clearing...');
                localStorage.removeItem('cousinsvault_session');
            }
        }
    }

    updateAuthDisplay() {
        const authButtons = document.querySelector('.auth-buttons');
        
        if (!authButtons) {
            console.error('Auth buttons container not found!');
            return;
        }
        
        if (this.currentUser) {
            // User is logged in, show user menu
            authButtons.innerHTML = this.createUserMenu();
            console.log('✅ Displaying user menu for:', this.currentUser.name);
        } else {
            // User is not logged in, show only login button on index (signup available on auth page)
            authButtons.innerHTML = `
                <a href="auth.html" class="btn-sm btn-outline">Login</a>
            `;
            console.log('❌ Displaying login button only (no user logged in)');
        }

        // Attach touch/click handlers to newly inserted auth elements so they work on mobile
        try {
            // Touch-friendly navigation for anchor buttons
            const anchors = authButtons.querySelectorAll('a.btn-sm, a');
            anchors.forEach(a => {
                // Avoid attaching multiple times
                if (a.__touchHandlerAttached) return;
                const handleTouch = function(e) {
                    // Make tap immediate and prevent synthetic mouse events
                    e.preventDefault();
                    const href = a.getAttribute('href');
                    if (href) window.location.href = href;
                };
                a.addEventListener('touchstart', handleTouch, { passive: false });
                // keep click as fallback
                a.addEventListener('click', function(e) { /* allow normal navigation */ });
                a.__touchHandlerAttached = true;
            });

            // If user menu exists, wire up toggle behavior via JS (instead of inline onclick)
            const userContainer = authButtons.querySelector('.user-menu-container');
            if (userContainer) {
                const menu = userContainer.querySelector('.user-menu');
                const dropdown = userContainer.querySelector('#userDropdown');

                if (menu && dropdown && !menu.__menuHandlerAttached) {
                    // prevent clicks from falling through to mobile toggle
                    menu.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const isVisible = dropdown.style.display === 'block';
                        dropdown.style.display = isVisible ? 'none' : 'block';
                    });

                    // make dropdown items easier to tap
                    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                        item.style.padding = '0.8rem 1rem';
                        item.style.display = 'block';
                        item.style.width = '100%';
                    });

                    // Close when clicking outside (also handled globally elsewhere)
                    document.addEventListener('click', function docClick(e) {
                        const inside = e.target.closest('.user-menu-container');
                        if (!inside && dropdown.style.display === 'block') {
                            dropdown.style.display = 'none';
                        }
                    });

                    menu.__menuHandlerAttached = true;
                }
            }
        } catch (e) {
            console.warn('Auth display handlers setup failed', e);
        }
        
        // Ensure mobile toggle remains visible
        setTimeout(() => {
            this.ensureMobileToggleVisibility();
        }, 100);
    }

    createUserMenu() {
        const initials = this.getInitials(this.currentUser.name);
        
        return `
            <div class="user-menu-container" style="position: relative;">
                <div class="user-menu">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${this.currentUser.name}</div>
                        <div class="user-role">${this.currentUser.role || 'Member'}</div>
                    </div>
                    <button class="user-menu-btn" onclick="authManager.toggleUserDropdown()">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="user-dropdown" id="userDropdown" style="display: none;">
                    <div class="dropdown-menu">
                        <a href="profiles.html" class="dropdown-item">
                            <i class="fas fa-user"></i> Profile
                        </a>
                        <a href="vault.html" class="dropdown-item">
                            <i class="fas fa-folder"></i> My Vault
                        </a>
                        <div class="dropdown-divider"></div>
                        <button onclick="authManager.logout()" class="dropdown-item logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    ensureMobileToggleVisibility() {
        // Make sure mobile toggle is always visible on mobile devices
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle && window.innerWidth <= 768) {
            mobileToggle.style.display = 'block';
            // Place it above typical user-menu z-index for touch access
            mobileToggle.style.zIndex = '1006';
        }
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            dropdown.style.display = isVisible ? 'none' : 'block';
        }
    }

    logout() {
        localStorage.removeItem('cousinsvault_session');
        this.currentUser = null;
        this.updateAuthDisplay();
        
        // Show logout message
        this.showNotification('Logged out successfully');
        
        // Redirect to auth page after a short delay
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.auth-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideInAuth 0.3s ease;
            ${type === 'success' ? 'background: var(--sage-green);' : 'background: var(--error-red);'}
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutAuth 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
function initializeAuth() {
    console.log('Initializing authentication manager...');
    window.authManager = new SimpleAuthManager();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = e.target.closest('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (!userMenu && dropdown) {
            dropdown.style.display = 'none';
        }
    });
}

// Multiple initialization methods for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else if (document.readyState === 'interactive') {
    // DOM is loaded but resources might not be
    setTimeout(initializeAuth, 100);
} else {
    // DOM and resources are loaded
    initializeAuth();
}

// Add required CSS for user dropdown
const authStyles = document.createElement('style');
authStyles.textContent = `
    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        border: 1px solid var(--light-gray);
        overflow: hidden;
        min-width: 200px;
        z-index: 1001;
    }
    
    /* Mobile-specific styles */
    @media (max-width: 768px) {
        .user-menu {
            padding: 0.3rem 0.6rem;
            gap: 0.5rem;
            max-width: 180px;
        }
        
        .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.8rem;
        }
        
        .user-info {
            min-width: 60px;
            flex: 1;
        }
        
        .user-name {
            font-size: 0.75rem;
            line-height: 1;
        }
        
        .user-role {
            font-size: 0.6rem;
        }
        
        .user-menu-btn {
            padding: 0.15rem;
            font-size: 0.8rem;
        }
        
        .user-dropdown {
            right: -10px;
            min-width: 160px;
            margin-top: 0.3rem;
        }
        
        .dropdown-item {
            padding: 0.6rem 0.8rem;
            font-size: 0.8rem;
        }
        
        /* Ensure mobile menu is accessible */
        .nav-container {
            position: relative;
        }
        
        .mobile-toggle {
            display: block !important;
            z-index: 1002;
            position: relative;
        }
        
        /* Fix nav-links to not interfere with user menu */
        .nav-links {
            z-index: 999;
        }
        
        .nav-links.active {
            z-index: 999;
        }
    }

    .dropdown-menu {
        padding: 0.5rem 0;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.8rem 1rem;
        text-decoration: none;
        color: var(--text-dark);
        font-size: 0.9rem;
        transition: background 0.2s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
    }

    .dropdown-item:hover {
        background: var(--light-gray);
    }

    .logout-btn {
        color: var(--error-red);
    }

    .logout-btn:hover {
        background: rgba(231, 76, 60, 0.1);
    }

    .dropdown-divider {
        height: 1px;
        background: var(--light-gray);
        margin: 0.5rem 0;
    }

    @keyframes slideInAuth {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutAuth {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;

document.head.appendChild(authStyles);