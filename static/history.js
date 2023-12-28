let dates = document.querySelector('.dates');
let row = document.querySelectorAll('.transaction-row');
let transactionBtn = document.querySelector('.transaction-history-btn');
let budgetBtn = document.querySelector('.budget-history-btn');

let transactionCtnr = document.querySelector('.history-ctnr');;
let lineChartCtnr = document.querySelector('.line-chart-ctnr');;
let lineChartCanvas = document.querySelector('.line-chart');

document.addEventListener("DOMContentLoaded", () => {
    // Make Line Chart
    socket.emit('data for line chart');
});

transactionBtn.addEventListener('click', () => {
    if (transactionCtnr.classList.contains('d-none')) {
        transactionCtnr.classList.remove('d-none');
        transactionCtnr.classList.add('d-flex');
        lineChartCtnr.classList.add('hidden');
    }
});

budgetBtn.addEventListener('click', () => {
    if (lineChartCtnr.classList.contains('hidden')) {
        transactionCtnr.classList.add('d-none');
        transactionCtnr.classList.remove('d-flex');
        lineChartCtnr.classList.remove('hidden');
    }
});

dates.addEventListener('change', () => {
    // Get the date (e.g. Dec 2023)
    if (dates.value.toLowerCase() == "all") {
        let rows = document.querySelectorAll('.transaction-row');
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].classList.contains('hidden')) {
                rows[i].classList.remove('hidden');
            }
        }
    }
    else {
        let date = new Date(dates.value);

        // Convert month to numerical month and get the last 2 yr of full year
        let month = date.getMonth() + 1;
        let yr = parseInt(String(date.getFullYear()).slice(-2));

        let displayedDate = document.querySelectorAll('.date');
        for (let i = 0; i < displayedDate.length; i++) {
            // Extract the numerical month and 2-digit yr from mm/dd/yy
            let m = displayedDate[i].textContent.slice(0, 2);
            let y = displayedDate[i].textContent.slice(-2);
            // Hide all rows that do not match desired filter
            if (m != month || y != yr) {
                displayedDate[i].parentElement.classList.add('hidden');
            }
            else {
                if (displayedDate[i].parentElement.classList.contains('hidden')) {
                    displayedDate[i].parentElement.classList.remove('hidden');
                }
            }
        }
    }

    // Make the last row that has no "hidden" class has the border-radius
    // Get the first instance of row that is not hidden, counting from bottom up
    let firstUnhidden = false;
    for (let i = row.length - 1; i >= 0; i--) { 
        if (row[i].children[0].classList.contains('bottom-left')) {
            row[i].children[0].classList.remove('bottom-left');
            row[i].children[row[i].children.length - 1].classList.remove('bottom-right');
        }

        if (!row[i].classList.contains('hidden')) {
            // Only add bottom left right formatting for the "last" row w/o hidden class
            if (!row[i].children[0].classList.contains('bottom-left') && firstUnhidden == false) {
                // console.log(row[i].children[0]);
                // console.log(row[i].children[row[i].children.length - 1]);
                row[i].children[0].classList.add('bottom-left');
                row[i].children[row[i].children.length - 1].classList.add('bottom-right');
                firstUnhidden = true;
            }
        }
    }
});

// Sockets
socket.on('data for line chart', function(data) {
    let [dates, totalSpent, totalOver] = [data[0], data[1], data[2]]
    makeLineChart(lineChartCtnr, lineChartCanvas, dates, totalSpent, totalOver);
});