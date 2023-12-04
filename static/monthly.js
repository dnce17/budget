displayNameMoney();

let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let monthLimit = document.querySelectorAll('.limit');
let spending = document.querySelectorAll('.spending');
let balance = document.querySelector('.balance-amt');

let form = document.querySelector('.bucket-form');

let numInputs = document.querySelectorAll('.int-only');
intOnly(numInputs);

document.addEventListener("DOMContentLoaded", () => {
    // Chart component
    const chartCtnr = document.querySelector('.donut-chart-ctnr');
    let remainingMoney = document.querySelectorAll('.remaining');
    let bucketNames = document.querySelectorAll('.bucket-name');

    let not_existing = 0;
    for (let i = 0; i < remainingMoney.length; i++) {
        if (!remainingMoney[i].classList.contains('existing')) {
            not_existing++;
        }
    }

    if (not_existing != bucketNames.length) {
        console.log('Chart made with existing data')
        // Make doughnut chart
        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
    }
    else {
        console.log('No charts exist')
    }
});

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let bucketInputs = document.querySelectorAll('.bucket-input');
    let limits = document.querySelectorAll('.limit');
    let balance = document.querySelector('.balance-amt');

    // Chart component
    const chartCtnr = document.querySelector('.donut-chart-ctnr');
    let remainingMoney = document.querySelectorAll('.remaining');
    let bucketNames = document.querySelectorAll('.bucket-name');

    // Send JS data to Python Flask Server
    let itemNum = 0, data = {};
    for (let i = 0; i < bucketInputs.length; i+=2) {
        data["item" + String(itemNum)] = [bucketInputs[i].value, bucketInputs[i + 1].value];
        itemNum++;
    }
    sendToServer("/monthly", data);

    if (chartCtnr.children.length == 0) {
        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
    }
    else {
        while (chartCtnr.firstChild) {
            chartCtnr.removeChild(chartCtnr.firstChild);
        }

        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
    }

    // Remove ability to change input
    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(limits, true);

    // Add back $ sign for month limit
    for (let i = 0; i < limits.length; i++) {
        // Delete input if just 0
        if (+limits[i].value == 0) {
            limits[i].value = '';
        } 
        else if (limits[i].value.length > 0 && isNaN(limits[i].value) == false) {
            limits[i].value = '$' + thousandsFormat(limits[i].value);
        }
    }

    // Making "Spent Thus Far" blank if month limit is deleted/blank
    for (let i = 0; i < monthLimit.length; i++) {
        if (!(monthLimit[i].value.length > 0)) {
            spending[i].value = '--';
        }
    }

});

editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let limits = document.querySelectorAll('.limit');

    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(monthLimit, false);

    for (let i = 0; i < limits.length; i++) {
        limits[i].value = limits[i].value.replace(',', '');
    }

    for (let i = 0; i < limits.length; i++) {
        limits[i].value = limits[i].value.replace('$', '');
    }
});

cancelBtn.addEventListener('click', (e) => {
    let bucketForm = document.querySelector('.bucket-form');
    // To counteract the reportValidity of isFilled func, if activated
    bucketForm.noValidate = true;
});


// Credits
// https://github.com/chartjs/Chart.js/issues/9850 --> fixed issue with chart resizing
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Format to dollar and comma in number in thousands - https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings
