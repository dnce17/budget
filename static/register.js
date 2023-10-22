let registerForm = document.querySelector('.register-form');
let registerBtn = document.querySelector('.register-btn');

registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let inputs = document.querySelectorAll('.input');
    // Ensure all fields are filled
    if (!isFilled(inputs)) {
        return;
    } 
    else {
        registerForm.submit();
    }
});

fetch('/api/data')
    .then(res => res.json())
    .then(data => {
        if (data.includes('username taken')) {
            console.log('username taken');
            let username = document.querySelector('.username');
            username.autofocus = false;
            username.setCustomValidity('Username taken');
            username.reportValidity();

            username.addEventListener('keypress', () => {
                username.setCustomValidity('');
            })
        }
    });