let loginForm = document.querySelector('.login-form');
let loginBtn = document.querySelector('.login-btn');

loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let inputs = document.querySelectorAll('.input');
    // Ensure all fields are filled
    if (!isFilled(inputs)) {
        return;
    } 
    else {
        loginForm.submit();
    }
});