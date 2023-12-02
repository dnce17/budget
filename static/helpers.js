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
    let workingKeys = ['Backspace', 'ArrowLeft', 'ArrowRight']

    for (let i = 0; i < inputName.length; i++) {
        inputName[i].addEventListener('keydown', (e) => {
            // if ((isNaN(e.key) || e.key == ' ') && e.key !== 'Backspace') {
                if ((isNaN(e.key) || e.key == ' ') && !workingKeys.includes(e.key)) {
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
         'rgb(100, 82, 86)',
         'rgb(0, 182, 144)',
         'rgb(0, 0, 255)',
         'rgb(255, 0, 255)'
     ]
 
    //  bucketNames.forEach((name) => {
    //      labelNames.push(name.value);
    //  })
    //  allocations.forEach((allocation) => {
    //      labelAllocations.push(allocation.value);
    //  })
     for (let i = 0; i < labelNames.length; i++) {
         colorsToUse.push(colors[i]);

        // Add val to rgb if labelNames.length is beyond amt in color array
        if (i > colors.length) {
            // Define fixed values to add +25 to for rgb
            // For each value over colors.length
        }

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
         options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => {
                            // console.log(context);
                            return context.dataset.data[context.dataIndex] + '%';
                        }
                    }
                }
            }
        }
         // plugins: [ChartDataLabels]
     });

     return chart;
}

// NOTE: this function does more than 1 thing = BAD!!
function makeDoughnutChart(bucketNames, remainingMoney, monthLimit, chartCtnr, historyJSON) {
    // Calculate amt left 
    for (let i = 0; i < remainingMoney.length; i++) {
        // Start from a clean slate
        remainingMoney[i].value = monthLimit[i].value.replace(/[$,]/ig, '');

        if (monthLimit[i].value.length > 0) {
            for (let key in historyJSON) {
                if (historyJSON[key].length > 0 && key == bucketNames[i].value) {
                    // Adjust money left for month based on history
                    remainingMoney[i].value = monthLimit[i].value.replace(/[$,]/ig, '') - historyJSON[key][0];

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

    // Calculate total spent
    for (let i = 0; i < monthLimit.length; i++) {
        if (monthLimit[i].value.length > 0) {
            spending[i].value = dollarFormat(monthLimit[i].value.replace(/[$,]/ig, '') - remainingMoney[i].value.replace(/$,/ig, ''));
        }
    }

    // Add charts equal to which bucket has month limit decided

    // PSEUDO
    // Only create chart if the value for monthLimit input is > 0
    console.log(monthLimit);

    for (let i = 0; i < bucketNames.length; i++) {
        let canvas = document.createElement('canvas');
        canvas.classList.add('chart');
        chartCtnr.appendChild(canvas);
    }

    // Don't create charts based on amt of charts, but total bucketNames b/c [i] will be mixed up
    const chartCanvas = document.querySelectorAll('.chart');
    for (let i = 0; i < monthLimit.length; i++) {
        if (monthLimit[i].value.length > 0) {
            let chart = new Chart(chartCanvas[i], {
                type: 'doughnut',
                data: {
                    datasets: [{
                    label: 'My First Dataset',
                        data: [remainingMoney[i].value.replace(/[$,]/ig, ''), monthLimit[i].value.replace(/[$,]/ig, '') - remainingMoney[i].value.replace(/[$,]/ig, '')],
                        // backgroundColor: [
                        //     'rgb(54, 162, 235)',
                        //     'aliceblue',
                        // ],
                        backgroundColor: (remainingMoney[i].value.replace(/[$,]/ig, '') > 0) ? ['rgb(54, 162, 235)', 'aliceblue'] : ['white'],
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
                                    text: `${Math.round((remainingMoney[i].value.replace(/[$,]/ig, '') / monthLimit[i].value.replace(/[$,]/ig, '')) * 100)}%`,
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
        }
        // console.log('chart made');
    }

    // Hide the charts that do not have a width/height
    for (let i = 0; i < chartCanvas.length; i++) {
        if (chartCanvas[i].style.width == '') {
            console.log('no width');
            chartCanvas[i].classList.add('hidden');
        }
    }

    // Format comma into thousands for remaining
    for (let i = 0; i < remainingMoney.length; i++) {
        if (!(+monthLimit[i].value.length > 0)) {
            console.log("nothing")
            remainingMoney[i].value = '--';
        }

        if (+remainingMoney[i].value.length > 0) {
            if (+remainingMoney[i].value < 0) {
                console.log(remainingMoney[i].value)
                remainingMoney[i].value = '-' + dollarFormat(remainingMoney[i].value.replace('-', ''));
            } 
            else if (remainingMoney[i].value > 0) {
                console.log(remainingMoney[i].value)
                remainingMoney[i].value = dollarFormat(remainingMoney[i].value);
            }
        }
    }

    // Format comma into thousands for month limit
    // for (let i = 0; i < monthLimit.length; i++) {
    //     if (+monthLimit[i].value.length > 0) {
    //         monthLimit[i].value = '$' + thousandsFormat(monthLimit[i].value.replace('$', ''));
    //     }
    // }
}

// Credits
// Urary operator - https://www.freecodecamp.org/news/how-to-convert-a-string-to-a-number-in-javascript/#:~:text=(quantity))%3B-,How%20to%20convert%20a%20string%20to%20a%20number%20in%20JavaScript,will%20go%20before%20the%20operand.&text=We%20can%20also%20use%20the,into%20a%20floating%20point%20number.
// Replacing multiple things - https://stackoverflow.com/questions/16576983/replace-multiple-characters-in-one-replace-call
