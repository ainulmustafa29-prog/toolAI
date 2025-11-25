// Authentication System for AIVOROPRO
// Client-side authentication using localStorage

// User data structure in localStorage:
// - 'aivoropro_users': Array of user objects {email, password, name, createdAt}
// - 'aivoropro_current_user': Current logged-in user email

// Initialize authentication system
function initAuth() {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    } else {
        updateUIForLoggedOutUser();
    }
}

// Get all users from localStorage
function getAllUsers() {
    const users = localStorage.getItem('aivoropro_users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('aivoropro_users', JSON.stringify(users));
}

// Get current logged-in user
function getCurrentUser() {
    const email = localStorage.getItem('aivoropro_current_user');
    if (!email) return null;
    
    const users = getAllUsers();
    return users.find(user => user.email === email) || null;
}

// Set current logged-in user
function setCurrentUser(email) {
    if (email) {
        localStorage.setItem('aivoropro_current_user', email);
    } else {
        localStorage.removeItem('aivoropro_current_user');
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password (minimum 6 characters)
function validatePassword(password) {
    return password && password.length >= 6;
}

// Sign Up function
function signUp(email, password, name) {
    // Validate inputs
    if (!email || !password || !name) {
        return { success: false, message: 'Please fill in all fields.' };
    }
    
    if (!validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }
    
    if (!validatePassword(password)) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }
    
    // Check if user already exists
    const users = getAllUsers();
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists. Please sign in instead.' };
    }
    
    // Create new user
    const newUser = {
        email: email.toLowerCase(),
        password: password, // In production, this should be hashed
        name: name.trim(),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Automatically sign in the new user
    setCurrentUser(newUser.email);
    
    return { success: true, message: 'Account created successfully!', user: newUser };
}

// Sign In function
function signIn(email, password) {
    // Validate inputs
    if (!email || !password) {
        return { success: false, message: 'Please enter both email and password.' };
    }
    
    if (!validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }
    
    // Find user
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'No account found with this email. Please sign up first.' };
    }
    
    // Check password (in production, this should compare hashed passwords)
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }
    
    // Set current user
    setCurrentUser(user.email);
    
    return { success: true, message: 'Signed in successfully!', user: user };
}

// Sign Out function
function signOut() {
    setCurrentUser(null);
    updateUIForLoggedOutUser();
    return { success: true, message: 'Signed out successfully!' };
}

// Update UI for logged-in user
function updateUIForLoggedInUser(user) {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    
    if (authButtons) authButtons.classList.add('d-none');
    if (userProfile) {
        userProfile.classList.remove('d-none');
        userProfile.classList.add('d-flex');
    }
    if (userEmailDisplay) {
        userEmailDisplay.textContent = user.email;
    }
}

// Update UI for logged-out user
function updateUIForLoggedOutUser() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (authButtons) authButtons.classList.remove('d-none');
    if (userProfile) {
        userProfile.classList.add('d-none');
        userProfile.classList.remove('d-flex');
    }
}

// Handle Sign Up form submission
function handleSignUp(event) {
    event.preventDefault();
    
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const name = document.getElementById('signUpName').value.trim();
    const errorMsg = document.getElementById('signUpError');
    const successMsg = document.getElementById('signUpSuccess');
    const submitBtn = document.getElementById('signUpSubmitBtn');
    
    // Clear previous messages
    if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    }
    if (successMsg) {
        successMsg.textContent = '';
        successMsg.style.display = 'none';
    }
    
    // Disable button during processing
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
    }
    
    // Attempt sign up
    const result = signUp(email, password, name);
    
    if (result.success) {
        if (successMsg) {
            successMsg.textContent = result.message;
            successMsg.style.display = 'block';
        }
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }
        
        // Update UI
        updateUIForLoggedInUser(result.user);
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('signUpModal'));
            if (modal) modal.hide();
            
            // Reset form
            document.getElementById('signUpForm').reset();
            if (successMsg) {
                successMsg.textContent = '';
                successMsg.style.display = 'none';
            }
            if (errorMsg) {
                errorMsg.textContent = '';
                errorMsg.style.display = 'none';
            }
        }, 1500);
    } else {
        if (errorMsg) {
            errorMsg.textContent = result.message;
            errorMsg.style.display = 'block';
        }
        if (successMsg) {
            successMsg.textContent = '';
            successMsg.style.display = 'none';
        }
    }
    
    // Re-enable button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
    }
}

