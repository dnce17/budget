from flask import Flask, redirect, render_template, request, session, g, flash, jsonify
from flask_session import Session
from cs50 import SQL
from werkzeug.security import check_password_hash, generate_password_hash
import json
from datetime import datetime
from pytz import timezone
from flask_socketio import SocketIO, emit
import pprint

from helpers import login_required, is_float, usd, thousands

app = Flask(__name__)
app.jinja_env.auto_reload = True
socketio = SocketIO(app)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session --> Ensures store session info on server itself (e.g. shopping cart)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Connect database
db = SQL("sqlite:///budget.db")

# Custom filter
@app.template_filter("hour_min")
def hour_min_filter(value, format="%I:%M %p"):
    return datetime.strptime(value, '%I:%M:%S:%f %p').strftime("%I:%M %p")


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
            abbrev_month = datetime.now().strftime("%b")
            full_year = datetime.now().strftime("%Y")

            existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
            if existing:
                # Put old and new bucket names in array
                existing_buckets, old_allocations = [], []
                new_buckets, new_allocations = [], []
                for i in range(len(existing)): 
                    existing_buckets.append(existing[i]["name"])
                    old_allocations.append(existing[i]["percent_allocation"])
                for item in data:
                    new_buckets.append(data[item][0])
                    new_allocations.append(int(data[item][1]))

                def update_bucket_names(existing_buckets, new_buckets, index):
                    if existing_buckets[index] != new_buckets[index]:
                        db.execute("UPDATE buckets SET name = ?, month_limit = NULL WHERE owner_id = ? AND name = ? AND index_num = ?", 
                            new_buckets[index], 
                            session["user_id"], 
                            existing_buckets[index],
                            index,
                        )
                def update_allocations(existing_buckets, new_buckets, old_allocations, new_allocations, index):
                    if old_allocations[index] != new_allocations[index]:
                        # Compare new_bucket name in case BOTH the name and allocation changes
                        db.execute("UPDATE buckets SET percent_allocation = ? WHERE owner_id = ? AND name = ? AND index_num = ?", 
                            new_allocations[index], 
                            session["user_id"], 
                            new_buckets[index],
                            index
                        )
                
                # Is index where new data comes in if new data is longer than existing data
                # or where existing data should be deleted if new data is shorter than existing data
                breakpoint = 0
                if len(existing_buckets) == len(new_buckets):
                    for i in range(len(existing_buckets)): 
                        update_bucket_names(existing_buckets, new_buckets, i)
                        update_allocations(existing_buckets, new_buckets, old_allocations, new_allocations, i)
                elif len(existing_buckets) < len(new_buckets):
                    # Check the index that both old and new buckets both share (and not out of range)
                    for i in range(len(existing_buckets)): 
                        update_bucket_names(existing_buckets, new_buckets, i)
                        update_allocations(existing_buckets, new_buckets, old_allocations, new_allocations, i)
                    # Index onward -> NEW data to be INSERTED
                    breakpoint = len(existing_buckets)
                    for i in range(breakpoint, len(new_buckets)):
                        db.execute("INSERT INTO buckets (owner_id, index_num, name, percent_allocation) VALUES (?, ?, ?, ?)", 
                            session["user_id"],
                            i,
                            new_buckets[i], 
                            new_allocations[i]
                        )
                elif len(existing_buckets) > len(new_buckets):
                    for i in range(len(new_buckets)):
                        update_bucket_names(existing_buckets, new_buckets, i)
                        update_allocations(existing_buckets, new_buckets, old_allocations, new_allocations, i)
                    # Index onward -> Existing data to be deleted
                    breakpoint = len(new_buckets)
                    for i in range(breakpoint, len(existing_buckets)):
                        db.execute("DELETE FROM buckets WHERE owner_id = ? AND name = ? AND index_num = ?", 
                            session["user_id"],
                            existing_buckets[i],
                            i
                        )

                # Update budget_history table (in case user does not go back to monthly budget to change themselves)
                buckets = db.execute("SELECT name FROM buckets WHERE owner_id = ?", session["user_id"])
                current_budget = db.execute("SELECT bucket_name FROM budget_history WHERE month = ? AND year = ?", 
                    abbrev_month, 
                    full_year
                )
                if len(buckets) == len(current_budget):
                    for i in range(len(buckets)):
                        if buckets[i]['name'] != current_budget[i]['bucket_name']:
                            db.execute("UPDATE budget_history SET bucket_name = ?, month_limit = ? WHERE owner_id = ? AND index_num = ? AND bucket_name = ? AND month = ? AND year = ?",
                                buckets[i]['name'],
                                '',
                                session["user_id"],
                                i,
                                current_budget[i]['bucket_name'],
                                abbrev_month, 
                                full_year
                            )
                elif len(buckets) < len(current_budget):
                    # Check the index that both old and new buckets both share (and not out of range)
                    for i in range(len(buckets)):
                        if buckets[i]['name'] != current_budget[i]['bucket_name']:
                            db.execute("UPDATE budget_history SET bucket_name = ?, month_limit = ? WHERE owner_id = ? AND index_num = ? AND bucket_name = ? AND month = ? AND year = ?",
                                buckets[i]['name'],
                                '',
                                session["user_id"],
                                i,
                                current_budget[i]['bucket_name'],
                                abbrev_month, 
                                full_year
                            )

                    for i in range(len(buckets), len(current_budget)):
                        db.execute("DELETE FROM budget_history WHERE owner_id = ? AND bucket_name = ? AND index_num = ?", 
                            session["user_id"],
                            current_budget[i]['bucket_name'],
                            i
                        )
                elif len(buckets) > len(current_budget):
                    for i in range(len(current_budget)):
                        if buckets[i]['name'] != current_budget[i]['bucket_name']:
                            db.execute("UPDATE budget_history SET bucket_name = ?, month_limit = ? WHERE owner_id = ? AND index_num = ? AND bucket_name = ? AND month = ? AND year = ?",
                                buckets[i]['name'],
                                '',
                                session["user_id"],
                                i,
                                current_budget[i]['bucket_name'],
                                abbrev_month, 
                                full_year
                            )
                    for i in range(len(current_budget), len(buckets)):
                        db.execute("INSERT INTO budget_history (owner_id, index_num, bucket_name, month, year) VALUES (?, ?, ?, ?, ?)", 
                            session["user_id"],
                            i,
                            buckets[i]['name'],
                            abbrev_month, 
                            full_year
                        )
            else:
                data_to_list = list(data.items())
                index = 0
                for bucket in data:
                    # Insert into bucket
                    db.execute("INSERT INTO buckets (owner_id, index_num, name, percent_allocation) VALUES (?, ?, ?, ?)", 
                        session["user_id"],
                        index,
                        data[bucket][0], 
                        data[bucket][1]
                    )
                    # Insert into budget history
                    db.execute("INSERT INTO budget_history (owner_id, index_num, bucket_name, month, year) VALUES (?, ?, ?, ?, ?)", 
                        session["user_id"],
                        index,
                        data[bucket][0],
                        abbrev_month, 
                        full_year
                    )

                    index += 1
                    
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
    

