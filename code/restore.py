import sqlite3
from functools import reduce
from json import loads


def set_database_from_data(data):
    db = sqlite3.connect('database/database.db')
    db.row_factory = sqlite3.Row
    cursor = db.cursor()
    struct = ''
    with open('database/database.sql', 'r', encoding='utf8') as fp:
        struct += fp.read()
    cursor.executescript(struct)

    for table_name, contents in data.items():
        for content in contents:
            key, value = [], []
            for k, v in content.items():
                key.append(k)
                value.append(v)
            cursor.execute(
                'INSERT INTO ' + table_name + ' (' +
                reduce(lambda a, b: a + ', ' + b, map(lambda x: '"' + str(x) + '"', key))
                + ') VALUES (' +
                reduce(lambda a, b: a + ', ' + b, map(lambda x: '?', value))
                + ')', value)

    cursor.close()
    db.commit()
    db.close()


with open('database/backup.json', 'r', encoding='utf8') as f:
    set_database_from_data(loads(f.read()))
