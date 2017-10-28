import re
import sqlite3
import time
from json import dumps

from flask import Flask, g, session, request


def str2sha1(string):
    from hashlib import sha1
    s = sha1()
    s.update(string.encode('utf-8'))
    return s.hexdigest()


def boolean_response(boolean):
    return dumps({'status': not not boolean}) + '\n'


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


@app.route('/json/list/all/<int:start_num>.<int:limit_num>.json')
@app.route('/json/list/tag/<tag_name>/<int:start_num>.<int:limit_num>.json')
@app.route('/json/list/category/<category_name>/<int:start_num>.<int:limit_num>.json')
@app.route('/json/list/search/<key_words>/<int:start_num>.<int:limit_num>.json')
def api_list(*args, **kwargs):
    result = {'status': False}
    cursor = get_cursor()
    if 'tag_name' in kwargs:
        cursor.execute(
            'SELECT * FROM post WHERE tag LIKE ? ORDER BY time DESC LIMIT ?, ?',
            ('%' + kwargs['tag_name'] + '%', kwargs['start_num'], kwargs['limit_num'])
        )
    elif 'category_name' in kwargs:
        cursor.execute(
            'SELECT * FROM post WHERE category = ? ORDER BY time DESC LIMIT ?, ?',
            (kwargs['category_name'], kwargs['start_num'], kwargs['limit_num'],)
        )
    elif 'key_words' in kwargs:
        cursor.execute(
            'SELECT * FROM post WHERE text LIKE ? ORDER BY time DESC LIMIT ?, ?',
            ('%' + kwargs['key_words'] + '%', kwargs['start_num'], kwargs['limit_num'])
        )
    else:
        cursor.execute(
            'SELECT * FROM post ORDER BY time DESC LIMIT ?, ?',
            (kwargs['start_num'], kwargs['limit_num'],)
        )
    posts = cursor.fetchall()
    if posts:
        result['status'] = True
        data = []
        for post in posts:
            text = re.split(r'<!--\s*more\s*-->', post['text'])
            data.append({
                'id': post['id'],
                'title': post['title'],
                'time': post['time'],
                'text': text[0],
                'full': len(text) == 1
            })
        result['data'] = data
    return dumps(result, ensure_ascii=False) + '\n'


@app.route('/json/post/<int:post_id>.json')
def api_post(post_id):
    result = {'status': False}
    post = get_cursor().execute('SELECT * FROM post WHERE id = ?', (post_id,)).fetchone()
    if post:
        result['status'] = True
        result['data'] = {
            'id': post['id'],
            'time': post['time'],
            'title': post['title'],
            'text': post['text'],
            'image': post['image'],
            'category': post['category'],
            'tag': post['tag']
        }
        if not post['image']:
            images = re.findall(r'!\[.*?\]\((.*?)\)', post['text'])
            if images:
                result['data']['image'] = images[0]
    return dumps(result, ensure_ascii=False) + '\n'


@app.route('/json/comment/<int:post_id>.json')
def api_comment(post_id):
    comments = get_cursor().execute('SELECT * FROM comment WHERE id = ? ORDER BY time DESC', (post_id,)).fetchall()
    result = {'status': False}
    if comments:
        temp = []
        for comment in comments:
            temp.append({
                'uid': comment['uid'],
                'name': comment['name'],
                'email': comment['email'],
                'time': comment['time'],
                'text': comment['text']
            })
        result['status'] = True
        result['data'] = temp
    return dumps(result, ensure_ascii=False) + '\n'


@app.route('/comment/add', methods=['POST'])
def api_comment_add():
    if not request.form.get('id') or not request.form.get('name') or \
            not request.form.get('email') or not request.form.get('text'):
        return boolean_response(False)
    get_cursor().execute(
        'INSERT INTO comment (id, time, name, email, text) VALUES (?, ?, ?, ?, ?)',
        (request.form.get('id'), int(time.time()), request.form.get('name'),
         request.form.get('email'), request.form.get('text'))
    )
    return boolean_response(True)


@app.route('/comment/delete', methods=['POST'])
def api_comment_delete():
    if not session.get('login') or not request.form.get('uid'):
        return boolean_response(False)
    get_cursor().execute('DELETE FROM comment WHERE "uid"=?', (request.form.get('uid'),))
    return boolean_response(True)


@app.route('/admin/login_state', methods=['POST'])
def api_login_state():
    return boolean_response(not not session.get('login'))