@app.route("/monthly", methods=["GET", "POST"])
@login_required
def monthly():
    if request.method == "POST":
        data = request.get_json(silent=True)

        # Add to/Update the month_limit 
        if data is not None:
            for bucket in data:
                db.execute("UPDATE buckets SET month_limit = ? WHERE name = ? AND owner_id = ?",
                    data[bucket][1], 
                    data[bucket][0],
                    session["user_id"]
                )
        
        # Add to or update the budget history
        if data is not None:
            current_abbrev_month = datetime.now().strftime("%b")
            current_full_yr = datetime.now().strftime("%Y")
            recent_history = db.execute("SELECT month, year FROM budget_history WHERE month = ? AND year = ?", current_abbrev_month, current_full_yr)
            
            # If history for current month exist, delete it and insert new one 
            if recent_history:
                # Delete budget_history for current month
                db.execute("DELETE FROM budget_history WHERE owner_id = ? AND month = ? AND year = ?", 
                    session["user_id"], 
                    current_abbrev_month, 
                    current_full_yr
                )
                # Insert the new one for current month
                data_to_list = list(data.items())
                index = 0
                for bucket in data:
                    db.execute("INSERT INTO budget_history (owner_id, index_num, bucket_name, month_limit, month, year) VALUES (?, ?, ?, ?, ?, ?)",
                        session["user_id"],
                        index,
                        data[bucket][0],
                        data[bucket][1],
                        current_abbrev_month,
                        current_full_yr
                    )
                    index += 1
            # If not, just insert
            # This actually is not needed since this budget_history will be made from making bucket in 
            # index, but might be needed in future for something
            else:
                data_to_list = list(data.items())
                index = 0
                for bucket in data:
                    db.execute("INSERT INTO budget_history (owner_id, index_num, bucket_name, month_limit, month, year) VALUES (?, ?, ?, ?, ?, ?)",
                        session["user_id"],
                        index,
                        data[bucket][0],
                        data[bucket][1],
                        current_abbrev_month,
                        current_full_yr
                    )
                    index += 1

        return redirect("/monthly")

    else:
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        money = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"] 

        # Adjust amt left for month based on history
        transactions = db.execute("SELECT * FROM history WHERE owner_id = ?", session["user_id"])
        current_month = datetime.now().strftime("%m")
        current_yr = datetime.now().strftime("%y")
        
        expenses = {}
        for bucket in existing:
            expenses[bucket["name"]] = []
        for transaction in transactions:
            m = transaction["date"][:2]
            y = transaction["date"][-2:]
            if transaction["item_type"] != "Deposit" and transaction["bucket"] in expenses and m == current_month and y == current_yr:
                if len(expenses[transaction["bucket"]]) > 0:
                    expenses[transaction["bucket"]][0] += transaction["amt"]
                else:
                    expenses[transaction["bucket"]].append(transaction["amt"])

        # Load history into JSON file for use
        with open('static/history.json', 'w') as file:
            json.dump(expenses, file)

        # Get user's past monthly budget to load into dropdown
        past_budget = db.execute("SELECT * FROM budget_history WHERE owner_id = ?", session["user_id"])
        past_dates = []
        for history in past_budget:
            date = f"{history['month']} {str(history['year'])}"
            if date not in past_dates and history['month'] != datetime.now().strftime("%b") and history['year'] != datetime.now().strftime("%Y"): 
                past_dates.append(f"{history['month']} {str(history['year'])}")
        past_dates.reverse()
        
        if existing:
            return render_template("monthly.html", 
                existing=existing, 
                usd=usd, 
                expenses=expenses,
                thousands=thousands,
                past_dates=past_dates
            )

        return render_template("monthly.html")
    
    
