import sqlite3
from json import dumps


def get_data_from_database(table_name, columns):
    db = sqlite3.connect('database/database.db')
    db.row_factory = sqlite3.Row
    result = []

    cursor = db.cursor()
    cursor.execute('SELECT * FROM ' + table_name)
    rows = cursor.fetchall()
    for row in rows:
        temp = {}
        for c in columns:
            temp[c] = row[c]
        result.append(temp)

    return result


data = {
    'config': get_data_from_database('config', ['key', 'value']),
    'tag': get_data_from_database('tag', ['value']),
    'category': get_data_from_database('category', ['value']),
    'post': get_data_from_database('post', ['id', 'time', 'title', 'category', 'tag', 'image', 'text']),
    'comment': get_data_from_database('comment', ['id', 'uid', 'time', 'name', 'email', 'text']),
    'toDoList': get_data_from_database('toDoList', ['id', 'time', 'text', 'checked']),
    'message': get_data_from_database('message', ['id', 'read', 'time', 'title', 'url'])
}

with open('database/backup.json', 'w', encoding='utf8') as f:
    f.write(dumps(data, ensure_ascii=False))
