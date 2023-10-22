# Started 10/17/23

from flask import Flask, redirect, render_template, request, session, g, flash, jsonify
from flask_session import Session
from cs50 import SQL
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
import json

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
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

# Data to send to js, if needed
data = "Bob"


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
    # Load user's categories and % allocation, if done before
    # Else load input boxes to make them

    if request.method == "POST":

        zipped = zip(request.form.getlist('bucket'), request.form.getlist('allocation'))
        allocated_buckets = list(zipped)
        print(allocated_buckets[0][1])

        # for bucket, allocation in zip(request.form.getlist('bucket'), request.form.getlist('allocation')):
        db.execute("DROP TABLE buckets")

        return redirect("/")
    else:
        return render_template("index.html")
    
    
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
        db.execute('INSERT INTO users (username, hash) VALUES (?, ?)', username, generate_password_hash(password))
        flash("Registration Successful!")
        return redirect("/login")
    else:
        return render_template("register.html")


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

# To use later
# https://stackoverflow.com/questions/11547150/how-to-transfer-variable-data-from-python-to-javascript-without-a-web-server