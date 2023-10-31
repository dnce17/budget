# Started 10/17/23

from flask import Flask, redirect, render_template, request, session, g, flash, jsonify
from flask_session import Session
from cs50 import SQL
from werkzeug.security import check_password_hash, generate_password_hash
import json

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

# Decorate routes to require login.
# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if session.get("user_id") is None:
#             return redirect("/login")
#         return f(*args, **kwargs)
#     return decorated_function


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

        print("data recevied and bucket updated")

        return redirect("/")
    else:
        # Load username
        username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"].capitalize()
        money = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]

        # Load user's categories and % allocation, if exist
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        if existing:
            return render_template("index.html", existing=existing, username=username, balance=usd(money))

        return render_template("index.html", username=username)
    
# COME BACK TO LATER 
@app.route("/monthly", methods=["GET", "POST"])
@login_required
def monthly():
    if request.method == "POST":
        print("POST")
        return redirect("/monthly")

    else:
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        if existing:
            return render_template("monthly.html", existing=existing)

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

        if request.form.get("money"):
            # To check if value is float or int
            # def is_float(val):
            #     try:
            #         float(val) 
            #         # Will return True for int also
            #         return True
            #     except ValueError:
            #         return False

            money = request.form.get("money")
            if is_float(money):
                # Get the current money in user and add it to amt they want to add
                current = db.execute("SELECT money FROM users WHERE id = ?", session["user_id"])[0]["money"]
                new_total = float(money) + float(current)
                print(format(new_total, ".2f"))
                
                # Update new money amount
                db.execute("UPDATE users SET money = ? WHERE id = ?", new_total, session["user_id"])
                return redirect("/transaction")
            else:
                flash("Value must be integer or decimals only")
                return redirect("/transaction")

            # format(number, ".2f")  
        return render_template("transaction.html")
    else:
        existing = db.execute("SELECT * FROM buckets WHERE owner_id = ?", session["user_id"])
        if existing:
            return render_template("transaction.html", existing=existing)

        return render_template("transaction.html")


@app.route("/api/data")
def send_data():
    file = open("static/data.json", "r")
    return(jsonify(file.read()))


@app.route("/logout")
def logout():
    # Forget any user id
    session.clear()

    return redirect("/")

# For developmental purposes
def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route("/quit", methods=['GET','POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

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

# To use later
# https://stackoverflow.com/questions/24922831/flask-display-user-register-or-already-login-in-every-template-of-each-module