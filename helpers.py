from flask import redirect, render_template, session
from functools import wraps

# Decorate routes to require login.
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

def is_float(val):
    try:
        float(val) 
        # Will return True for int also
        return True
    except ValueError:
        return False

def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"