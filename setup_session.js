// Copy and paste this entire code into your browser console on the vault page
// This will set up your authentication session with the JWT token

const sessionData = {
    user: {
        id: 1,
        username: 'abir',
        email: 'rahikulmakhtum147@gmail.com',
        name: 'Abir',
        role: 'admin'
    },
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InJhaGlrdWxtYWtodHVtMTQ3QGdtYWlsLmNvbSIsImlhdCI6MTc2MDkzNjM5MywiZXhwIjoxNzYxMDIyNzkzfQ.ST4zyAbDudkZwt8KZpOsaKSr9CAa6M3plhLh_N9X_5A',
    expires_at: new Date(1761022793 * 1000).toISOString() // Convert Unix timestamp to ISO string
};

// Set the session data
localStorage.setItem('cousinsvault_session', JSON.stringify(sessionData));

// Verify it was set correctly
const saved = localStorage.getItem('cousinsvault_session');
console.log('✅ Session data saved:', JSON.parse(saved));

// Reload the page to apply the authentication
console.log('🔄 Reloading page to apply authentication...');
location.reload();