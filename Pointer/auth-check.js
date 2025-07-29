// auth-check.js - Add this to your main editor (index.html)
// This ensures only authenticated users can access the editor

import { waitForAuth, getCurrentUser } from './auth.js';

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await waitForAuth();
        
        if (!user) {
            // User not authenticated, redirect to landing page
            console.log('User not authenticated, redirecting to landing page...');
            window.location.href = 'landingPage.html';
            return;
        }
        
        // User is authenticated, initialize the editor
        console.log('User authenticated:', user);
        initializeEditorWithUser(user);
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        // Redirect to landing page on error
        window.location.href = 'landingPage.html';
    }
});

// Initialize editor with user data
function initializeEditorWithUser(user) {
    // Update UI with user information
    updateUserInterface(user);
    
    // Continue with existing editor initialization
    // Your existing init() function should be called here
    if (typeof init === 'function') {
        init();
    }
}

// Update UI with user information
function updateUserInterface(user) {
    // Add user menu to the editor
    createUserMenu(user);
    
    // Update welcome message in chat
    updateWelcomeMessage(user);
}

// Create user menu in the editor
function createUserMenu(user) {
    const sidebar = document.querySelector('.sidebar-header');
    if (!sidebar) return;
    
    // Create user menu
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-avatar" onclick="toggleUserDropdown()">
            ${user.photoURL ? 
                `<img src="${user.photoURL}" alt="User Avatar" class="avatar-img">` : 
                `<div class="avatar-placeholder">${user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</div>`
            }
        </div>
        <div class="user-dropdown" id="userDropdown" style="display: none;">
            <div class="user-info">
                <div class="user-name">${user.displayName || 'User'}</div>
                <div class="user-email">${user.email}</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="openUserSettings()">
                <i class="fas fa-cog"></i> Settings
            </button>
            <button class="dropdown-item" onclick="openUserProfile()">
                <i class="fas fa-user"></i> Profile
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="signOutUser()">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
        </div>
    `;
    
    sidebar.appendChild(userMenu);
}

// Update welcome message in chat
function updateWelcomeMessage(user) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Find and update the welcome message
    const welcomeMessage = chatMessages.querySelector('.message.assistant');
    if (welcomeMessage) {
        const messageContent = welcomeMessage.querySelector('.message-content');
        if (messageContent) {
            const userName = user.displayName || user.email.split('@')[0];
            messageContent.innerHTML = `
                <i class="fas fa-sparkles"></i> 
                Welcome back, ${userName}! I'm your AI coding assistant. 
                I can help you build complete websites! Try creating index.html, style.css, 
                and script.js files, then click "Run Website" to see them work together!
            `;
        }
    }
}

// Toggle user dropdown
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// User menu functions
window.openUserSettings = function() {
    console.log('Opening user settings...');
    // Implement settings modal/page
    alert('Settings panel coming soon!');
};

window.openUserProfile = function() {
    console.log('Opening user profile...');
    // Implement profile modal/page
    alert('Profile panel coming soon!');
};

// Sign out function (imported from auth.js)
window.signOutUser = async function() {
    if (confirm('Are you sure you want to sign out?')) {
        try {
            const { signOutUser } = await import('./auth.js');
            await signOutUser();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
};

// CSS for user menu (add to your main style.css)
const userMenuStyles = `
.user-menu {
    position: relative;
    margin-left: auto;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: white;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    overflow: hidden;
}

.user-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    min-width: 200px;
    z-index: 1000;
    overflow: hidden;
    animation: dropdownSlideIn 0.2s ease;
}

@keyframes dropdownSlideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-info {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
}

.user-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.user-email {
    font-size: 12px;
    color: var(--text-secondary);
}

.dropdown-item {
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
}

.dropdown-item:hover {
    background: var(--bg-secondary);
}

.dropdown-item.danger {
    color: var(--danger-color);
}

.dropdown-item.danger:hover {
    background: rgba(248, 81, 73, 0.1);
}

.dropdown-divider {
    height: 1px;
    background: var(--border-color);
    margin: 8px 0;
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = userMenuStyles;
document.head.appendChild(styleSheet);