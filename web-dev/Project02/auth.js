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

//Slider
let slider = document.getElementById("slider");

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

function validate() {
    let isValid = true;
    let user_email = localStorage.getItem("Email");

    if (signup_name.value.trim() === "") {
        errName.textContent = "Name is required";
        signup_name.classList.add("error-input");
        isValid = false;
    }
    else {
        errName.textContent = "";
        signup_name.classList.remove("error-input");
        localStorage.setItem("User_Name", signup_name.value.trim());
    }

    if (email.value.trim() === "") {
        errEmail.textContent = "Email is required";
        email.classList.add("error-input");
        isValid = false;
    } 
    else if (!(email.value.includes("@") && email.value.includes(".com"))) {
        errEmail.textContent = "Invalid email";
        email.classList.add("error-input");
        isValid = false;
    } 
    else if(user_email === email.value.trim()){
      errEmail.textContent = "Email is alredy registered";
        email.classList.add("error-input");
        isValid = false;
    }
    else {
        errEmail.textContent = "";
        email.classList.remove("error-input");
        localStorage.setItem("Email", email.value.trim());
    }

    if (number.value.trim() === "") {
        errNumber.textContent = "Number is required";
        number.classList.add("error-input");
        isValid = false;
    } 
    else if (isNaN(number.value)) {
        errNumber.textContent = "Invalid number";
        number.classList.add("error-input");
        isValid = false;
    } 
    else if (number.value.length !== 10) {
        errNumber.textContent = "Invalid length of number";
        number.classList.add("error-input");
        isValid = false;
    } 
    else {
        errNumber.textContent = "";
        number.classList.remove("error-input");
        localStorage.setItem("Phone_Number", number.value.trim());
    }

    if (pass.value.trim() === "") {
        errPass.textContent = "Password is required";
        pass.classList.add("error-input");
        isValid = false;
    } 
    else if (pass.value.length < 6) {
        errPass.textContent = "Password should be at least 6 characters long";
        pass.classList.add("error-input");
        isValid = false;
    }
    else {
        const hasDigit = /[0-9]/.test(pass.value);
        const hasSpecial = /[!@#$%^&*()_\-]/.test(pass.value);
        const hasUpperCase = /[A-Z]/.test(pass.value);
        const hasLowerCase = /[a-z]/.test(pass.value);
        
        if (!(hasDigit && hasSpecial && hasUpperCase && hasLowerCase)) {
            errPass.textContent = "Password is too weak. Include uppercase, lowercase, number, and special character.";
            pass.classList.add("error-input");
            isValid = false;
        } else {
            errPass.textContent = "";
            pass.classList.remove("error-input");
        }
    }

    if (copass.value.trim() === "") {
        errCopass.textContent = "Please confirm password";
        copass.classList.add("error-input");
        isValid = false;
    } 
    else if (copass.value !== pass.value) {
        errCopass.textContent = "Passwords do not match";
        copass.classList.add("error-input");
        copass.value = "";
        copass.focus();
        isValid = false;
    } 
    else {
        errCopass.textContent = "";
        copass.classList.remove("error-input");
        localStorage.setItem("Password", copass.value.trim())
    }

    return false; 
}

function validateLogin() {
    let isValid = true;
    let user_email = localStorage.getItem("Email");
    let user_pass = localStorage.getItem("Password");

    
    if (login_email.value.trim() === "") {
        errLoginEmail.textContent = "Email is required";
        login_email.classList.add("error-input");
        isValid = false;
    } 
    else if (!(login_email.value.includes("@") && login_email.value.includes(".com"))) {
        errLoginEmail.textContent = "Invalid email";
        login_email.classList.add("error-input");
        isValid = false;
    } 
    else {
        if(user_email === login_email.value.trim()){
          errLoginEmail.textContent = "";
          login_email.classList.remove("error-input");
        }
        else{
          errLoginEmail.textContent = "Email not registered";
          login_email.classList.add("error-input");
          isValid = false;
        }
    }
    
    if (login_pass.value.trim() === "") {
        errLoginPass.textContent = "Password is required";
        login_pass.classList.add("error-input");
        isValid = false;
    } 
    else {
        if(user_pass === login_pass.value.trim()){
          errLoginPass.textContent = "";
          login_pass.classList.remove("error-input");
          alert("loged in");
        }
        else{
          errLoginPass.textContent = "Incorrect Password";
          login_pass.classList.add("error-input");
          isValid = false;
        }
    }
    
    return false;
}

let isRight = true; // Start at right

function Slider() {
  if (isRight) {
    // If it's on the right, move it to the left
    slider.classList.remove("right_slider");
    slider.classList.add("left_slider");
  } else {
    // If it's on the left, move it to the right
    slider.classList.remove("left_slider");
    slider.classList.add("right_slider");
  }
  isRight = !isRight; // Flip the state (true -> false or false -> true)
}
