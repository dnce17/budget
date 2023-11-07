# Started 10/17/23

from flask import Flask, redirect, render_template, request, session, g, flash, jsonify
from flask_session import Session
from cs50 import SQL
from werkzeug.security import check_password_hash, generate_password_hash
import json
from datetime import datetime
from pytz import timezone

from helpers import login_required, is_float, usd

app = Flask(__name__)
app.jinja_env.auto_reload = True

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session --> Ensures store session info on server itself (e.g. shopping cart)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Connect database
db = SQL("sqlite:///budget.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    if request.method == "POST":
        # Save the data and update the database
        data = request.get_json(silent=True)
        if data is not None:
            existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
            if existing:
                db.execute("DELETE FROM buckets WHERE owner_id = ?", session["user_id"])

            for bucket in data:
                db.execute("INSERT INTO buckets (owner_id, name, percent_allocation) VALUES (?, ?, ?)", 
                    session["user_id"],
                    data[bucket][0], 
                    data[bucket][1]
                )
            # existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
            # if existing:
            #     for bucket in data:
            #         db.execute("UPDATE buckets SET name = ?, percent_allocation = ? WHERE owner_id = ?", 
            #             data[bucket][0],
            #             data[bucket][1],
            #             session["user_id"]
            #         )
            # else:
            #     for bucket in data:
            #         db.execute("INSERT INTO buckets (owner_id, name, percent_allocation) VALUES (?, ?, ?)", 
            #             session["user_id"],
            #             data[bucket][0], 
            #             data[bucket][1]
            #         )

        print("data received and bucket updated")

        return redirect("/")
    else:
        # Load username and balance
        username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"].capitalize()
        money = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]

        # Load user's categories and % allocation, if exist
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        if existing:
            return render_template("index.html", existing=existing, username=username, balance=usd(money), money=money, usd=usd)

        return render_template("index.html", username=username, balance=usd(money))
    
# COME BACK TO LATER 
@app.route("/monthly", methods=["GET", "POST"])
@login_required
def monthly():
    if request.method == "POST":
        # if request.form.get("save"):
        #     buckets = request.form.getlist("bucket")
        #     limits = request.form.getlist("limit")

        #     for bucket, val in zip(buckets, limits):
        #         print(bucket, val)
        #         db.execute("UPDATE buckets SET month_limit = ? WHERE name = ?", 
        #             val,
        #             bucket
        #         )
        
        data = request.get_json(silent=True)
        if data is not None:
            for bucket in data:
                db.execute("UPDATE buckets SET month_limit = ? WHERE name = ? and owner_id = ?",
                    data[bucket][1], 
                    data[bucket][0],
                    session["user_id"]
                )

        return redirect("/monthly")

    else:
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        money = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"] 
        if existing:
            # Adjust amt left for month based on history - CHECKPOINT
            transactions = db.execute("SELECT * FROM history WHERE owner_id = ?", session["user_id"])
            current_month = datetime.now().strftime("%m")
            
            # print(transactions)
            expenses = {}
            for bucket in existing:
                expenses[bucket["name"]] = []
            for transaction in transactions:
                if transaction["item_type"] != "Deposit" and transaction["bucket"] in expenses:
                    # expenses[transaction["bucket"]].append(transaction["amt"])]
                    if len(expenses[transaction["bucket"]]) > 0:
                        expenses[transaction["bucket"]][0] += transaction["amt"]
                    else:
                        expenses[transaction["bucket"]].append(transaction["amt"])
            print(expenses)

            # REMOVE money and usd, might not be needed
            return render_template("monthly.html", existing=existing, money=money, usd=usd, expenses=expenses)

        return render_template("monthly.html")
    
    
@app.route("/login", methods=["GET", "POST"])
def login():
    # Forget any user_id, but remember any flash messages
    if session.get("_flashes"):
        flashes = session.get("_flashes")
        session.clear()
        session["_flashes"] = flashes
    else:
        session.clear()

    if request.method == "POST":
        # Query database for username
        username = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username").lower()
        )

        # Ensure username exists and password is correct
        if len(username) != 1 or not check_password_hash(username[0]["hash"], request.form.get("password")):
            flash("Invalid username and/or password")
            return redirect("/login")

        # Remember which user has logged in
        session["user_id"] = username[0]["id"]

        # Send username + money for JS to display on all pages
        money = db.execute(
            "SELECT money FROM users WHERE username = ?", request.form.get("username").lower()
        )
        file = open("static/data.json", "w")
        file.write(f"{username[0]['username'].capitalize()}, {usd(money[0]['money'])}")

        # Redirect user to home page
        return redirect("/")
    else:
        return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    # Clear JSON file
    file = open("static/data.json", "w")
    file.write("")

    if request.method == "POST":
        # Check if username already exist
        username = request.form.get("username").lower()
        password = request.form.get("password")
        check_username = db.execute("SELECT username FROM users WHERE username = ?", username)
        
        if len(check_username) > 0:
            file.write("username taken")
            return render_template("register.html", password=password, confirm=request.form.get("confirm"))
        
        # Proceed if all is good
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, generate_password_hash(password))
        flash("Registration Successful!")
        return redirect("/login")
    else:
        return render_template("register.html")