@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("_flashes"):
        flashes = session.get("_flashes")
        session.clear()

        # session.clear() removes flash msg, so use a var to save it
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
        
        # Save username and balance to use for display
        session["username"] = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]
        session["balance"] = usd(db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"])

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
        # Add money to balance
        if request.form.get("submit-money-btn"):
            money = request.form.get("money")
            if not money:
                flash("*Must type in an amount", "error_two")
                return redirect("/transaction")

            if is_float(money):
                # Get the current money in user and add it to amt they want to add
                current = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]
                new_total = float(money) + float(current)
                
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
                    datetime.now(tz_NY).strftime('%I:%M:%S:%f')[:-4] + ' ' + datetime.now(tz_NY).strftime('%p')
                )

                # Update display of user balance
                session["balance"] = usd(db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"])

                return redirect("/transaction")
            else:
                flash("*Value must be integer or decimals only", "error_one")
                return redirect("/transaction")

        # Submit a transaction (reduce balance)
        elif request.form.get("submit-transaction-btn"):
            if not request.form.get("buckets") or not request.form.get("transaction"):
                flash("*Selecting a bucket and entering an amount is required", "error_three")
                return redirect("/transaction")
            
            if not is_float(request.form.get("transaction")):
                flash("*Value must be integer or decimals only", "error_one")
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
                datetime.now(tz_NY).strftime('%I:%M:%S:%f')[:-4] + ' ' + datetime.now(tz_NY).strftime('%p')
            )

            db.execute("UPDATE users SET money = ? WHERE id = ?", new_balance, session["user_id"])

            session["balance"] = usd(db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"])

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
    # Reversed to arrange dates from latest to oldest
    transactions = db.execute("SELECT * FROM history WHERE owner_id = ?", session["user_id"])
    transactions.reverse()

    dates = db.execute("SELECT date FROM history WHERE owner_id = ?", session["user_id"])
    month_yr_list = []
    for date in dates:
        extracted = datetime.strptime(date["date"], "%m/%d/%y")
        month_yr = f"{extracted.strftime('%b')} {extracted.year}"
        if month_yr not in month_yr_list:
            month_yr_list.append(month_yr)
    # Reverse to put recent date at top of dropdown list
    month_yr_list.reverse()
    return render_template("history.html", transactions=transactions, usd=usd, month_yr_list=month_yr_list)


@app.route("/api/data")
def send_data():
    file = open("static/data.json", "r")
    return(jsonify(file.read()))


@app.route("/api/history")
def get_history():
    file = open("static/history.json", "r")
    return(jsonify(file.read()))


@app.route("/logout")
def logout():
    # Forget any user id
    session.clear()
    return redirect("/")

# Sockets
@socketio.on("save empty current data")
def handle_save_empty_current_data(data):
    # Save current data only if empty in case user go back to "Current" data with dropdown
    recent_history = db.execute("SELECT month, year FROM budget_history WHERE month = ? AND year = ?", datetime.now().strftime("%b"), datetime.now().strftime("%Y"))
    if not recent_history:
        for bucket in data:
            db.execute("INSERT INTO budget_history (owner_id, bucket_name, month, year) VALUES (?, ?, ?, ?)",
                session["user_id"],
                bucket,
                datetime.now().strftime("%b"),
                datetime.now().strftime("%Y")
            )


@socketio.on("hide btns")
def handle_hide_btns():
    emit('hide btns')


@socketio.on("get budget of date")
def handle_past_budget(data):

    # Get the budget of the desired date
    month, year = data[0], data[1]
    past_budget = db.execute("SELECT * FROM budget_history WHERE owner_id = ? AND month = ? AND year = ?", session["user_id"], month, year)

    # Get the expenses calculated from that month's history
    transactions = db.execute("SELECT * FROM history WHERE owner_id = ? AND date LIKE ? AND date LIKE ?", 
        session["user_id"],
        # Convert abbrev month to num
        f"{datetime.strptime(month, '%b').strftime('%m')}%",
        f"%{year[-2:]}"
    )
        
    expenses = {}
    for bucket in past_budget:
        if bucket["bucket_name"] not in expenses:
            expenses[bucket["bucket_name"]] = [0]
    for transaction in transactions:
        if transaction["item_type"] != "Deposit" and transaction["bucket"] in expenses:
            expenses[transaction["bucket"]][0] += transaction["amt"]

    data = {
        "past_budget": past_budget,
        "expenses": expenses
    }

    emit("get budget of date", data)


@socketio.on("data for line chart")
def handle_line_chart():
    dates = db.execute("SELECT DISTINCT month, year FROM budget_history WHERE owner_id = ?", session["user_id"])
    expenses = db.execute("SELECT * FROM history WHERE owner_id = ?", session["user_id"])
    limits = db.execute("SELECT bucket_name, month_limit, month, year FROM budget_history WHERE owner_id = ?", session["user_id"])

    dates_dict = {}
    for date in dates:
        if f"{date['month']} {date['year']}" not in dates_dict:
            dates_dict[f"{date['month']} {date['year']}"] = {}
            dates_dict[f"{date['month']} {date['year']}"]["total_spent"] = 0
            dates_dict[f"{date['month']} {date['year']}"]["total_over"] = 0
            dates_dict[f"{date['month']} {date['year']}"]["month_limit"] = {}
            dates_dict[f"{date['month']} {date['year']}"]["bucket_spent"] = {}
            dates_dict[f"{date['month']} {date['year']}"]["bucket_remaining"] = {}

    for date in dates_dict:
        # Add buckets for the month to needed dicts
        for bucket in limits:
            if f'{bucket["month"]} {bucket["year"]}' == date:
                if bucket["bucket_name"] not in dates_dict[date]["bucket_spent"]:
                    dates_dict[date]["bucket_spent"][bucket["bucket_name"]] = 0
                    dates_dict[date]["month_limit"][bucket["bucket_name"]] = 0
                    dates_dict[date]["bucket_remaining"][bucket["bucket_name"]] = 0

        for expense in expenses:
            # Input bucket names of only 1 month year into dict to start
            month_yr = f'{datetime.strptime(expense["date"][:2], "%m").strftime("%b")} {datetime.strptime(expense["date"][-2:], "%y").strftime("%Y")}'
            bucket_name = expense["bucket"]
            if month_yr == date:
                # Get amt spent for each bucket of a month (bucket_spent)
                if expense["item_type"] != "Deposit":
                    # The names in budget_history might not match history if user changed names in the middle of the month
                    try:
                        dates_dict[date]["bucket_spent"][bucket_name] += expense["amt"]
                    except:
                        pass

                    # Get the total spent for that month
                    dates_dict[date]["total_spent"] += expense['amt']
            
            # Get month limit for each bucket of a month
            for limit in limits:
                if f'{limit["month"]} {limit["year"]}' == date:
                    if limit["bucket_name"] in dates_dict[date]["month_limit"]:
                        dates_dict[date]["month_limit"][limit["bucket_name"]] = limit["month_limit"]
    
        dates_dict[date]["total_spent"] = float(f'{dates_dict[date]["total_spent"]:.2f}')

    # Calculate remaining
    for date in dates_dict:
        for bucket in dates_dict[date]["month_limit"]:
            if dates_dict[date]["month_limit"][bucket] != '' and dates_dict[date]["bucket_spent"][bucket] != '':
                if dates_dict[date]["month_limit"][bucket] is not None:
                    remaining = dates_dict[date]["month_limit"][bucket] - dates_dict[date]["bucket_spent"][bucket]
                    dates_dict[date]["bucket_remaining"][bucket] = remaining

                    # Calculate total over budget
                    if remaining < 0:
                        dates_dict[date]["total_over"] += remaining

    # Data to send over
    date_list, total_spent, total_over = [], [], []
    for date in dates_dict:
        date_list.append(date)
        total_spent.append(dates_dict[date]["total_spent"])
        total_over.append(dates_dict[date]["total_over"])

    # pprint.pprint(dates_dict)

    emit("data for line chart", [date_list, total_spent, total_over])

if __name__ == '__main__':
    socketio.run(app)

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
# Convert num month to abbrev month - https://stackoverflow.com/questions/6557553/get-month-name-from-number
# Getting start with flasksocket.io
    # https://stackoverflow.com/questions/42988907/how-do-you-send-messages-from-flask-server-python-to-html-client
    # https://www.youtube.com/watch?v=AMp6hlA8xKA&t=4s
    # https://flask-socketio.readthedocs.io/en/latest/getting_started.html
# Convert b/w month name and number - https://www.adamsmith.haus/python/answers/how-to-convert-between-month-name-and-month-number-in-python
# Convert AM/PM time to 24 hr format consisely - https://stackoverflow.com/questions/19229190/how-to-convert-am-pm-timestmap-into-24hs-format-in-python
# Custom filter - https://www.youtube.com/watch?v=sZl-H6GkHrk
    