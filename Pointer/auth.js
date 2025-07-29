// auth.js - Authentication Logic
import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    googleProvider,
    githubProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from './firebase-config.js';

// Global variables
let currentUser = null;
let isAuthModalOpen = false;

// Initialize authentication state listener
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupEventListeners();
});

// Initialize authentication
function initializeAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log('User signed in:', user);
            handleAuthSuccess(user);
        } else {
            currentUser = null;
            console.log('User signed out');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Email sign in form
    const signInForm = document.getElementById('emailSignInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', handleEmailSignIn);
    }

    // Email sign up form
    const signUpForm = document.getElementById('emailSignUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', handleEmailSignUp);
    }

    // Close modal on overlay click
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isAuthModalOpen) {
            closeAuthModal();
        }
    });
}

// Show authentication modal
window.showAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        isAuthModalOpen = true;
    }
};

// Close authentication modal
window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            resetForms();
        }, 300);
        isAuthModalOpen = false;
    }
};

// Show sign up form
window.showSignUp = function() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    if (signInForm && signUpForm && authTitle && authSubtitle) {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
        signUpForm.classList.add('auth-form-transition');
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join thousands of developers building amazing projects';
    }
};

// Show sign in form
window.showSignIn = function() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    if (signInForm && signUpForm && authTitle && authSubtitle) {
        signUpForm.style.display = 'none';
        signInForm.style.display = 'block';
        signInForm.classList.add('auth-form-transition');
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to continue building amazing projects';
    }
};

// Toggle password visibility
window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.auth-password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggle.className = 'fas fa-eye';
    }
};

// Handle email sign in
async function handleEmailSignIn(e) {
    e.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const submitBtn = document.getElementById('signInBtn');
    
    setButtonLoading(submitBtn, true);
    clearErrors();
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign in successful:', userCredential.user);
        showSuccessMessage();
    } catch (error) {
        console.error('Sign in error:', error);
        showError(error.message, 'signInForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Handle email sign up
async function handleEmailSignUp(e) {
    e.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const submitBtn = document.getElementById('signUpBtn');
    
    // Validation
    if (!validateSignUpForm(name, email, password, confirmPassword, agreeTerms)) {
        return;
    }
    
    setButtonLoading(submitBtn, true);
    clearErrors();
    
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile
        await updateProfile(user, {
            displayName: name
        });
        
        // Save additional user data to Firestore
        await saveUserToDatabase(user, { name, email });
        
        console.log('Sign up successful:', user);
        showSuccessMessage();
    } catch (error) {
        console.error('Sign up error:', error);
        showError(error.message, 'signUpForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Google sign in
window.signInWithGoogle = async function() {
    const buttons = document.querySelectorAll('.google-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Save user data to database if new user
        await saveUserToDatabase(user, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: 'google'
        });
        
        console.log('Google sign in successful:', user);
        showSuccessMessage();
    } catch (error) {
        console.error('Google sign in error:', error);
        showError('Failed to sign in with Google. Please try again.', 'signInForm');
    } finally {
        buttons.forEach(btn => btn.disabled = false);
    }
};

// GitHub sign in
window.signInWithGitHub = async function() {
    const buttons = document.querySelectorAll('.github-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;
        
        // Save user data to database if new user
        await saveUserToDatabase(user, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: 'github'
        });
        
        console.log('GitHub sign in successful:', user);
        showSuccessMessage();
    } catch (error) {
        console.error('GitHub sign in error:', error);
        showError('Failed to sign in with GitHub. Please try again.', 'signInForm');
    } finally {
        buttons.forEach(btn => btn.disabled = false);
    }
};

// Save user to database
async function saveUserToDatabase(user, userData) {
    try {
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (!userSnap.exists()) {
            // New user - save their data
            await setDoc(userDoc, {
                uid: user.uid,
                name: userData.name || user.displayName,
                email: userData.email || user.email,
                photoURL: userData.photoURL || user.photoURL,
                provider: userData.provider || 'email',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                projects: [],
                preferences: {
                    theme: 'dark',
                    fontSize: 14,
                    autoSave: true
                }
            });
        } else {
            // Existing user - update last login
            await setDoc(userDoc, {
                lastLoginAt: serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        console.error('Error saving user to database:', error);
    }
}

// Show success message
function showSuccessMessage() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const successDiv = document.getElementById('authSuccess');
    
    if (signInForm && signUpForm && successDiv) {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'none';
        successDiv.style.display = 'block';
    }
}

// Proceed to editor after success
window.proceedToEditor = function() {
    closeAuthModal();
    // Redirect to main editor
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
};

// Handle authentication success
function handleAuthSuccess(user) {
    // If user is already authenticated and modal is open, show success
    if (isAuthModalOpen) {
        showSuccessMessage();
    }
}

// Validation functions
function validateSignUpForm(name, email, password, confirmPassword, agreeTerms) {
    clearErrors();
    let isValid = true;
    
    if (!name.trim()) {
        showError('Name is required', 'signUpForm');
        document.getElementById('signUpName').parentElement.classList.add('error');
        isValid = false;
    }
    
    if (!email.trim()) {
        showError('Email is required', 'signUpForm');
        document.getElementById('signUpEmail').parentElement.classList.add('error');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('Please enter a valid email address', 'signUpForm');
        document.getElementById('signUpEmail').parentElement.classList.add('error');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long', 'signUpForm');
        document.getElementById('signUpPassword').parentElement.classList.add('error');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match', 'signUpForm');
        document.getElementById('confirmPassword').parentElement.classList.add('error');
        isValid = false;
    }
    
    if (!agreeTerms) {
        showError('You must agree to the Terms of Service and Privacy Policy', 'signUpForm');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Error handling
function showError(message, formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Remove existing error messages
    const existingError = form.querySelector('.auth-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    
    // Insert error message at the top of the form
    form.insertBefore(errorDiv, form.firstChild);
    
    // Animate error message
    setTimeout(() => {
        errorDiv.style.animation = 'fadeInUp 0.3s ease';
    }, 10);
}

function clearErrors() {
    // Remove error messages
    const errorMessages = document.querySelectorAll('.auth-error-message');
    errorMessages.forEach(error => error.remove());
    
    // Remove error classes from inputs
    const errorInputs = document.querySelectorAll('.auth-input-wrapper.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

// Button loading state
function setButtonLoading(button, loading) {
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
        button.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
    } else {
        button.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

// Reset forms
function resetForms() {
    const forms = document.querySelectorAll('.auth-email-form');
    forms.forEach(form => form.reset());
    
    clearErrors();
    
    // Reset to sign in view
    showSignIn();
    
    // Hide success message
    const successDiv = document.getElementById('authSuccess');
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}

// Sign out function
window.signOutUser = async function() {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        // Redirect to landing page
        window.location.href = 'landingPage.html';
    } catch (error) {
        console.error('Sign out error:', error);
    }
};

// Check if user is authenticated (for use in other pages)
window.getCurrentUser = function() {
    return currentUser;
};

// Wait for authentication state
window.waitForAuth = function() {
    return new Promise((resolve) => {
        if (currentUser !== null) {
            resolve(currentUser);
        } else {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        }
    });
};

// Export for use in other modules
export {
    showAuthModal,
    closeAuthModal,
    signOutUser,
    getCurrentUser,
    waitForAuth
};