@app.route("/transaction", methods=["GET", "POST"])
@login_required
def transaction():
    if request.method == "POST":
        # TO DO
        # Get money to add or transaction
        # Update balance in users table
        # Add to history 

        if request.form.get("submit-money-btn"):
            money = request.form.get("money")

            if not money:
                flash("Must type in an amount", "error_two")
                return redirect("/transaction")

            if is_float(money):
                # Get the current money in user and add it to amt they want to add
                current = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]
                new_total = float(money) + float(current)
                print(format(new_total, ".2f"))
                
                # Update new money amount
                db.execute("UPDATE users SET money = ? WHERE id = ?", new_total, session["user_id"])

                # Add to history table
                tz_NY = timezone('America/New_York')
                db.execute(
                    "INSERT INTO history (owner_id, item_type, bucket, amt, new_balance, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    session["user_id"],
                    "Deposit",
                    "Basic Needs",
                    money,
                    new_total,
                    datetime.now(tz_NY).strftime("%m/%d/%y"),
                    datetime.now(tz_NY).strftime("%I:%M %p")
                )

                # Update display of user balance
                file = open("static/data.json", "w")
                username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]
                money = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]
                file.write(f"{username.capitalize()}, {usd(money)}")
                
                print('history added')
                return redirect("/transaction")
            else:
                flash("Value must be integer or decimals only", "error_one")
                return redirect("/transaction")

        elif request.form.get("submit-transaction-btn"):
            if not request.form.get("buckets") or not request.form.get("transaction"):
                flash("Selecting a bucket and entering an amount is required", "error_three")
                return redirect("/transaction")
            
            if not is_float(request.form.get("transaction")):
                flash("Value must be integer or decimals only", "error_one")
                return redirect("/transaction")
            
            # Add to history table
            tz_NY = timezone('America/New_York')
            current = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]
            new_balance = float(current) - float(request.form.get("transaction"))
            db.execute(
                "INSERT INTO history (owner_id, item_type, bucket, amt, new_balance, date, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
                session["user_id"],
                request.form.get("type"),
                request.form.get("buckets"),
                request.form.get("transaction"),
                format(new_balance, ".2f"),
                datetime.now(tz_NY).strftime("%m/%d/%y"),
                datetime.now(tz_NY).strftime("%I:%M %p")
            )

            db.execute("UPDATE users SET money = ? WHERE id = ?", new_balance, session["user_id"])

            file = open("static/data.json", "w")
            username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]
            file.write(f"{username.capitalize()}, {usd(new_balance)}")

            return redirect("/transaction")

        return render_template("transaction.html")
    else:
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        if existing:
            return render_template("transaction.html", existing=existing)

        return render_template("transaction.html")

@app.route("/history")
@login_required
def history():
    transactions = db.execute("SELECT * FROM history WHERE owner_id = ?", session["user_id"])
    return render_template("history.html", transactions=transactions, usd=usd)


@app.route("/api/data")
def send_data():
    file = open("static/data.json", "r")
    return(jsonify(file.read()))


@app.route("/logout")
def logout():
    # Forget any user id
    session.clear()

    return redirect("/")

# Credits
# https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
# https://docs.python.org/3.3/library/functions.html#zip
# https://stackoverflow.com/questions/50146815/getting-multiple-html-fields-with-same-name-using-getlist-with-flask-in-python
# https://www.reddit.com/r/cs50/comments/fw50k5/message_flashing_not_working_with_redirect_to/
# user "Priyatham" in https://stackoverflow.com/questions/57907655/how-to-use-pipreqs-to-create-requirements-txt-file
# zip can be useful for combining list stuff
# https://www.programiz.com/python-programming/examples/check-string-number
    # LESSON: You can also make your own function to do stuff with try except
# https://www.javatpoint.com/how-to-get-2-decimal-places-in-python
# https://stackoverflow.com/questions/58793101/unable-to-import-flask-login
    # LESSON: Make sure you have installed the version of Flask-Login which is compatible with your Python Version. 
    # If you're using Python 3 in your Flask App you need pip3 to install compatible parts.
# https://stackoverflow.com/questions/33948966/flashing-2-groups-of-messages-in-2-different-places-using-flask

# To use later
# https://stackoverflow.com/questions/24922831/flask-display-user-register-or-already-login-in-every-template-of-each-module