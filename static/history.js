displayNameMoney();

let dates = document.querySelector('.dates');

dates.addEventListener('change', () => {
    // console.log(dates.value);

    // Get the date = e.g. Dec 2023
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

        // console.log(month, yr);

        // display: none all of the rows that do not match the desired filter
        
        let displayedDate = document.querySelectorAll('.date');
        for (let i = 0; i < displayedDate.length; i++) {
            let m = displayedDate[i].textContent.slice(0, 2);
            let y = displayedDate[i].textContent.slice(-2);
            // console.log(m, y)
            if (m != month || y != yr) {
                console.log(displayedDate[i].textContent);
                displayedDate[i].parentElement.classList.add('hidden');
            }
            else {
                if (displayedDate[i].parentElement.classList.contains('hidden')) {
                    displayedDate[i].parentElement.classList.remove('hidden');
                }
            }
            // console.log(displayedDate[i].parentElement);
        }
    }
    
});