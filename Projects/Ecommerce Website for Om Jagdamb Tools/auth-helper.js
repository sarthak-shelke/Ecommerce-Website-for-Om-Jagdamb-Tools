/**
 * Authentication Helper
 * Provides consistent authentication checks across all pages
 */

// Check if user is authenticated
function isUserAuthenticated() {
    const isUser = localStorage.getItem('isUser');
    const userEmail = localStorage.getItem('userEmail');
    const isAdmin = localStorage.getItem('isAdmin');
    const adminEmail = localStorage.getItem('adminEmail');
    const token = localStorage.getItem('token');
    
    return (isUser === 'true' && userEmail) || 
           (isAdmin === 'true' && adminEmail) || 
           token;
}

// Get user email from any auth method
function getUserEmail() {
    return localStorage.getItem('userEmail') || 
           localStorage.getItem('adminEmail') || 
           null;
}

// Get user display name
function getUserDisplayName() {
    const email = getUserEmail();
    if (!email) return 'User';
    return email.split('@')[0];
}

// Require authentication (redirect to login if not authenticated)
function requireAuth(redirectUrl = 'login.html') {
    if (!isUserAuthenticated()) {
        alert('Please login to access this page');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Logout user
function logoutUser() {
    // Clear all auth-related localStorage items
    localStorage.removeItem('isUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userLoginTime');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('justLoggedIn');
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isUserAuthenticated,
        getUserEmail,
        getUserDisplayName,
        requireAuth,
        logoutUser
    };
}
