import sqlite3
import re
from json import dumps
from flask import Flask, g

app = Flask(__name__)
app.config.update(dict(
    DATABASE='database/database.db',
    SECRET_KEY='3.1415926535897932384626433'
))


def connect_db():
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv


def get_cursor():
    if not hasattr(g, 'db'):
        g.db = connect_db()
        g.cursor = g.db.cursor()
    return g.cursor


# 添加一个结束请求后执行的函数
def after_this_request(f):
    if not hasattr(g, 'after_request_callbacks'):
        g.after_request_callbacks = []
    g.after_request_callbacks.append(f)


@app.teardown_appcontext
def close_db_and_callback(error):
    if hasattr(g, 'cursor'):
        g.cursor.close()
    if hasattr(g, 'db'):
        g.db.commit()
        g.db.close()
    if hasattr(g, 'after_request_callbacks'):
        for callback in g.after_request_callbacks:
            callback()


# 配置
def get_site_config():
    result = {
        'categories': [],
        'tags': []
    }

    db = connect_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM config')
    configures = cursor.fetchall()
    cursor.execute('SELECT * FROM category')
    categories = cursor.fetchall()
    cursor.execute('SELECT * FROM tag')
    tags = cursor.fetchall()
    cursor.close()
    db.close()

    for configure in configures:
        result[configure['key']] = configure['value']
    for category in categories:
        result['categories'].append(category['value'])
    for tag in tags:
        result['tags'].append(tag['value'])

    return result


def update_site_config():
    app.config['site_config'] = get_site_config()


update_site_config()


@app.route('/preview')
def preview():
    html = ''
    with open('static/preview.html') as f:
        html += f.read()
    return html


@app.route('/ajax')
def ajax():
    from time import sleep
    sleep(1)
    return ''


# 文章列表页
@app.route('/')
@app.route('/page/<int:page_num>')
@app.route('/tag/<tag_name>')
@app.route('/tag/<tag_name>/page/<int:page_num>')
@app.route('/category/<category_name>')
@app.route('/category/<category_name>/page/<int:page_num>')
@app.route('/search/<key_words>')
@app.route('/search/<key_words>/page/<int:page_num>')
# 文章页
@app.route('/post/<int:post_id>')
# 编辑文章页
@app.route('/post/add')
@app.route('/post/edit/<int:post_id>')
# Message 功能页
@app.route('/message')
@app.route('/message/page/<int:page_num>')
# toDoList 功能页
@app.route('/toDoList')
@app.route('/toDoList/page/<int:page_num>')
# 设置页
@app.route('/admin/config')
def index(*args, **kwargs):
    html = ''
    with open('static/all.html') as f:
        html += f.read()
    return html


@app.route('/json/config.json')
def config():
    if not app.config['site_config']:
        update_site_config()
    result = {
        'status': True,
        'data': {
            'siteName': app.config['site_config']['siteName'],
            'siteDescription': app.config['site_config']['siteDescription'],
            'pageSize': int(app.config['site_config']['pageSize']),
            'tags': app.config['site_config']['tags'],
            'categories': app.config['site_config']['categories']
        }
    }
    return dumps(result, ensure_ascii=False)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
