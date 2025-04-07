document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginform");
  const signupForm = document.getElementById("signupform");
  const container = document.querySelector(".container");

  // Toggle panel buttons (optional — only needed if you're using buttons to switch)
  const signUpButton = document.getElementById("signUp");
  const signInButton = document.getElementById("signIn");

  if (signUpButton && signInButton) {
    signUpButton.addEventListener("click", () => {
      container.classList.add("right-panel-active");
    });

    signInButton.addEventListener("click", () => {
      container.classList.remove("right-panel-active");
    });
  }

  // Handle Sign Up
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!name || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    // Save to localStorage (for demo purposes only)
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    alert("Account created successfully! Please login.");

    // Reset form and switch to login panel
    signupForm.reset();
    container.classList.remove("right-panel-active");
  });

  // Handle Login
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      alert(`Welcome back, ${storedUser.name}!`);
      // Redirect or show homepage content here
    } else {
      alert("Invalid email or password!");
    }

    loginForm.reset();
  });
});
