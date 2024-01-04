# Budget Tracker
#### Video Demo:  https://www.youtube.com/watch?v=CYnscWEVpo8
#### Description: Budget your money and track spendings

# Purpose of My Project
My project is a money budget tracker. The user first decides on "money buckets" (e.g. Basic Needs, Entertainment, Savings), then they allocate a certain percentage of their balance to them and also a monthly budget for each bucket. For example, if the user has buckets consisting of Basic Needs, Entertainment, and Savings, they may decide to allocate 15%, 65%, and 20% of their balance to those buckets, respectively. In terms of monthly budget, the user may decide to spend no more than $250/month on Basic Needs and $500/month on Savings. 

As the user buys more things, they can add those transactions to this tracker; the tracker will track how much the user has spent and how much more they can spend for each bucket before going over their respective budget. 

## app.py
app.py contains various libraries that are needed for this program to function. This is the server that relays data to both the JS files (the clients) and HTML files, receives data from the clients, and get data from a sqlite3 database called budget.db. 

Data sent to the HTML files are often displayed right on the page. Data sent to the JS files are often used for calculations and other purposes that ultimately leads to something being displayed on the page like a pie or doughnut chart.

## db.py
This was used to make the tables needed in budget.db

## budget.db
This databases contains data that stores the bucket names of all users, the amount they allocate to each of them from their balance, each bucket's monthly budget, and transactions made. Data related to monthly budgets of buckets that had been made for previous months are saved and can be pulled up in monthly.html.

## helpers.py
This file contain functions that were used multiple times throughout app.py. Functions include determine if a number is a float and changing numbers to currency format

## requirement.txt
This file contains the essentials py librarys that are needed for the program to run

# Templates (HTML) Files / Static Files

## layout.html
The layout.html consist of stylesheets, the navbar, and librarys that will be used for all the JS files. 

Flask-SocketIO will be used to communicate information from client to server and vice versa. Chart.JS will be used to display charts. There is also the helpers.js file that I made for functions that often get reused in JS files or long functions that I seperate from the other JS files for organizations and readability reasons 

## index.html / index.js
index.html is where the user can decide on the names of their money buckets, how much buckets, and the percentage of their balance that they want to allocate to each bucket. Once the user decides on their bucket name and percentage, a hoverable pie chart will be made to visually show the percentage of each bucket out of 100. 

If the user had already established their buckets and percent allocations, those will be displayed on the page as well as the pie chart. The user will also be able to edit the bucket names and percent allocations as desired. Once saved, the table and pie chart will update.

index.js has the "DOMContentLoaded" event listener, which activates once the HTML page has been fully loaded; Once activated, it checks to see if there is any data (bucket names and percent allocations) on the page; if so, the names and percents will be used to create the pie chart. Click event listeners have been given to the edit, save, add row, delete, and cancel button on the page; the user can alter the bucket names and percent allocations at any time, which will automatically update the pie chart in turn and also data from the "budget_history" table of budget.db, so info related to monthly.html will be loaded correctly. 

The bucket names must all be unique and the total of the percents cannot exceed 100; an error message will show if these requirements are not met. If the info inputted checks out and is saved, the data is sent to the server and will be stored in the "buckets" table of budget.db.

## monthly.html / monthly.js
monthly.html is where the user can establish each bucket's monthly budget. If the user had added their transactions in transaction.html, monthly.html will take those into account and calculate how much the user has spent so far for each bucket and the amount they can spend left for each bucket. The user can also check the same info for previous months with the dropdown.

A hoverable doughnut chart will be made for each bucket that has an established monthly budget, which displays how much the user has spent on that bucket (depicted as a percent in the doughnut's center and in dollars if user hovers over it) and how much left they can spend or the amount they went over that bucket's budget. 

The user will be able to edit each bucket's monthly budget as desired. Once saved, the table and doughnut chart will update. Deciding on the bucket's monthly budget is also not mandatory; the user can establish a monthly budget on none, some, or all of the buckts. 

Currently, when the user saves data, that data is sent to the server using AJAX and JSON. However, when the user wants to view monthly budgets from past months, socket is used. I believe socket is the better choice for both task, but I did not stumble upon Flask-SocketIO while researching until quite deep into the project when most of the basic project functions had been made already. Since I am a beginner, I decided to leave the AJAX and JSON alone as a reminder of the many things I have learned throughout this project and how one task can be done in different ways

## transaction.html / transaction.js
transaction.html is where the user can input how much they spend and what bucket that transaction falls under. Optionally, they can also add more specific details like whether if the transaction was for grocery, games, etc. The user can also add money to their balance here. All transactions will then appear in history.html. 

transaction.js itself only has a function that ensures that the user is only able to enter floats limited to 2 decimal places and integers. The main purpose of this page is pressing buttons to add money to the balance and submitting transactions. The desired money to add and transaction is then sent to the server (app.py) to update the user's balance in the users table and add the transactions to the history table.

## history.html / history.js
history.html shows the transactions that the user has inputted from transaction.html, which includes the date and time.

history.js gives event listeners to the transaction history and monthly budget history button, allowing users to toggle between viewing the two histories. For transaction history, the user can also select the specific month and year that they want to see with the dropdown (that acts as a filter). For monthly budget history, the user can hover over the bars to see amount spent and amount over budget. 

Originally, the monthly budget history was placed in the monthly.html since I thought users may want to have the monthly budget table and line chart to compare side-by-side. But ultimately, I felt that would detract from the main focus of monthly.html, which was to establish the buckets' monthly budget alongside a doughnut chart representation of that. Hence, I believed it made more sense to place all history-related items in the history tab.

## helpers.js
Similar to helpers.py, this file contains functions that were made and placed here due to its repetitive uses and for the sake of making the JS files less crowded and more organized. Functions here include ones that ensure input is solely digits, creating various chart types, toggling things, and converting number to formats like currency and thousands. 

## socket.js
This file is placed in layout.html and simply contains "let socket = io();" to ensure all JS files can communicate with server if needed

## login.js
login.js contains a function to ensure all inputs are filled. Once the user submits, the info is sent to the server, which compares the username and password to data grabbed from the sqlite3 users table to ensure they match. 

## register.js 
register.js contains a function to ensure all inputs are filled. Once the user submits, the desired username is sent to the server to ensure that name is not taken. The server communicates to the client that the username is taken through fetch and JSON with the data.json. The user is redirected to login.html if register is successful.

## history.json
This file is used to communicate data b/w server and client. The server totals up the transactions for the current month and puts them into history.json. While the server is totaling these values, async/await and fetch is used to avoid further code from being executed until the server is done. Once done, values in history.json is used to calculate for each bucket, the total that the user has spent for the month, the amount that can be spent left before the budget is reached, and doughnut charts. 

I debated on switching to socket after discovering it much later on in the project after already creating the JSON functionality. Since I am a beginner, I decided to leave it as a reminder of my learning experiences, things I could do better in the future, and to show how one task can be done in different ways. 

## data.json
data.json sends the desired username to the server when users attempt to register a new account to determine if the name has been taken. If the username grabbed from the sqlite3 users table is greater than 0, that means the name is taken since nothing should have  returned from the table if the name did not exist. If the username is taken, that info is sent to data.json which is then communicated to the register client through fetch. If the name is not taken, the person is redirected to the login page where they can now log in and a registration success message is shown.

This file was also originally used to send the username and balance to the client to display on all pages, that is, until I learned about saving the username and balance in the session for easier access from a Stack Overflow post. Hence, the session was used instead. 

Like before, I wanted to changed the use of JSON to socket, but decided to leave it for the same reasons mentioned before

