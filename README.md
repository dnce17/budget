# YOUR PROJECT TITLE
#### Video Demo:  <URL HERE>
#### Description:
TODO

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

# Templates (HTML) Files 

## layout.html
The layout.html consist of stylesheets, the navbar, and librarys that will be used for all the JS files. 

Flask-SocketIO will be used to communicate information from client to server and vice versa. Chart.JS will be used to display charts. There is also the helpers.js file that I made for functions that often get reused in JS files or long functions that I seperate from the other JS files for organizations and readability reasons 

## index.html
index.html is where the user can decide on the names of their money buckets, how much buckets, and the percentage of their balance that they want to allocate to each bucket. Once the user decides on their bucket name and percentage, a hoverable pie chart will be made to visually show the percentage of each bucket out of 100. 

If the user had already established their buckets and percent allocations, those will be displayed on the page as well as the pie chart. The user will also be able to edit the bucket names and percent allocations as desired. Once saved, the table and pie chart will update.

## monthly.html
monthly.html is where the user can establish each bucket's monthly budget. If the user had added their transactions in transaction.html, monthly.html will take those into account and calculate how much the user has spent so far for each bucket and the amount they can spend left for each bucket. The user can also check the same information on previous months with the dropdown.

A hoverable doughnut chart will be made for each bucket that has an established monthly budget, which displays how much the user has spent on that bucket (depicted as a percent in the doughnut's center and in dollars if user hovers over it) and how much left they can spend or the amount they went over that bucket's budget. 

The user will be able to edit each bucket's monthly budget as desired. Once saved, the table and doughnut chart will update. 

Deciding on the bucket's monthly budget is also not mandatory; the user can establish a monthly budget on none, some, or all of the buckts. 

## transaction.html
transaction.html is where the user can input how much they spend and what bucket that transaction falls under. Optionally, they can also add more specific details like whether if the transaction was for grocery, games, etc. The user can also add money to their balance here. All transactions will then appear in history.html. 

## history.html
history.html shows the transactions that the user has inputted from transaction.html, which includes the date and time. The user can also select the specific month and year that they want to see with the dropdown.

# Static Files

## index.js
index.js has the "DOMContentLoaded" event listener, which activates once the HTML page has been fully loaded; Once activated, it checks to see if there is any data (bucket names and percent allocations) on the page; if so, the names and percents will be used to create the pie chart. Click event listeners have been given to the edit, save, add row, delete, and cancel button on the page; the user can alter the bucket names and percent allocations at any time, which will automatically update the pie chart in turn.

The bucket names must all be unique and the total of the percents cannot exceed 100; an error message will show if these requirements are not met. If the info inputted checks out and is saved, the data is sent to the server and will be stored in the budget.db table.

## monthly.js