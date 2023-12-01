displayNameMoney();

let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let monthLimit = document.querySelectorAll('.limit');
let balance = document.querySelector('.balance-amt');

let form = document.querySelector('.bucket-form');

let numInputs = document.querySelectorAll('.int-only');
intOnly(numInputs);

// fetch('/api/history')
//     .then(res => res.json())
//     .then(data => {
//         historyJSON = JSON.parse(data);
//         console.log(historyJSON);
//     });


// async function getHistory() {
//     const response = await fetch("/api/history");
//     historyJSON = await response.json();
//     console.log(historyJSON);
// }
// getHistory()

document.addEventListener("DOMContentLoaded", () => {
    console.log('reloaded')
    // Chart component
    const chartCtnr = document.querySelector('.donut-chart-ctnr');
    let remainingMoney = document.querySelectorAll('.remaining');
    let bucketNames = document.querySelectorAll('.bucket-name');

    // let remainingMoneyVals = []
    // for (let i = 0; i < remainingMoney.length; i++) {
    //     remainingMoneyVals[i] = remainingMoney[i].value.replace('$', '');
    // }

    let not_existing = 0;
    for (let i = 0; i < remainingMoney.length; i++) {
        console.log(remainingMoney[i])
        if (!remainingMoney[i].classList.contains('existing')) {
            not_existing++;
            // break;
        }
    }

    if (not_existing != bucketNames.length) {
        // console.log('chart made with existing data')
        // console.log(historyJSON);

        // Make doughnut chart
        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
    }
    else {
        console.log('no charts exist')
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

    // let remainingMoneyVals = []
    // for (let i = 0; i < remainingMoney.length; i++) {
    //     remainingMoneyVals[i] = remainingMoney[i].value.replace('$', '');
    // }

    // Check if total of all month limit exceed balance
    // let total = 0;
    // for (let i = 0; i < limits.length; i++) {
    //     if (!isNaN(limits[i].value) && limits[i].value != "") {
    //         console.log(limits[i].value + " is a number");
    //         total += parseFloat(limits[i].value);
    //     }
    // }
    // if (total > dollarToFloat(balance.textContent)) {
    //     saveBtn.setCustomValidity('Total of your spending limit exceeds your balance');
    //     saveBtn.reportValidity();
    //     return false;
    // }

    // Proceed if all good
    // Send JS data to Python Flask Server
    let itemNum = 0, data = {};
    for (let i = 0; i < bucketInputs.length; i+=2) {
        data["item" + String(itemNum)] = [bucketInputs[i].value, bucketInputs[i + 1].value];
        itemNum++;
    }
    sendToServer("/monthly", data);

    // form.submit();
    
    // Make doughnut chart
    // makeDoughnutChart(bucketNames, remainingMoney, limits, chartCtnr, JSON.parse(historyJSON));
    // async function getHistory() {
    //     const response = await fetch("/api/history");
    //     const historyJSON = await response.json();
    //     makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
    // }
    // getHistory();

    if (chartCtnr.children.length == 0) {
        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
        // console.log("chart done");
    }
    else {
        // console.log("else");
        while (chartCtnr.firstChild) {
            chartCtnr.removeChild(chartCtnr.firstChild);
        }

        async function getHistory() {
            const response = await fetch("/api/history");
            const historyJSON = await response.json();
            makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
        // console.log("chart remade");
    }
    
    
    // if (!chartCanvas.classList.contains('made')) {
    //     chart = makeChart(labelNames, labelAllocations, chartCanvas);
    //     chartCanvas.classList.toggle('made');
    //     console.log('chart made');
    // }
    // // Update chart if it exist already
    // else if (chartCanvas.classList.contains('made')) {
    //     chart.destroy();
    //     chart = makeChart(labelNames, labelAllocations, chartCanvas);
    //     console.log('chart updated');
    // }

    // Remove ability to change input
    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(limits, true);

    // Add back $ sign
    // limits = document.querySelectorAll('.limit');
    for (let i = 0; i < limits.length; i++) {
        // console.log(limits[i].value)
        // console.log(limits[i].value.length)
        if (limits[i].value.length > 0 && isNaN(limits[i].value) == false) {
            // console.log("this val is a num");
            limits[i].value = '$' + limits[i].value;
        }
    }
});

editBtn.addEventListener('click', (e) => {
    let limits = document.querySelectorAll('.limit');
    e.preventDefault();

    layerOneBtns.classList.toggle('d-none');
    layerTwoBtns.classList.toggle('d-none');
    toggleBucketInputs(monthLimit, false);

    for (let i = 0; i < limits.length; i++) {
        limits[i].value = limits[i].value.replace(',', '');
    }

    for (let i = 0; i < limits.length; i++) {
        limits[i].value = limits[i].value.replace('$', '');
        // console.log(allocations[i].value);
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
