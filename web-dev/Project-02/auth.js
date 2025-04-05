const signUpBtn = document.getElementById('signUp');
const signInBtn = document.getElementById('signIn');
const container = document.getElementById('container');

signUpBtn.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInBtn.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email);

    if (userExists) {
      alert('User already exists!');
      return;
    }

    users.push({ name, email, password, role: email.includes('admin@') ? 'admin' : 'user' });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Signup successful! Please log in.');
    container.classList.remove("right-panel-active");
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert('Invalid credentials!');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    alert(`Welcome ${user.role === 'admin' ? 'Admin' : user.name}!`);
    window.location.href = user.role === 'admin' ? '../admin-dashboard.html' : '../browse.html';
  });
}
