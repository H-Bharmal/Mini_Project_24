
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
  
    if (registerForm) {
      registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const formObject = {};
        formData.forEach((value, key) => formObject[key] = value);
  
        const response = await fetch('http://localhost:8000/api/v1/user/registerUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formObject),
        });
        
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful!');
          window.location.href = 'login.html';
        } else {
          alert(`Registration failed: ${data.message}`);
        }
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const formObject = {};
        formData.forEach((value, key) => formObject[key] = value);
  
        const response = await fetch('http://localhost:8000/api/v1/user/loginUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formObject),
        });
        
        const data = await response.json();
        if (response.ok) {
          alert('Login successful!');
          // Redirect to another page or perform any desired action
        } else {
          alert(`Login failed: ${data.message}`);
        }
      });
    }
  });
  