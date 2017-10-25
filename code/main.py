from flask import Flask

app = Flask(__name__)


@app.route('/preview')
def preview():
    html = ''
    with open('static/preview.html') as f:
        html += f.read()
    return html


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
