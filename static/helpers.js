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
function sendToServer(dataToSend) {
    $.ajax({
        url: '/',
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