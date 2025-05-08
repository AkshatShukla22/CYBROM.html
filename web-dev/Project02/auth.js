// auth.js
// Targeting inputs
let signup_name = document.getElementById("name");
let email = document.getElementById("email");
let number = document.getElementById("number");
let pass = document.getElementById("pass");
let copass = document.getElementById("co-pass");

let login_email = document.getElementById("login_email");
let login_pass = document.getElementById("login_pass");

// Targeting error messages
let errName = document.getElementById("err-name");
let errEmail = document.getElementById("err-email");
let errNumber = document.getElementById("err-number");
let errPass = document.getElementById("err-pass");
let errCopass = document.getElementById("err-copass");
let errLoginEmail = document.getElementById("err-login-email");
let errLoginPass = document.getElementById("err-login-pass");

// Targeting buttons for show/hide password
let showPass_login = document.querySelector("#showPass_login");
let showPass_signup = document.querySelector("#showPass_signup");

// Slider
let slider = document.getElementById("slider");
let isRight = true; 

// Error message
let error_1 = document.getElementById("error-1");
let error_2 = document.getElementById("error-2");
let error_3 = document.getElementById("error-3");
let error_4 = document.getElementById("error-4");
let error_5 = document.getElementById("error-5");
let error_6 = document.getElementById("error-6");
let error_7 = document.getElementById("error-7");

// Forms
let loginForm = document.querySelector(".login");
let signupForm = document.querySelector(".signup");

// Check if database instance is available, otherwise wait for it
let dbInstance = null;
function getDB() {
    if (window.db) {
        dbInstance = window.db;
        return dbInstance;
    } else {
        console.error("Database not initialized. Make sure db.js is loaded before auth.js");
        // Wait for db to be initialized
        return new Promise((resolve) => {
            let checkInterval = setInterval(() => {
                if (window.db) {
                    clearInterval(checkInterval);
                    dbInstance = window.db;
                    resolve(dbInstance);
                }
            }, 100);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Try to get the database instance
    dbInstance = await getDB();
    
    // Check if user is already logged in
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (currentUserEmail) {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        redirectLoggedInUser(isAdmin);
    }

    // Add animations to form elements
    animateFormElements();
});

// Add animations to form elements
function animateFormElements() {
    // Animate input fields on focus
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focus-animation');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focus-animation');
        });
    });

    // Add button hover animations
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', function() {
            this.classList.add('button-hover');
        });
        
        button.addEventListener('mouseout', function() {
            this.classList.remove('button-hover');
        });
    });
}

