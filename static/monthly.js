displayNameMoney();

let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let monthLimit = document.querySelectorAll('.limit');

saveBtn.addEventListener('click', (e) => {
    // e.preventDefault();
    // let bucketInputs = document.querySelectorAll('.bucket-input');
    // let limits = document.querySelectorAll('.limit');

    // // Check if total of all month limit exceed balance
    // let total = 0;
    // for (let i = 0; i < limits.length; i++) {
    //     total += parseFloat(limits[i].value);
    // }
    // console.log(total);

    // let itemNum = 0, data = {};
    // for (let i = 0; i < bucketInputs.length; i+=2) {
    //     data["item" + String(itemNum)] = [bucketInputs[i].value, bucketInputs[i + 1].value];
    //     itemNum++;
    // }

    // console.log(data);


    // Send JS data to Python Flask Server
    // sendToServer(data)

    // Remove ability to change input
    // layerOneBtns.classList.toggle('d-none');
    // layerTwoBtns.classList.toggle('d-none');
    // toggleBucketInputs(bucketInputs, true);
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