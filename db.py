import sqlite3

con = sqlite3.connect("budget.db")
db = con.cursor()

# create_user = db.execute("""CREATE TABLE users (
#                                 id INTEGER NOT NULL,
#                                 username TEXT NOT NULL,
#                                 hash TEXT NOT NULL,
#                                 money NUMERIC DEFAULT "0",
#                                 PRIMARY KEY(id)
#                               )"""
#                           )

# buckets = db.execute("""CREATE TABLE buckets (
#                                 id INTEGER NOT NULL,
#                                 owner_id INTEGER NOT NULL,
#                                 index_num INTEGER NOT NULL,
#                                 name TEXT NOT NULL,
#                                 percent_allocation INTEGER NOT NULL,
#                                 month_limit NUMERIC,
#                                 FOREIGN KEY(owner_id) REFERENCES users(id),
#                                 PRIMARY KEY(id)
#                               )"""
#                           )


# create_history = db.execute("""CREATE TABLE history (
#                                 id INTEGER NOT NULL,
#                                 owner_id INTEGER NOT NULL,
#                                 item_type TEXT,
#                                 bucket TEXT NOT NULL,
#                                 amt NUMERIC NOT NULL,
#                                 new_balance NUMERIC NOT NULL,
#                                 date DATE NOT NULL,
#                                 time TIME NOT NULL,
#                                 FOREIGN KEY(owner_id) REFERENCES users(id),
#                                 PRIMARY KEY(id)
#                               )"""
#                           )

# budget_history = db.execute("""CREATE TABLE budget_history (
#                                 id INTEGER NOT NULL,
#                                 owner_id INTEGER NOT NULL,
#                                 index_num INTEGER NOT NULL,
#                                 bucket_name TEXT NOT NULL,
#                                 month_limit NUMERIC,
#                                 month TEXT NOT NULL,
#                                 year INTEGER NOT NULL,
#                                 FOREIGN KEY(owner_id) REFERENCES users(id),
#                                 PRIMARY KEY(id)
#                               )"""
#                           )