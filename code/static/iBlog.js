'use strict';

/**
 * 自己写一个简单的 JavaScript 库
 */
var $ = (function () {

    /**
     * 基本选择器, 目前支持: '#id','.class', 'tagName', 'body', 'head', 原始的 Node 节点
     * @param   {Element|string}   selector  // Node 节点 || css选择器
     * @returns {Element|NodeList}
     */
    var $ = function (selector) {
        if (typeof selector === 'string')
            if (selector[0] === '#') return document.getElementById(selector.slice(1));
            else if (selector[0] === '.') return document.getElementsByClassName(selector.slice(1));
            else if (selector === 'body') return document.body;
            else if (selector === 'head') return document.head;
            else return document.getElementsByTagName(selector);
        if (selector instanceof Element) return selector;
    };

    /**
     * 简单易用的创建 element 方法
     */
    $.createElement = function (tagName, text, attribute) {
        for (var i = 1; i < arguments.length; i++)
            if (typeof arguments[i] === 'string') text = arguments[i];
            else if (typeof arguments[i] === 'object') attribute = arguments[i];
        var element = document.createElement(tagName);
        if (typeof text === 'string') element.appendChild(document.createTextNode(text));
        if (typeof attribute === 'object') for (var x in attribute) if (attribute.hasOwnProperty(x))
            element.setAttribute(x, attribute[x]);
        return element;
    };

    /**
     * CSS Debug
     */
    $.cssDebug = (function () {
        var style = $.createElement('style');
        return function () {
            $('body').appendChild(style);
            style.innerText = style.innerText === '' ?
                '*{background: #000 !important;color: #0f0 !important;outline: solid #f00 1px !important;}' : '';
        };
    })();

    /**
     * 简单的窗口滚动的动画
     * 使用 sigmoid 函数 [-2, 8] 作平滑滚动
     */
    $.scroll = (function () {
        var preventDefault = function (event) {
            if (event) event.preventDefault()
        };

        var transform = (function () {
            var sigmoid = function (x) {
                return 1 / (1 + Math.exp(-x))
            };
            var sigmoid8 = sigmoid(8), sigmoid_2 = sigmoid(-2);
            return function (percent) {
                return (sigmoid(percent * 10 - 2) - sigmoid_2) / (sigmoid8 - sigmoid_2)
            }
        })();

        return function (position, time) {
            if (position === window.pageYOffset) return;
            if (typeof time !== 'number') time = 1000;

            window.addEventListener('wheel', preventDefault);
            var now = window.pageYOffset, times = time / 20, need = position - now, i = 0;
            var interval = setInterval(function () {
                window.scrollTo(0, now + transform(i++ / times) * need);
                if (times < i) window.removeEventListener('wheel', (clearInterval(interval), preventDefault));
            }, 20);
        }
    })();

    /**
     * CSS rem 转 px 尺寸
     * @returns {number}
     */
    $.rem2px = function () {
        var x = $.createElement('p').css({'height': '1rem', 'position': 'fixed', 'top': '-9rem'});
        var body = $('body').append(x);
        var height = x.clientHeight;
        body.remove(x);
        return height;
    };

    /**
     * ajax.get(info) || ajax.post(info);
     * --------------------
     * info = {
     *     url: '/request',
     *     success: func,
     *     error: func,
     *     timeout: 10000,
     *
     *     // POST 发送数据
     *     data: {
     *         username: 'username',
     *         password: 'password'
     *     }
     * }
     * --------------------
     * ajax.setBeforeRequest / ajax.setAfterRequest
     * 分别可以指定一个函数, 用于 ajax 前后执行, 例如动画
     * @type {{get, post, setBeforeRequest, setAfterRequest}}
     */
    $.ajax = (function () {

        var __beforeRequest, __afterRequest;

        /**
         * Ajax 请求数据
         * @param   {string}   method   // 请求方式 GET or POST
         * @param   {string}   url      // 请求URI
         * @param   {int}      timeout  // 超时时间 (默认 20s)
         * @param   {object}   data     // 发送的数据 (仅 POST)
         * @param   {function} success  // 成功的回调函数
         * @param   {function} error    // 失败的回调函数 (包含状态码错误, 以及超时)
         * @private
         */
        var sendRequest = function (method, url, timeout, data, success, error) {
            __beforeRequest && typeof __beforeRequest === 'function' && __beforeRequest();
            var request = new XMLHttpRequest();

            // 状态变更
            request.addEventListener('readystatechange', function () {
                if (request.readyState === 4) {
                    __afterRequest && typeof __afterRequest === 'function' && __afterRequest();
                    if (request.status >= 200 && request.status <= 300 || request.status === 304)
                        success && typeof success === 'function' && success(request.responseText);
                    else error && typeof error === 'function' && error(request.status);
                }
            });

            // 超时
            try {
                request.timeout = (typeof timeout === 'number') ? timeout : 20000;
            } catch (e) {  // 对于不支持超时选项的浏览器, 我真的无能为力
            }

            // 填充信息
            request.open(method, url, true);

            // 发送数据
            if (method === 'POST') {
                var sendInfo = '', x;
                for (x in data) if (data.hasOwnProperty(x)) sendInfo = sendInfo + '&' + x + '=' + data[x];
                request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                request.send(sendInfo.slice(1));
            } else request.send();
        };

        return {
            get: function (info) {
                return sendRequest('GET', info.url, info.timeout, info.data, info.success, info.error);
            },
            post: function (info) {
                return sendRequest('POST', info.url, info.timeout, info.data, info.success, info.error);
            },
            setBeforeRequest: function (func) {
                __beforeRequest = func
            },
            setAfterRequest: function (func) {
                __afterRequest = func
            }
        }

    })();

    /**
     * 绑定 dom 的函数
     */
    var domFns = {
        /**
         * 调整 css
         * @param    value
         * @param    duration
         * @param    effect
         */
        css: function (value, duration, effect) {
            if (!value) return this.style.cssText = '';
            var oldCssText = this.style.cssText.split(';');
            this.style.cssText = '';
            for (var i = 0; i < oldCssText.length; i++) {
                var rank = oldCssText[i].search(':');
                var k = oldCssText[i].slice(0, rank), v = oldCssText[i].slice(rank + 1);
                if (!(value.hasOwnProperty(k.trim()))) value[k.trim()] = v;
            }
            for (var key in value) if (value.hasOwnProperty(key)) this.style.cssText += key + ':' + value[key] + ';';
            if (typeof duration === 'number') {
                if (duration > 100) duration /= 1000;
                var t = 'all ' + duration + 's' + (effect ? ' ' + effect : '');
                this.css({transition: t, '-webkit-transition': t, '-moz-transition': t, '-o-transition': t});
            }
        },
        /**
         * 延迟 30ms 执行上方的 css 函数, 用于某些情况下, CSS3 的动画处理不够及时
         */
        delayCss: function (value, duration, effect) {
            return window.setTimeout((function (_this) {
                _this.css(value, duration, effect);
            })(this), 30), this;
        },
        /**
         * 清空这个节点下所有内容
         */
        empty: function () {
            while (this.hasChildNodes()) this.removeChild(this.firstChild);
        },
        /**
         * 按秩插入一个节点
         */
        insert: function (index, dom) {
            if (index < this.childNodes.length) this.insertBefore(dom, this.childNodes[index]);
            else this.appendChild(dom);
        },
        /**
         * 修改 class 值
         */
        class: function (className) {
            this.className = '';
            for (var i = 0; i < arguments.length; i++) if (typeof arguments[i] === 'string')
                this.className += arguments[i] + ' ';
        },
        append: function (dom) {
            this.appendChild(dom);
        },
        remove: function (dom) {
            if (dom.parentNode === this) this.removeChild(dom);
        },
        delay: function (time) {
            if (!time) return;
            if (!this['delayTime'] || !this['delayTime'].length) this['delayTime'] = [[time, 0]];
            else this['delayTime'].push([time, this['delayTime'][this['delayTime'].length - 1][1] + 1]);
        }
    };
    for (var domFn in domFns)
        if (domFns.hasOwnProperty(domFn))
            Element.prototype[domFn] = (function (domFn) {
                return function () {
                    if (domFn !== 'delay' && this['delayTime'] && this['delayTime'].length) {
                        var delayTime = 0;
                        for (var i = 0; i < this['delayTime'].length; i++) delayTime += this['delayTime'][i][0];
                        setTimeout((function (_this, _arguments, end) {
                            return function () {
                                while (_this['delayTime'].length && _this['delayTime'][0][1] <= end)
                                    _this['delayTime'].shift();
                                domFns[domFn].apply(_this, _arguments);
                                if (_arguments.length && typeof _arguments[_arguments.length - 1] === 'function')
                                    _arguments[_arguments.length - 1]();
                            }
                        })(this, arguments, this['delayTime'][this['delayTime'].length - 1][1]), delayTime);
                    } else {
                        domFns[domFn].apply(this, arguments);
                        if (arguments.length && typeof arguments[arguments.length - 1] === 'function')
                            arguments[arguments.length - 1]();
                    }
                    return this;
                };
            })(domFn);

    return $;

})();

