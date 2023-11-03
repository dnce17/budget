displayNameMoney();

// Prevent user from typing more than two decimal places
let inputs = document.querySelectorAll('.two-decimal');
inputs.forEach((input) => {
    input.addEventListener('keyup', () => {
        if (input.value.includes('.') && input.value.substring(input.value.indexOf('.') + 1) > 2) {
            input.value = Math.floor(input.value * 100) / 100;
        }
    })
});