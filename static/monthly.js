// TO DO LATER - 
// DONE 1) if user ONLY delete a row from index and nothing else (MAYBE), save the monthly table in budget history
    // b/c monthly table will be of before delete
    // NOTE: there will likely be other considerations needed
    // Off top of my head, i believe you can just paste monthly code for saving and updating into index
// DONE: 2) ERROR: when going back to current when current table month limit has not been established
// DONE 3) Remove the edit button when going to noncurrent budget history
// DONE 4) edit is clicked and return once saved

// Minor
// 1) formatting in "remaining" column when remaining is exactly 0 
// 2) last row of history table when filtering
 
let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');
let graphBtn = document.querySelector('.graph-btn');

let layerOneBtns = document.querySelector('.first-layer-btns');
let layerTwoBtns = document.querySelector('.second-layer-btns');
let monthLimit = document.querySelectorAll('.limit');
let spending = document.querySelectorAll('.spending');
let balance = document.querySelector('.balance-amt');

let form = document.querySelector('.bucket-form');
let dates = document.querySelector('.dates');

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
            makeDoughnutChart(bucketNames, monthLimit, spending, remainingMoney, chartCtnr, JSON.parse(historyJSON));
        }
        getHistory();
    }
    else {
        console.log('No charts exist')
    }
});

function addBtnEvts() {
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
                makeDoughnutChart(bucketNames, monthLimit, spending, remainingMoney, chartCtnr, JSON.parse(historyJSON));
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
                makeDoughnutChart(bucketNames, monthLimit, spending, remainingMoney, chartCtnr, JSON.parse(historyJSON));
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
        toggleBucketInputs(limits, false);

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
}
addBtnEvts();

dates.addEventListener('change', (e) => {

    // Send month + yr to server to get desired budget history of that month
    if (dates.value == 'Current') {
        let d = new Date();
        d.setMonth(d.getMonth());
        current = d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear();
        socket.emit('get budget of date', current.split(' '));

        // Show the edit btn again when returning to "Current" (in case user changed history while save btn was shown)
        if (layerOneBtns.classList.contains('d-none')) {
            layerOneBtns.classList.toggle('d-none');
            layerTwoBtns.classList.toggle('d-none');
        }
    }
    else {
        socket.emit('get budget of date', dates.value.split(' '));
    }
})

socket.on('hide btns', function() {
    // Remove the btns if table is not current (remove ability to edit)
    let btnsCtnr = document.querySelector('.btns-ctnr');
    if (dates.value != 'Current') {
        btnsCtnr.classList.add('hidden');
    }
    else {
        btnsCtnr.classList.remove('hidden');
    }
})

socket.on('get budget of date', function(data) {

    socket.emit('hide btns');

    let emptyLimit = 0;
    for (let limit of data['past_budget']) {
        if (limit['month_limit'] == null) {
            emptyLimit++
        }
    }

    let table = document.querySelector('.bucket-body');
    let donutCtnr = document.querySelector('.donut-chart-ctnr');

    // Remove data on table and donut chart
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    while (donutCtnr.firstChild) {
        donutCtnr.removeChild(donutCtnr.firstChild);
    }

    // Determines the amt of rows (NOT amt of columns)
    for (let bucket of data['past_budget']) {
        // Make row
        let tr = document.createElement('tr');
        let columnAmt = 4;
        for (let i = 0; i < columnAmt; i++) {
            // Rows always have 4 columns, so need 4 td
            let td = document.createElement('td');
            let input;
            switch (i) {
                case 0:
                    input = createInput(['bucket-input', 'bucket-name', 'saved'], 'text', 'bucket', bucket['bucket_name']);
                    break;
                case 1:                    
                    // Ensure not null or else rest of code will not work
                    if (bucket['month_limit'] == null) {
                        bucket['month_limit'] = '';
                    }

                    input = bucket['month_limit'].length != 0
                            ? createInput(['bucket-input', 'limit', 'saved', 'int-only'], 'text', 'limit', '$' + thousandsFormat(bucket['month_limit']))
                            : createInput(['bucket-input', 'limit', 'saved', 'int-only'], 'text', 'limit');
                    break;
                case 2:
                    for (let name in data['expenses']) {
                        if (name == bucket['bucket_name']) {
                            input = bucket['month_limit'].length != 0 
                                    ? createInput(['spending', 'saved'], 'text', 'spending', dollarFormat(data['expenses'][name]))
                                    : createInput(['spending', 'saved'], 'text', 'spending');
                            break;
                        }
                    }
                    break;
                case 3:
                    for (let name in data['expenses']) {
                        if (name == bucket['bucket_name']) {
                            input = bucket['month_limit'].length != 0
                                    ? createInput(['remaining', 'saved'], 'text', 'remaining', dollarFormat(bucket['month_limit'] - data['expenses'][name]))
                                    : createInput(['remaining', 'saved'], 'text', 'remaining');
                            break;
                        }
                    }
            }
            td.appendChild(input);
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }

    // Create doughnut chart
    if (emptyLimit != data['past_budget'].length) {
        const chartCtnr = document.querySelector('.donut-chart-ctnr');
        let bucketNames = document.querySelectorAll('.bucket-name');
        let remainingMoney = document.querySelectorAll('.remaining');
        spending = document.querySelectorAll('.spending');
        monthLimit = document.querySelectorAll('.limit');
        makeDoughnutChart(bucketNames, monthLimit, spending, remainingMoney, chartCtnr, JSON.parse(JSON.stringify(data['expenses'])));
    }
});

// Credits
// https://github.com/chartjs/Chart.js/issues/9850 --> fixed issue with chart resizing
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Format to dollar and comma in number in thousands - https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings
// num to abbrev month - https://www.codingbeautydev.com/blog/javascript-get-month-short-name