/**
 * 统一路径
 * 可在使用 CDN 时, 解决不同源的问题
 * @type {{url, api}}
 */
var path = (function () {
    var genFn = function (rootPath) {
        if (typeof rootPath !== 'string') rootPath = '';
        return function (url) {
            if (typeof url !== 'string') url = '';
            if (!url.search('//') || -1 < url.search('://')) return '' + url;
            return rootPath + url;
        };
    };

    return {
        api: genFn(window.iBlog['rootAPIPath']),
        url: genFn(window.iBlog['rootStaticPath'])
    }
})();

/**
 * ajax 加载动画
 */
(function () {

    var dom;
    // 现存的数量
    var number = 0;

    // 创建 dom
    var createDom = function () {
        var d = $.createElement('section', {id: 'loader'});
        for (var i = 1; i < 5; i++) d.append($.createElement('section', {id: 'loader' + i}));
        return d
    };

    $.ajax.setBeforeRequest(function () {
        if (number++ === 0) document.body.append((dom = createDom()).delay(30).class('active'));
    });
    $.ajax.setAfterRequest(function () {
        if (--number) return;
        var old = dom;
        dom = undefined;
        var diagonal = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);

        if (1600 < window.innerWidth) for (var i = 0; i < 4; i++) old.children[i].delay(150 * i).css({
            'opacity': 0.8,
            'border-width': diagonal / 2 + 'px',
            'left': (window.innerWidth - diagonal) / 2 + 'px',
            'top': (window.innerHeight - diagonal) / 2 + 'px'
        }, 1000);

        old.delay(1600 < window.innerWidth ? 500 : 0).css({opacity: 0}, function () {
            $('body').delay(500).remove(old);
        });
    });

})();

