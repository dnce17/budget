// displayNameMoney();

// TO DO LATER - 1) if user ONLY delete a row from index and nothing else (MAYBE), save the monthly table in budget history
// b/c monthly table will be of before delete
    // NOTE: there will likely be other considerations needed
// Off top of my head, i believe you can just paste monthly code for saving and updating into index
// 2) formatting in "remaining" column when remaining is exactly 0 
// 3) ERROR: when going back to current when current table month limit has not been established
// 4) Remove the edit button when going to noncurrent budget history
 
let saveBtn = document.querySelector('.save-btn');
let editBtn = document.querySelector('.edit-btn');
let cancelBtn = document.querySelector('.cancel-btn');

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
    console.log(data)
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


// TO ADD: make it only work if the dropdown menu value is current
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

// TEST
dates.addEventListener('change', (e) => {
    // UNDER CONSTRUCTION: Save empty table in case user go back to "Current" data with dropdown, but limits are not made yet
    // let emptyLimit = 0;
    // for (let limit of monthLimit) {
    //     if (!limit.value.length > 0) {
    //         emptyLimit++
    //     }
    // }
    
    // if (emptyLimit == monthLimit.length) {
    //     namesToSend = []
    //     let bucketNames = document.querySelectorAll('.bucket-name');
    //     for (let name of bucketNames) {
    //         namesToSend.push(name.value)
    //     }
    //     socket.emit('save empty current data', namesToSend)
    // }

    // Send month + yr to server to get desired budget history of that month
    if (dates.value == 'Current') {
        let d = new Date();
        d.setMonth(d.getMonth());
        current = d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear();
        socket.emit('get budget of date', current.split(' '));
    }
    else {
        socket.emit('get budget of date', dates.value.split(' '));
    }
})

socket.on('get budget of date', function(data) {
    let emptyLimit = 0;
    for (let limit of data['past_budget']) {
        if (limit['month_limit'] == null) {
            emptyLimit++
        }
    }
    // console.log(emptyLimit);

    let table = document.querySelector('.bucket-body');
    let donutCtnr = document.querySelector('.donut-chart-ctnr');
    let btnsCtnr = document.querySelector('.btns-ctnr');

    // Remove data on table and donut chart
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    while (donutCtnr.firstChild) {
        donutCtnr.removeChild(donutCtnr.firstChild);
    }

    // Determines the amt of rows (NOT amt of columns)
    for (let bucket of data['past_budget']) {
        // console.log(bucket)
        
        // Arbitrary: say there is 5 rows
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
                    // input = createInput(['bucket-input', 'limit', 'saved', 'int-only'], 'text', '$' + thousandsFormat(bucket['month_limit']));
                    // console.log(bucket['month_limit']);
                    input = bucket['month_limit'].length != 0
                            ? createInput(['bucket-input', 'limit', 'saved', 'int-only'], 'text', 'limit', '$' + thousandsFormat(bucket['month_limit']))
                            : createInput(['bucket-input', 'limit', 'saved', 'int-only'], 'text', 'limit');
                    break;
                case 2:
                    for (let name in data['expenses']) {
                        if (name == bucket['bucket_name']) {
                            // input = createInput(['spending', 'saved'], 'text', dollarFormat(data['expenses'][name]));
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
                            // input = createInput(['remaining', 'saved'], 'text', dollarFormat(bucket['month_limit'] - data['expenses'][name]));
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
        // console.log(tr);
    }

    // DO LATER: Remove buttons if current data shown is not this month's data

    // Create doughnut chart
    if (emptyLimit != data['past_budget'].length) {
        const chartCtnr = document.querySelector('.donut-chart-ctnr');
        let bucketNames = document.querySelectorAll('.bucket-name');
        let remainingMoney = document.querySelectorAll('.remaining');
        spending = document.querySelectorAll('.spending');
        monthLimit = document.querySelectorAll('.limit');
        // console.log(chartCtnr);
        // console.log(bucketNames);
        // console.log(remainingMoney);
        // console.log(JSON.stringify(data['expenses']));
        makeDoughnutChart(bucketNames, monthLimit, spending, remainingMoney, chartCtnr, JSON.parse(JSON.stringify(data['expenses'])));
    }
});

// Credits
// https://github.com/chartjs/Chart.js/issues/9850 --> fixed issue with chart resizing
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Format to dollar and comma in number in thousands - https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings
// num to abbrev month - https://www.codingbeautydev.com/blog/javascript-get-month-short-name