@app.route('/admin/login', methods=['POST'])
def api_login():
    session['login'] = request.form.get('username') == app.config['site_config']['username'] and \
                       str2sha1(request.form.get('password')) == app.config['site_config']['password']
    return api_login_state()


@app.route('/admin/logout', methods=['POST'])
def api_logout():
    session['login'] = None
    return boolean_response(True)


@app.route('/admin/change/password', methods=['POST'])
def api_change_password():
    if not session.get('login') or not request.form.get('username') or not request.form.get('password'):
        return boolean_response(False)
    cursor = get_cursor()
    cursor.execute('UPDATE config SET "value" = ? WHERE key = "username"', (request.form.get('username'),))
    cursor.execute('UPDATE config SET "value" = ? WHERE key = "password"', (str2sha1(request.form.get('password')),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/change/config', methods=['POST'])
def api_change_config():
    if not session.get('login') or not request.form.get('siteName') or \
            not request.form.get('siteDescription') or not request.form.get('pageSize'):
        return boolean_response(False)
    cursor = get_cursor()
    cursor.execute('UPDATE config SET "value" = ? WHERE key="siteName"', (request.form.get('siteName'),))
    cursor.execute('UPDATE config SET "value" = ? WHERE key="siteDescription"', (request.form.get('siteDescription'),))
    cursor.execute('UPDATE config SET "value" = ? WHERE key="pageSize"', (request.form.get('pageSize'),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/category/add', methods=['POST'])
def api_category_add():
    if not session.get('login') or not request.form.get('category'):
        return boolean_response(False)
    get_cursor().execute('INSERT INTO category VALUES (?)', (request.form.get('category'),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/category/delete', methods=['POST'])
def api_category_delete():
    if not session.get('login') or not request.form.get('category'):
        return boolean_response(False)
    get_cursor().execute('DELETE FROM category WHERE "value"=?', (request.form.get('category'),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/tag/add', methods=['POST'])
def api_tag_add():
    if not session.get('login') or not request.form.get('tag'):
        return boolean_response(False)
    get_cursor().execute('INSERT INTO tag VALUES (?)', (request.form.get('tag'),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/tag/delete', methods=['POST'])
def api_tag_delete():
    if not session.get('login') or not request.form.get('tag'):
        return boolean_response(False)
    get_cursor().execute('DELETE FROM tag WHERE "value"=?', (request.form.get('tag'),))
    after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/post/add', methods=['POST'])
def api_post_add():
    if not session.get('login') or \
            not request.form.get('time') or not request.form.get('category') or not request.form.get('text'):
        return boolean_response(False)
    get_cursor().execute(
        'INSERT INTO post (time, title, category, tag, image, text) VALUES (?, ?, ?, ?, ?, ?)',
        (request.form.get('time'), request.form.get('title') if request.form.get('title') else '',
         request.form.get('category'), request.form.get('tag') if request.form.get('tag') else '',
         request.form.get('image') if request.form.get('image') else '', request.form.get('text'))
    )
    x = None
    if request.form.get('tag'):
        for tag in request.form.get('tag').split(', '):
            if tag not in app.config['site_config']['tags']:
                x = get_cursor().execute('INSERT INTO tag VALUES (?)', (tag,))
        if x:
            after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/post/edit', methods=['POST'])
def api_post_edit():
    if not session.get('login') or \
            not request.form.get('time') or not request.form.get('category') or not request.form.get('text'):
        return boolean_response(False)
    get_cursor().execute(
        'UPDATE post SET time = ?, title = ?, category = ?, tag = ?, image = ?, text = ? WHERE id = ?',
        (request.form.get('time'), request.form.get('title') if request.form.get('title') else '',
         request.form.get('category'), request.form.get('tag') if request.form.get('tag') else '',
         request.form.get('image') if request.form.get('image') else '', request.form.get('text'),
         request.form.get('id'))
    )
    x = None
    if request.form.get('tag'):
        for tag in request.form.get('tag').split(', '):
            if tag not in app.config['site_config']['tags']:
                x = get_cursor().execute('INSERT INTO tag VALUES (?)', (tag,))
        if x:
            after_this_request(update_site_config)
    return boolean_response(True)


@app.route('/admin/post/delete', methods=['POST'])
def api_post_delete():
    if not session.get('login') or not request.form.get('id'):
        return boolean_response(False)
    get_cursor().execute('DELETE FROM post WHERE id = ?', (request.form.get('id'),))
    return boolean_response(True)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
