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

// Credit
// https://stackoverflow.com/questions/41259253/how-to-round-down-number-2-decimal-places
// https://sabe.io/blog/javascript-get-substring-after-specific-character