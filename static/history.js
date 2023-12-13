// displayNameMoney();

let dates = document.querySelector('.dates');
let row = document.querySelectorAll('.transaction-row');

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
    for (let i = row.length - 1; i >= 0; i--) {     
        if (!row[i].classList.contains('hidden')) {
            // UNDER CONSTRUCTION: need to add style used for last row of tables
            break;
        }
    }
});