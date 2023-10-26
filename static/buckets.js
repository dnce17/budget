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

document.addEventListener("DOMContentLoaded", () => {
    let bucketInputs = document.querySelectorAll('.bucket-input');

    let not_existing = 0;
    for (let i = 0; i < bucketInputs.length; i++) {
        if (!bucketInputs[i].classList.contains('existing')) {
            not_existing++;
            break;
        }
    }

    if (not_existing == 0) {
        console.log('chart made with existing data')

        // Don't perform below code if no previous user bucket data exist
    
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

    // Remove the get started message
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
    sendToServer(data)

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

});

editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketInputs = document.querySelectorAll('.bucket-input');

    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(bucketInputs, false);
});

addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketBody = document.querySelector('.bucket-body');
    let row = document.createElement('tr');
    row.innerHTML = '<td><input class="bucket-input bucket-name" type="text" name="bucket" placeholder="Enter bucket name"></td><td><input class="bucket-input allocation" type="number" name="allocation" placeholder="Desired % allocation"></td><td class="no-border"><input class="delete" type="hidden" value="-"></td>'
    bucketBody.appendChild(row);
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