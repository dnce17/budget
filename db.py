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
                                FOREIGN KEY(owner_id) REFERENCES users(id),
                                PRIMARY KEY(id)
                              )"""
                          )