// Hide/Show password for Signup
function hideShow_signup() {
    if (pass.type === 'password') {
        pass.type = 'text';
        showPass_signup.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        pass.type = 'password';
        showPass_signup.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
    return false; 
}

// Hide/Show password for Login
function hideShow_login() {
    if (login_pass.type === 'password') {
        login_pass.type = 'text';
        showPass_login.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        login_pass.type = 'password';
        showPass_login.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
    return false;
}

// Function to show success message
function showSuccess(element, message, errorDiv) {
    element.textContent = message;
    errorDiv.style.display = "flex";
    errorDiv.style.color = "var(--success)";
    errorDiv.classList.add('slide-in-animation');
    
    setTimeout(() => {
        errorDiv.classList.remove('slide-in-animation');
        errorDiv.classList.add('slide-out-animation');
        
        setTimeout(() => {
            element.textContent = "";
            errorDiv.style.display = "none";
            errorDiv.classList.remove('slide-out-animation');
        }, 500);
    }, 4500);
}

// Function to show error message
function showError(element, message, inputElement, errorDiv) {
    element.textContent = message;
    inputElement.classList.add("error-input");
    errorDiv.style.display = "flex";
    errorDiv.classList.add('slide-in-animation');
    
    setTimeout(() => {
        errorDiv.classList.remove('slide-in-animation');
        errorDiv.classList.add('slide-out-animation');
        
        setTimeout(() => {
            element.textContent = "";
            errorDiv.style.display = "none";
            inputElement.classList.remove("error-input");
            errorDiv.classList.remove('slide-out-animation');
        }, 500);
    }, 4500);
}

// Function to redirect user after successful login
function redirectLoggedInUser(isAdmin) {
    if (isAdmin) {
        window.location.href = "admin.html";
    } else {
        window.location.href = "home.html";
    }
}

// Validate signup form
async function validate() {
    let isValid = true;
    
    // Basic form validation
    if (signup_name.value.trim() === "") {
        showError(errName, "Name is required", signup_name, error_3);
        isValid = false;
    }

    if (email.value.trim() === "") {
        showError(errEmail, "Email is required", email, error_4);
        isValid = false;
    } else if (!(email.value.includes("@") && email.value.includes(".com"))) {
        showError(errEmail, "Invalid email format", email, error_4);
        isValid = false;
    }

    if (number.value.trim() === "") {
        showError(errNumber, "Phone number is required", number, error_5);
        isValid = false;
    } else if (isNaN(number.value)) {
        showError(errNumber, "Phone number must contain only digits", number, error_5);
        isValid = false;
    } else if (number.value.length !== 10) {
        showError(errNumber, "Phone number must be 10 digits", number, error_5);
        isValid = false;
    }

    if (pass.value.trim() === "") {
        showError(errPass, "Password is required", pass, error_6);
        isValid = false;
    } else if (pass.value.length < 6) {
        showError(errPass, "Password should be at least 6 characters long", pass, error_6);
        isValid = false;
    } else {
        const hasDigit = /[0-9]/.test(pass.value);
        const hasSpecial = /[!@#$%^&*()_\-]/.test(pass.value);
        const hasUpperCase = /[A-Z]/.test(pass.value);
        const hasLowerCase = /[a-z]/.test(pass.value);
        
        if (!(hasDigit && hasSpecial && hasUpperCase && hasLowerCase)) {
            showError(errPass, "Password must include uppercase, lowercase, number, and special character", pass, error_6);
            isValid = false;
        }
    }

    if (copass.value.trim() === "") {
        showError(errCopass, "Please confirm your password", copass, error_7);
        isValid = false;
    } else if (copass.value !== pass.value) {
        showError(errCopass, "Passwords do not match", copass, error_7);
        copass.value = "";
        isValid = false;
    }

    // If all validations pass, proceed with signup
    if (isValid) {
        // Ensure database instance is available
        if (!dbInstance) {
            dbInstance = await getDB();
        }
        
        // Check if email already exists
        const existingUser = dbInstance.data.users.find(u => u.email === email.value.trim());
        if (existingUser) {
            showError(errEmail, "Email is already registered", email, error_4);
            return false;
        }
        
        // Create new user object
        const newUser = {
            name: signup_name.value.trim(),
            email: email.value.trim(),
            password: pass.value.trim(),
            phone: number.value.trim(),
            watchlist: [] // Initialize empty watchlist
        };
        
        // Save user to database
        const saved = dbInstance.saveUser(newUser);
        if (saved) {
            showSuccess(errCopass, "Registration successful! Please login.", error_7);
            
            // Apply success animation to form
            document.getElementById("signupForm").classList.add("success-animation");
            
            // Reset form
            setTimeout(() => {
                document.getElementById("signupForm").reset();
                document.getElementById("signupForm").classList.remove("success-animation");
                
                // Switch to login view
                isRight = false;
                Slider();
            }, 2000);
        } else {
            showError(errCopass, "Error saving user. Please try again.", copass, error_7);
        }
    }
    
    return false;
}

// Validate login form
async function validateLogin() {
    let isValid = true;
    
    // Basic form validation
    if (login_email.value.trim() === "") {
        showError(errLoginEmail, "Email is required", login_email, error_1);
        isValid = false;
    } else if (!(login_email.value.includes("@") && login_email.value.includes(".com"))) {
        showError(errLoginEmail, "Invalid email format", login_email, error_1);
        isValid = false;
    }
    
    if (login_pass.value.trim() === "") {
        showError(errLoginPass, "Password is required", login_pass, error_2);
        isValid = false;
    }
    
    // If basic validation passes, attempt login
    if (isValid) {
        // Ensure database instance is available
        if (!dbInstance) {
            dbInstance = await getDB();
        }
        
        const result = dbInstance.loginUser(login_email.value.trim(), login_pass.value.trim());
        
        if (result.success) {
            // Apply success animation to login form
            loginForm.classList.add("success-animation");
            
            showSuccess(errLoginPass, "Login successful! Redirecting...", error_2);
            
            // Short delay before redirect to show success message
            setTimeout(() => {
                redirectLoggedInUser(result.isAdmin);
            }, 2000);
        } else {
            // Check if email exists to provide specific error
            const userExists = dbInstance.data.users.some(u => u.email === login_email.value.trim());
            if (userExists) {
                showError(errLoginPass, "Incorrect password", login_pass, error_2);
                // Apply error shake animation
                login_pass.classList.add("shake-animation");
                setTimeout(() => {
                    login_pass.classList.remove("shake-animation");
                }, 500);
            } else {
                showError(errLoginEmail, "Email not registered", login_email, error_1);
                // Apply error shake animation
                login_email.classList.add("shake-animation");
                setTimeout(() => {
                    login_email.classList.remove("shake-animation");
                }, 500);
            }
        }
    }
    
    return false;
}

// Handle slider animation for login/signup toggle
function Slider() {
    if (isRight) {
        slider.classList.remove("right_slider");
        slider.classList.add("left_slider");
        slider.innerHTML = `
            <h1>Join Our Anime World!</h1>
            <span>Create an account to start your anime journey.</span>
            <div>
                <span>Already have an account? Slide to Login!</span>
                <button onclick="Slider()">Login</button>
            </div>
        `;
        loginForm.style.boxShadow = "none";
        signupForm.style.boxShadow = "0px 0px 20px #111827";
        
        // Add fade animations
        loginForm.classList.add("fade-out");
        signupForm.classList.add("fade-in");
        
        setTimeout(() => {
            loginForm.classList.remove("fade-out");
            signupForm.classList.remove("fade-in");
        }, 1000);
    } else {
        slider.classList.remove("left_slider");
        slider.classList.add("right_slider");
        slider.innerHTML = `
            <h1>Welcome Back!</h1>
            <span>Log in to continue your anime adventure.</span>
            <div>
                <span>New here? Sign up to discover amazing anime!</span>
                <button onclick="Slider()">Sign Up</button>
            </div>
        `;
        loginForm.style.boxShadow = "0px 0px 20px #111827";
        signupForm.style.boxShadow = "none";
        
        // Add fade animations
        loginForm.classList.add("fade-in");
        signupForm.classList.add("fade-out");
        
        setTimeout(() => {
            loginForm.classList.remove("fade-in");
            signupForm.classList.remove("fade-out");
        }, 1000);
    }
    isRight = !isRight;
}