let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let addBtn = document.querySelector('.add-btn');
let cancelBtn = document.querySelector('.cancel-btn');
let showDeleteBtn = document.querySelector('.delete-btn');
let backBtn = document.querySelector('.back-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let layerThreeBtns = document.querySelector('.third-layer-btns');

const chartCtnr = document.querySelector('.chart-ctnr');
const chartCanvas = document.querySelector('.pie-chart');
let chart;

let numInputs = document.querySelectorAll('.int-only');
intOnly(numInputs);

document.addEventListener("DOMContentLoaded", () => {
    let bucketInputs = document.querySelectorAll('.bucket-input');

    let not_existing = 0;
    for (let i = 0; i < bucketInputs.length; i++) {
        if (!bucketInputs[i].classList.contains('existing')) {
            not_existing++;
            break;
        }
    }

    // Check if previous data (bucket name + allocation) exist for user
    if (not_existing == 0) {
        console.log('chart made with existing data')
        let existingData = document.querySelectorAll('.existing');
        let bucketNames = [], allocations = [];
    
        for (let i = 0; i < existingData.length; i++) {
            if (i % 2 == 0) {
                bucketNames.push(existingData[i].value);
            }
            else {
                allocations.push(existingData[i].value);
            }
        }

        // Remove % to allow calculations
        for (let i = 0; i < allocations.length; i++) {
            allocations[i] = allocations[i].replace('%', '');
        }
    
        chart = makeChart(bucketNames, allocations, chartCanvas);
    }
    else {
        console.log('no charts exist')
    }
});


saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketInputs = document.querySelectorAll('.bucket-input');
    let allocations = document.querySelectorAll('.allocation');
    let bucketNames = document.querySelectorAll('.bucket-name');
    let forUse = document.querySelectorAll('.for-use');
    let balance = document.querySelector('.balance-amt');

    // Remove "get started" message
    let getStarted = document.querySelector('.get-started');
    if (!getStarted.textContent == '') {
        getStarted.textContent = '';
    }

    // Check if all inputs are filled
    if (isFilled(bucketInputs) == false) {
        return;
    }

    // Check that the % not below/exceed 100
    let total = 0;
    allocations.forEach((amt) => {
        total += parseInt(amt.value);
    });
    if (total < 100 || total > 100) {
        saveBtn.setCustomValidity('% must equal to 100');
        saveBtn.reportValidity();
        return;
    }

    let itemNum = 0, data = {};
    for (let i = 0; i < bucketInputs.length; i+=2) {
        data["item" + String(itemNum)] = [bucketInputs[i].value, bucketInputs[i + 1].value];
        itemNum++;
    }

    // Send JS data to Python Flask Server
    sendToServer("/", data)

    // Remove ability to change input
    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(bucketInputs, true);
    
    // Create chart
    let labelNames = [], labelAllocations = [];

    bucketNames.forEach((name) => {
        labelNames.push(name.value);
    })
    allocations.forEach((allocation) => {
        labelAllocations.push(allocation.value);
    })

    if (!chartCanvas.classList.contains('made')) {
        chart = makeChart(labelNames, labelAllocations, chartCanvas);
        chartCanvas.classList.toggle('made');
        console.log('chart made');
    }
    // Update chart if it exist already
    else if (chartCanvas.classList.contains('made')) {
        chart.destroy();
        chart = makeChart(labelNames, labelAllocations, chartCanvas);
        console.log('chart updated');
    }

    // Update the money available for use
    for (let i = 0; i < allocations.length; i++) {
        // Removes , and $ to get the float
        let extractedFloat = dollarToFloat(balance.textContent);

        let available = (allocations[i].value / 100) * extractedFloat;
        forUse[i].value = dollarFormat(available);
    }

    // Add back % sign after input is done (Must be last or else error occur)
    for (let i = 0; i < allocations.length; i++) {
        allocations[i].value = allocations[i].value + '%';
    }
});

editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketInputs = document.querySelectorAll('.bucket-input');
    let allocations = document.querySelectorAll('.allocation');
    
    for (let i = 0; i < allocations.length; i++) {
        allocations[i].value = allocations[i].value.replace('%', '');
    }

    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(bucketInputs, false);
});

addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketBody = document.querySelector('.bucket-body');
    let row = document.createElement('tr');

    // Max rows set to 10
    if (bucketBody.children.length < 10) {
        row.innerHTML = '<td><input class="bucket-input bucket-name" type="text" name="bucket" placeholder="Enter bucket name"></td><td><input class="bucket-input allocation" type="text" inputmode="numeric" name="allocation" placeholder="Desired % allocation"></td><td><input class="for-use saved" type="text" name="for-use" placeholder="--" readonly></td><td class="no-border"><input class="delete" type="hidden" value="-"></td>'   
        bucketBody.appendChild(row);
    }
    else {
        addBtn.setCustomValidity('Max row amount is 10');
        addBtn.reportValidity();
    }
});

cancelBtn.addEventListener('click', (e) => {
    let bucketForm = document.querySelector('.bucket-form');
    // To counteract the reportValidity of isFilled func, if activated
    bucketForm.noValidate = true;
});

showDeleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let deleteBtns = document.querySelectorAll('.delete');
    deleteBtns.forEach((del) => {
        del.type = "button";
        del.addEventListener('click', () => {
            del.parentElement.parentElement.remove();
        });
    });

    layerTwoBtns.classList.toggle('d-none');
    layerThreeBtns.classList.toggle('d-none');
});

backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let deleteBtns = document.querySelectorAll('.delete');

    deleteBtns.forEach((del) => {
        del.type = "hidden";
    });

    layerTwoBtns.classList.toggle('d-none');
    layerThreeBtns.classList.toggle('d-none');
});


// NOTE to self
    // preventDefault also changes the value of "this" also

// Credit
// https://chartjs-plugin-datalabels.netlify.app/guide/labels.html#multiple-labels
// https://quickchart.io/documentation/chart-js/custom-pie-doughnut-chart-labels/