/**
 * 绑定一些常用的时间格式处理
 */
(function () {
    var month = [
        '一月', '二月', '三月', '四月',
        '五月', '六月', '七月', '八月',
        '九月', '十月', '十一月', '十二月'
    ];

    Date.prototype.toReadableDateString = function () {
        return month[this.getMonth()] + ', ' + this.getDate() + ' ' + this.getFullYear()
    };

    Date.prototype.toReadableFullString = function () {
        return this.getFullYear() + '/' + (this.getMonth() + 1) + '/' + this.getDate() + ' ' +
            (this.getHours() < 10 ? '0' : '') + this.getHours() + ':' +
            (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
    };

    Date.prototype.toReadableTimeString = function () {
        return (this.getHours() < 10 ? '0' : '') + this.getHours() + ':' +
            (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
    };

    Date.prototype.toInputBoxValue = function () {
        return this.getFullYear() + '-' +
            ((this.getMonth() + 1 > 9) ? '' : '0') + (this.getMonth() + 1) + '-' +
            ((this.getDate() > 9) ? '' : '0') + this.getDate() + 'T' +
            ((this.getHours() > 9) ? '' : '0') + this.getHours() + ':' +
            ((this.getMinutes() > 9) ? '' : '0') + this.getMinutes();
    };

    Date.prototype.toUnixStamp = function () {
        return Math.floor(this.getTime() / 1000);
    };

    String.prototype.toDateFromInputBox = function () {
        if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(this)) return new Date(
            this.slice(0, 4),
            (Number(this.slice(5, 7)) - 1).toString(),
            this.slice(8, 10),
            this.slice(11, 13),
            this.slice(14, 16)
        )
    };

})();

/**
 * 通知消息类
 */
var Notify = (function () {

    var Notify = function (message, timeout) {
        this.__queue = [];
        this.append(message, timeout);
    };

    Notify.prototype.append = function (message, timeout) {
        return this.__queue.push([message, timeout]), this;
    };

    Notify.prototype.show = function (force) {
        if (this.__running && !force) return;
        this.__running = true;
        var message = this.__queue.shift();
        var notification = $.createElement('section', message[0], {class: 'notification'});
        $('body').appendChild(notification);
        notification.delay(30).css({
            'bottom': '0',
            'opacity': '1'
        }).delay((typeof message[1] === 'number') ? message[1] : 2000).css({
            'bottom': '-2em',
            'opacity': '0'
        }, (function (_this) {
            return function () {
                $('body').delay(500).remove(notification);
                if (_this.__queue.length) _this.show(true);
                else _this.__running = undefined;
            }
        })(this));
        return this;
    };

    return Notify;

})();

/**
 * 网页最上方添加一个不可见的层, 阻止用户点击
 * @type {{on, off}}
 */
var locker = (function () {
    var number = 0, dom = $.createElement('section', {id: 'locker'});
    dom.addEventListener('click', function () {
        new Notify('正在加载数据, 请稍安勿躁~').show()
    });

    return {
        on: function () {
            // 使用 appendChild 而非 append
            // 是因为我的 JavaScript 库中 delay 函数存在的 bug
            if (!number++) $('body').appendChild(dom);
        },
        off: function () {
            if (!number) return;
            if (!--number) $('body').removeChild(dom);
        }
    }

})();
