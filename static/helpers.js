function isFilled(inputs) {
    // Check if all inputs are filled
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.value.trim().length < 1) {
            input.setCustomValidity('Must not be empty');
            input.reportValidity();
            return false;
        }
    }
    return true;
}

// NOTE: This activates the request.method == POST
function sendToServer(destination, dataToSend) {
    $.ajax({
        url: destination,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend)
    });
}

function toggleBucketInputs(inputs, bool) {
    inputs.forEach((input) => {
        input.classList.toggle('saved');
        input.readOnly = bool;
    });
}

function makeChart(labelNames, labelAllocations, chartCanvas) {
     // Create or update pie chart
    //  let labelNames = [], labelAllocations = [], colorsToUse = [];
    let colorsToUse = [];

     // CHECKPOINT: maybe make it more dynamic?
     let colors = [
         'rgb(255, 99, 132)',
         'rgb(54, 162, 235)',
         'rgb(255, 205, 86)',
         'rgb(218, 247, 166)',
         'rgb(255, 87, 51)',
         'rgb(88, 24, 69)',
         'rgb(100, 82, 86)'
     ]
 
    //  bucketNames.forEach((name) => {
    //      labelNames.push(name.value);
    //  })
    //  allocations.forEach((allocation) => {
    //      labelAllocations.push(allocation.value);
    //  })
     for (let i = 0; i < labelNames.length; i++) {
         colorsToUse.push(colors[i]);
     }
 
     let chart = new Chart(chartCanvas, {
         type: 'pie',
         data: {
             labels: labelNames,
             datasets: [{
                 // label: 'Money Buckets and Allocations',
                 data: labelAllocations,
                 backgroundColor: colorsToUse,
                 hoverOffset: 4
             }]
         },
         // plugins: [ChartDataLabels]
     });

     return chart;
}

function displayNameMoney() {
    let username = document.querySelector('.username');
    let balance = document.querySelector('.balance-amt');

    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            let arr = data.split(", ");
            let name = arr[0], money = arr[1];
            
            username.textContent = name;
            balance.textContent = money;
        });
}

function dollarToFloat(amt) {
    return parseFloat(amt.substring(1).replace(",", ""));
}

function intOnly(inputName) {
    for (let i = 0; i < inputName.length; i++) {
        inputName[i].addEventListener('keydown', (e) => {
            if ((isNaN(e.key) || e.key == " ") && e.key !== 'Backspace') {
                e.preventDefault();

                // Resolves glitch where space adds . and space still works 1x/2x even with restriction (unsure why)
                inputName[i].value = inputName[i].value.replace('.', '');
                inputName[i].value = inputName[i].value.replace(' ', '');
            }
        });
    }
}

// Format with $ and comma (as needed in long numbers)
function dollarFormat(amt) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return formatter.format(amt);
}

// Format with comma for long numbers
function thousandsFormat(amt) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
    });

    return formatter.format(amt);
}

function makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, historyJSON) {
    // Calculate amt left 
    for (let i = 0; i < remainingMoney.length; i++) {
        remainingMoney[i].value = monthLimit[i].value.replace('$', '');
        if (monthLimit[i].value.length > 0) {
            for (let key in historyJSON) {
                if (historyJSON[key].length > 0 && key == bucketNames[i].value) {
                    // Adjust money left for month based on history
                    remainingMoney[i].value = monthLimit[i].value.replace('$', '') - historyJSON[key][0];

                    // Format the $ inside - if remaining money is -
                    // Urary plus operator turns decimal/int str to num
                    // if (+remainingMoney[i].value < 0) {
                    //     remainingMoney[i].value = '-$' + remainingMoney[i].value.replace('-', '');
                    // } 
                    // else {
                    //     remainingMoney[i].value = '$' + remainingMoney[i].value;
                    // }
                    // remainingMoney[i].value = '$' + remainingMoney[i].value;
                }
            }
            // console.log("remainingMoney loop finished")
        }
    }
     
    // Add charts equal to which bucket has month limit decided
    for (let i = 0; i < bucketNames.length; i++) {
        let canvas = document.createElement('canvas');
        canvas.classList.add('chart');
        chartCtnr.appendChild(canvas);
    }
    
    const chartCanvas = document.querySelectorAll('.chart');
    for (let i = 0; i < chartCanvas.length; i++) {
        let chart = new Chart(chartCanvas[i], {
            type: 'doughnut',
            data: {
                datasets: [{
                label: 'My First Dataset',
                    data: [remainingMoney[i].value.replace('$', ''), monthLimit[i].value.replace('$', '') - remainingMoney[i].value.replace('$', '')],
                    // backgroundColor: [
                    //     'rgb(54, 162, 235)',
                    //     'aliceblue',
                    // ],
                    backgroundColor: (remainingMoney[i].value.replace('$', '') > 0) ? ['rgb(54, 162, 235)', 'aliceblue'] : ['white'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: bucketNames[i].value,
                        font: {
                            size: '15'
                        },
                        position: 'bottom',
                    },
                    doughnutLabel: {
                        labels: [
                            {
                                text: `${Math.round((remainingMoney[i].value.replace('$', '') / monthLimit[i].value.replace('$', '')) * 100)}%`,
                                font: {
                                    size: '20'
                                },
                                color: 'grey'
                            },
                        ]
                    }
                }
            },
        });
        // console.log('chart made');
    }

    // Format comma into thousands for remaining
    for (let i = 0; i < remainingMoney.length; i++) {
        if (+remainingMoney[i].value.length > 0) {
            if (+remainingMoney[i].value < 0) {
                remainingMoney[i].value = '-$' + thousandsFormat(remainingMoney[i].value.replace('-', ''));
            } 
            else {
                remainingMoney[i].value = '$' + thousandsFormat(remainingMoney[i].value);
            }
        }
    }

    // Format comma into thousands for month limit
    for (let i = 0; i < monthLimit.length; i++) {
        if (+monthLimit[i].value.length > 0) {
            monthLimit[i].value = '$' + thousandsFormat(monthLimit[i].value.replace('$', ''));
        }
    }
}

// Credits
// Urary operator - https://www.freecodecamp.org/news/how-to-convert-a-string-to-a-number-in-javascript/#:~:text=(quantity))%3B-,How%20to%20convert%20a%20string%20to%20a%20number%20in%20JavaScript,will%20go%20before%20the%20operand.&text=We%20can%20also%20use%20the,into%20a%20floating%20point%20number.
// Replacing multiple things - https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call
