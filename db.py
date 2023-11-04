import sqlite3

con = sqlite3.connect("budget.db")
db = con.cursor()

# create_user = db.execute("""CREATE TABLE users (
#                                 id INTEGER NOT NULL,
#                                 username TEXT NOT NULL,
#                                 hash TEXT NOT NULL,
#                                 money NUMERIC,
#                                 PRIMARY KEY(id)
#                               )"""
#                           )

buckets = db.execute("""CREATE TABLE buckets (
                                id INTEGER NOT NULL,
                                owner_id INTEGER NOT NULL,
                                name TEXT NOT NULL,
                                percent_allocation INTEGER NOT NULL,
                                month_limit NUMERIC,
                                FOREIGN KEY(owner_id) REFERENCES users(id),
                                PRIMARY KEY(id)
                              )"""
                          )

# spendings = db.execute("""CREATE TABLE spendings (
#                                 id INTEGER NOT NULL,
#                                 owner_id INTEGER NOT NULL,
#                                 name TEXT NOT NULL,
#                                 month_limit NUMERIC,
#                                 FOREIGN KEY(owner_id) REFERENCES users(id),
#                                 FOREIGN KEY(name) REFERENCES buckets(name),
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