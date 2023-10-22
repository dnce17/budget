let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let addBtn = document.querySelector('.add-btn');
let cancelBtn = document.querySelector('.cancel-btn');
let deleteBtn = document.querySelector('.delete-btn');

let bucketInputs = document.querySelectorAll('.bucket-input');
let allocations = document.querySelectorAll('.allocation');

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Check if all inputs are filled
    // for (let i = 0; i < bucketInputs.length; i++) {
    //     let input = bucketInputs[i];
    //     if (input.value.trim().length < 1) {
    //         input.setCustomValidity('Must not be empty');
    //         input.reportValidity();
    //         return;
    //     }
    // }

    // Check that the % not below/exceed 100
    // let total = 0;
    // allocations.forEach((amt) => {
    //     total += parseInt(amt.value);
    // });
    // if (total < 100 || total > 100) {
    //     saveBtn.setCustomValidity('% must equal to 100');
    //     saveBtn.reportValidity();
    //     return;
    // }

    // Remove ability to change input
    bucketInputs.forEach((input) => {
        input.classList.add('saved');
        input.readOnly = true;
    });

    // Submit form
    let bucketForm = document.querySelector('.bucket-form');
    bucketForm.submit();
});

editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    bucketInputs.forEach((input) => {
        input.classList.remove('saved');
        input.readOnly = false;
    });
});

addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketBody = document.querySelector('.bucket-body');
    let row = document.createElement('tr');
    row.innerHTML = '<td><input class="bucket-input" type="text" name="bucket" placeholder="Enter bucket name"></td><td><input class="bucket-input allocation" type="number" name="allocation" placeholder="Desired % allocation"></td>'
    bucketBody.appendChild(row);
});


cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    bucketInputs.forEach((input) => {
        input.classList.remove('saved');
        input.readOnly = false;
    });
});