// Handle Sign In form submission
function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const errorMsg = document.getElementById('signInError');
    const successMsg = document.getElementById('signInSuccess');
    const submitBtn = document.getElementById('signInSubmitBtn');
    
    // Clear previous messages
    if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    }
    if (successMsg) {
        successMsg.textContent = '';
        successMsg.style.display = 'none';
    }
    
    // Disable button during processing
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';
    }
    
    // Attempt sign in
    const result = signIn(email, password);
    
    if (result.success) {
        if (successMsg) {
            successMsg.textContent = result.message;
            successMsg.style.display = 'block';
        }
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }
        
        // Update UI
        updateUIForLoggedInUser(result.user);
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('signInModal'));
            if (modal) modal.hide();
            
            // Reset form
            document.getElementById('signInForm').reset();
            if (successMsg) {
                successMsg.textContent = '';
                successMsg.style.display = 'none';
            }
            if (errorMsg) {
                errorMsg.textContent = '';
                errorMsg.style.display = 'none';
            }
        }, 1500);
    } else {
        if (errorMsg) {
            errorMsg.textContent = result.message;
            errorMsg.style.display = 'block';
        }
        if (successMsg) {
            successMsg.textContent = '';
            successMsg.style.display = 'none';
        }
    }
    
    // Re-enable button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
    }
}

// Handle Sign Out
function handleSignOut() {
    const result = signOut();
    if (result.success) {
        alert('You have been signed out successfully.');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for header to load
    setTimeout(() => {
        initAuth();
        
        // Attach event listeners
        const signUpForm = document.getElementById('signUpForm');
        const signInForm = document.getElementById('signInForm');
        const signOutBtn = document.getElementById('signOutBtn');
        const profileLink = document.getElementById('profileLink');
        
        if (signUpForm) {
            signUpForm.addEventListener('submit', handleSignUp);
        }
        
        if (signInForm) {
            signInForm.addEventListener('submit', handleSignIn);
        }
        
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleSignOut();
            });
        }
        
        if (profileLink) {
            profileLink.addEventListener('click', function(e) {
                e.preventDefault();
                const user = getCurrentUser();
                if (user) {
                    alert('Profile Page\n\nEmail: ' + user.email + '\nName: ' + user.name + '\nMember Since: ' + new Date(user.createdAt).toLocaleDateString());
                }
            });
        }
        
        // Switch between Sign In and Sign Up modals
        const switchToSignUp = document.getElementById('switchToSignUp');
        const switchToSignIn = document.getElementById('switchToSignIn');
        
        if (switchToSignUp) {
            switchToSignUp.addEventListener('click', function(e) {
                e.preventDefault();
                const signInModal = bootstrap.Modal.getInstance(document.getElementById('signInModal'));
                const signUpModal = new bootstrap.Modal(document.getElementById('signUpModal'));
                if (signInModal) signInModal.hide();
                signUpModal.show();
            });
        }
        
        if (switchToSignIn) {
            switchToSignIn.addEventListener('click', function(e) {
                e.preventDefault();
                const signUpModal = bootstrap.Modal.getInstance(document.getElementById('signUpModal'));
                const signInModal = new bootstrap.Modal(document.getElementById('signInModal'));
                if (signUpModal) signUpModal.hide();
                signInModal.show();
            });
        }
    }, 500);
});

// Export functions for global access
window.authSystem = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    initAuth,
    updateUIForLoggedInUser,
    updateUIForLoggedOutUser
};

