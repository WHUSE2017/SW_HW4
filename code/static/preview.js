'use strict';

/**
 * 一个简单的 JavaScript 库
 */
var $ = (function () {

    /**
     * 基本选择器, 目前使用四种, '#id','.class', 'tagName', 原始的 Node 节点
     * @param   {Element|string}   selector  // Node 节点 || css选择器
     * @returns {Element|NodeList}
     */
    var $ = function (selector) {
        if (typeof selector === 'string')
            if (selector[0] === '#') return document.getElementById(selector.slice(1));
            else if (selector[0] === '.') return document.getElementsByClassName(selector.slice(1));
            else if (selector === 'body') return document.body;
            else if (selector === 'html') return document.getElementsByClassName('html')[0];
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
            style.innerText = style.innerText === '' ? '*{background: #000 !important;color: #0f0 !important;outline: solid #f00 1px !important;}' : '';
        };
    })();

    /**
     * 简单的窗口滚动的动画
     */
    $.scroll = function (position, time, effect) {
        if (typeof time !== 'number') time = 1000;
        var preventDefault = function (event) {
            if (event.hasOwnProperty('preventDefault')) event.preventDefault()
        };
        var transform = (function () {
            var sigmoid = function (x) {
                return 1 / (1 + Math.exp(-x))
            };
            if (effect === 'triangle') return function (percent) {
                return Math.sin(Math.PI * percent - Math.PI / 2) / 2 + .5
            };
            else if (effect === 'linear') return function (percent) {
                return percent
            };
            else {
                if (effect === 'sigmoid-ease-in-out') return function (percent) {
                    var sigmoid5 = sigmoid(5), sigmoid_5 = sigmoid(-5);
                    return (sigmoid(percent * 10 - 5) - sigmoid_5) / (sigmoid5 - sigmoid_5)
                };
                else return function (percent) {
                    var sigmoid8 = sigmoid(8), sigmoid_2 = sigmoid(-2);
                    return (sigmoid(percent * 10 - 2) - sigmoid_2) / (sigmoid8 - sigmoid_2)
                }
            }
        })();

        window.addEventListener('wheel', preventDefault);
        var now = window.pageYOffset, times = time / 20, need = position - now, i = 0;
        var interval = setInterval(function () {
            window.scrollTo(0, now + transform(i++ / times) * need);
            if (times < i) {
                clearInterval(interval);
                window.removeEventListener('wheel', preventDefault)
            }
        }, 20);
    };

    /**
     * CSS em 转 px 尺寸
     * @returns {number}
     */
    $.em2px = function () {
        var x = $.createElement('p', 'X');
        x.css({'line-height': '1em', 'position': 'fixed', 'left': '-100em'});
        $('body').appendChild(x);
        var height = x.clientHeight;
        $('body').removeChild(x);
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
         * @returns {boolean}           // 返回值 是否成功创建 XMLHttpRequest
         * @private
         */
        var sendRequest = function (method, url, timeout, data, success, error) {
            (__beforeRequest && typeof(__beforeRequest) === "function") && __beforeRequest();
            var request = new XMLHttpRequest();

            // 状态变更
            request.addEventListener('readystatechange', function () {
                if (request.readyState === 4) {
                    (__afterRequest && typeof(__afterRequest) === "function") && __afterRequest();
                    if (request.status >= 200 && request.status <= 300 || request.status === 304)
                        (success && typeof(success) === "function") && success(request.responseText);
                    else
                        (error && typeof(error) === "function") && error(request.status);
                }
            });

            // 超时
            try {
                request.timeout = (typeof timeout === 'number') ? timeout : 20000;
            } catch (e) {
                // 对于不支持超时选项的浏览器, 我真的无能为力
            }

            // 填充信息
            request.open(method, url, true);

            // 发送数据
            if (method === 'POST') {
                var sendInfo = '', x;
                for (x in data)
                    if (data.hasOwnProperty(x))
                        sendInfo = sendInfo + '&' + x + '=' + data[x];
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(sendInfo.slice(1));
            } else request.send();

            return !!request;
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
         * @returns {boolean}
         */
        css: function (value, duration, effect) {
            if (!value) return false;
            var oldCssText = this.style.cssText.split(';');
            this.style.cssText = '';
            for (var i = 0; i < oldCssText.length; i++) {
                var x = oldCssText[i].split(':');
                if (!(value.hasOwnProperty(x[0].trim()))) value[x[0].trim()] = x[1];
            }
            for (var key in value)
                if (value.hasOwnProperty(key))
                    this.style.cssText += key + ':' + value[key] + ';';
            if (typeof duration === 'number') {
                if (duration > 100) duration /= 1000;
                var t = 'all ' + duration + 's' + (effect ? ' ' + effect : '');
                this.css({
                    transition: t,
                    '-webkit-transition': t,
                    '-moz-transition': t,
                    '-o-transition': t
                });
            }
            return this;
        },
        /**
         * 延迟 30ms 执行上方的 css 函数, 用于某些情况下, CSS3 的动画处理不够及时
         */
        delayCss: function (value, duration, effect) {
            var _this = this;
            window.setTimeout(function () {
                _this.css(value, duration, effect);
            }, 30);
            return this
        },
        /**
         * 清空这个节点下所有内容
         */
        empty: function () {
            while (this.hasChildNodes()) this.removeChild(this.firstChild);
            return this
        },
        /**
         * 按秩插入一个节点
         */
        insert: function (index, dom) {
            if (index < this.childNodes.length)
                this.insertBefore(dom, this.childNodes[index]);
            else this.appendChild(dom);
            return this
        },
        /**
         * 修改 class 值
         */
        class: function (className) {
            this.className = '';
            for (var i = 0; i < arguments.length; i++)
                if (typeof arguments[i] === 'string')
                    this.className += arguments[i] + ' ';
            return this
        },
        hasClass: function (className) {
            var classes = this.className.split(' ');
            return classes.some(function (t) {
                return t === className
            })
        }
    };
    for (var domFn in domFns)
        if (domFns.hasOwnProperty(domFn))
            Element.prototype[domFn] = domFns[domFn];

    return $;

})();
