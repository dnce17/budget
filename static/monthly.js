displayNameMoney();

let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let monthLimit = document.querySelectorAll('.limit');

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketInputs = document.querySelectorAll('.bucket-input');
    let bucketNames = document.querySelectorAll('.bucket-name');

    // Remove the get started message
    let getStarted = document.querySelector('.get-started');
    if (!getStarted.textContent == '') {
        getStarted.textContent = '';
    }

    // Check that month limit does not exceed balance
    // monthLimit.forEach((amt) => {
    //     if (monthLimit.value )
    // });
    if (total < 100 || total > 100) {
        saveBtn.setCustomValidity('% must equal to 100');
        saveBtn.reportValidity();
        return;
    }

    // Send JS data to Python Flask Server
    sendToServer(data)

    // Remove ability to change input
    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(bucketInputs, true);

});

editBtn.addEventListener('click', (e) => {
    e.preventDefault();

    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(monthLimit, false);
});

cancelBtn.addEventListener('click', (e) => {
    let bucketForm = document.querySelector('.bucket-form');
    // To counteract the reportValidity of isFilled func, if activated
    bucketForm.noValidate = true;
});