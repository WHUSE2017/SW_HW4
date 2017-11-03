from datetime import datetime, timedelta
import requests
import sqlite3
import re


def get_whu_index():
    html, urls = requests.get('http://www.whu.edu.cn/').content.decode('utf8'), []
    urls += re.findall(r'<a href="http://news.whu.edu.cn/info/[^>]*?>[^<]*?</a>', html)
    urls += re.findall(r'<a href="info/[^>]*?>[^<]*?</a>', html)
    urls = map(lambda t: list(re.findall(r'href="(.*?)"[^>]*?>(.*?)</a>', t)[0]), urls)
    urls = map(lambda t: t if -1 < t[0].find('http') else ['http://www.whu.edu.cn/' + t[0], t[1]], urls)
    urls = map(
        lambda t: t + [int((datetime.strptime(re.findall(
            r'发布.*?(\d{4}-\d{2}-\d{2})', requests.get(t[0]).content.decode('utf8')
        )[0], '%Y-%m-%d') + timedelta(hours=8)).timestamp())], urls
    )
    return list(urls)


def get_whu_cs_index():
    html = requests.get('http://cs.whu.edu.cn/').content.decode('utf8')
    urls = re.findall(r'<dd>.*?</dd>', html)
    urls = map(lambda t: list(re.findall(r'href="(.*?)"[^>]*?>(.*?)</a>', t)[0]), urls)
    urls = map(lambda t: ['http://cs.whu.edu.cn' + t[0], t[1]], urls)
    urls = map(
        lambda t: t + [int((datetime.strptime(
            re.findall(r'\d{4}/\d{4}', t[0])[0], '%Y/%m%d'
        ) + timedelta(hours=8)).timestamp())], urls
    )
    return list(urls)


def add_to_database(item):
    db = sqlite3.connect('database/database.db')
    db.row_factory = sqlite3.Row
    cursor = db.cursor()

    cursor.execute('SELECT * FROM message WHERE url=?', (item[0],))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO message (url, title, time, read) VALUES (?, ?, ?, 0)', item)

    cursor.close()
    db.commit()
    db.close()


def main():
    for i in get_whu_index():
        add_to_database(i)
    for i in get_whu_cs_index():
        add_to_database(i)


if __name__ == '__main__':
    main()
