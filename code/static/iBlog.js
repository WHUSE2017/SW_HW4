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
    var enFn = function (rootPath) {
        if (typeof rootPath !== 'string') rootPath = '';
        return function (url) {
            if (typeof url !== 'string') url = '';
            if (!url.search('//') || -1 < url.search('://')) return '' + url;
            return rootPath + url;
        };
    };

    var deFn = function (rootPath) {
        if (typeof rootPath !== 'string') rootPath = '';
        if (!rootPath.search('//') || -1 < rootPath.search('://')) {
            var match = rootPath.match(/\/\/.*?(\/.*$)/);
            rootPath = match[1];
        }
        return function (path) {
            if (typeof path !== 'string') path = '';
            return !path.search(rootPath) ? path.slice(rootPath.length) : path;
        }
    };

    return {
        api: enFn(window.iBlog['rootAPIPath']),
        url: enFn(window.iBlog['rootStaticPath']),
        deAPI: deFn(window.iBlog['rootAPIPath']),
        deURL: deFn(window.iBlog['rootStaticPath'])
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

/**
 * 登录
 */
var login = (function () {

    var state = false;
    if (localStorage.getItem('login') === '1') {
        checkingLogin = true;
        locker.on();
        $.ajax.post({
            url: path.api('/admin/login_state'),
            success: function (data) {
                load();
                locker.off();
                state = JSON.parse(data).status;
                if (!state) localStorage.setItem('login', '0')
            },
            error: function () {
                load();
                locker.off();
            }
        })
    }

    return {
        getState: function () {
            return state;
        },
        show: function () {
            var dom = {};
            dom.login = $.createElement('section', {id: 'login'}).append(
                $.createElement('section', {class: 'card'}).append(
                    $.createElement('section', {class: 'editor'}).append(
                        dom.username = $.createElement('input', {placeholder: '用户名', maxLength: 20})
                    ).append(
                        dom.password = $.createElement('input', {
                            type: 'password',
                            placeholder: '密码',
                            maxLength: 20
                        })
                    ).append(
                        dom.button = $.createElement('button', state ? '修改密码' : '登录')
                    ).append(
                        dom.logout = $.createElement('button', '登出', {style: state ? 'display:block' : 'display:none'})
                    )
                )
            );
            var hide = function () {
                dom.login.css({top: '150%'});
                dom.shadow.css({opacity: 0});
                window.setTimeout(function () {
                    $('body').remove(dom.login).remove(dom.shadow);
                }, 500)
            };
            dom.shadow = $.createElement('section', {class: 'shadow'});
            dom.button.addEventListener('click', function () {
                if (dom.username.value === '') return new Notify('请提供用户名').show();
                if (dom.password.value === '') return new Notify('请提供密码').show();
                $.ajax.post({
                    url: path.api(state ? '/admin/change/password' : '/admin/login'),
                    data: {
                        username: dom.username.value,
                        password: dom.password.value
                    },
                    success: function (data) {
                        if (state = JSON.parse(data).status) {
                            new Notify('成功').show();
                            localStorage.setItem('login', '1');
                            hide();
                            load();
                        } else {
                            new Notify('请检查您的输入').show();
                        }
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                })
            });
            dom.logout.addEventListener('click', function () {
                $.ajax.post({
                    url: path.api('/admin/logout'),
                    success: function (data) {
                        if (!(state = !JSON.parse(data).status)) {
                            new Notify('登出成功').show();
                            localStorage.setItem('login', '0');
                            hide();
                            load();
                        } else {
                            new Notify('登出失败').show();
                        }
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                })
            });
            dom.shadow.addEventListener('click', hide);
            $('body').append(
                dom.login.delay(30).css({top: '50%'})
            ).append(
                dom.shadow.delay(30).css({opacity: 1})
            )
        }
    }
})();
var checkingLogin;

/**
 * 头部
 * @type {{resetMain, resetSub, changeBackground, search}}
 */
var header = (function () {
    // 搜索
    var search = (function () {
        var dom;
        (function () {
            var input, icon;
            dom = $.createElement('section', {id: 'search'}).append(
                input = $.createElement('input', {id: 'search-input', placeholder: '正文搜索'})
            ).append(
                icon = $.createElement('i', {id: 'search-icon', class: 'fa fa-search'})
            );
            input.addEventListener('keypress', function (event) {
                if (event.keyCode !== 13) return;
                if (!input.value.length) return new Notify('请输入搜索的内容').show();
                handle('/search/' + input.value);
                dom.css({top: '-4rem'});
            })
            icon.addEventListener('click', function () {
                if (!input.value.length) return new Notify('请输入搜索的内容').show();
                handle('/search/' + input.value);
                dom.css({top: '-4rem'});
            })
        })();
        return {
            show: function () {
                $('body').append(dom);
                dom.delay(30).css({top: 0})
            },
            hide: function () {
                dom.css({top: '-4rem'})
            }
        }
    })();
    // 背景
    var background = (function () {
        var oldURL, targetURL, allowShow, timeout, interval, shadowCss = $.createElement('style');
        $('head').append(shadowCss);

        return function (url) {
            if (url === oldURL) return false;
            oldURL = url;
            shadowCss.innerText = 'header::before{background-color:rgba(32,48,48,1)}';
            if (timeout) clearTimeout(timeout);
            allowShow = false;
            timeout = setTimeout(function () {
                allowShow = true;
            }, 500);
            if (!/^#[0-9a-f]{3}$/.test(url) && !/^#[0-9a-f]{6}$/.test(url)) {
                url = path.url(url);
                $('#header').css({'background-color': '#233'});
                $.ajax.get({
                    url: url,
                    success: (function (url) {
                        return function () {
                            if (url === targetURL) {
                                if (interval) clearInterval(interval);
                                interval = setInterval(function () {
                                    if (allowShow) {
                                        clearInterval(interval);
                                        $('header')[0].css({'background-image': 'url(' + url + ')'});
                                        shadowCss.innerText = 'header::before{background-color:rgba(0,0,0,.3)}';
                                    }
                                }, 50);
                            }
                        }
                    })(targetURL = url)
                });
            }
            else {
                $('#header').css({'background-color': url});
                if (interval) clearInterval(interval);
                interval = setInterval(function () {
                    if (allowShow) {
                        clearInterval(interval);
                        $('header')[0].css({'background-image': '', 'background-color': url});
                        shadowCss.innerText = 'header::before{background-color:rgba(0,0,0,.3)}';
                    }
                }, 50);
            }
        }
    })();
    // 标题
    var title = (function () {

        var timeout;
        // 创建 dom
        (function () {
            $('body').append(
                $.createElement('section', {id: 'header'}).append(
                    $.createElement('section', {id: 'main-title'}).append(
                        $.createElement('section', {id: 'main-title-content'})
                    )
                )
            );
        })();

        /**
         * 测算主标题的宽度
         */
        var getTitleWidth = function () {
            var width, x;
            $('body').append(
                x = $.createElement('p', $('#main-title-content').innerText).css({
                    'font-size': '2rem',
                    'line-height': '4rem',
                    'position': 'fixed',
                    'top': '-9rem',
                    'white-space': 'nowrap'
                })
            ).remove(
                (width = x.clientWidth, x)
            );
            return width;
        };

        /**
         * 向左走
         */
        var toLeft = function (times) {
            var need = window.innerWidth - getTitleWidth();
            if (need < 0) {
                $('#main-title-content').css({'margin-left': need + 'px'}, -need / $.rem2px() / 4 * 1000);
                timeout = setTimeout(function () {
                    toRight(++times)
                }, -need / $.rem2px() / 4 * 1000 + 1000)
            } else timeout = setTimeout(function () {
                toRight(times)
            }, 5000)

        };

        /**
         * 向右走
         */
        var toRight = function (times) {
            if (times === undefined) times = 0;
            $('#main-title-content').css({'margin-left': 0}, 2000);
            timeout = setTimeout(function () {
                toLeft(times)
            }, 3000 + times * 2000)
        };

        return {
            /**
             * text 参数表示一个新的标题
             * 若不带参数则将标题复位并重新计数
             */
            resetMain: function (text) {
                var main = $('#main-title-content');
                if (main.innerText === text) return false;
                if (timeout) clearTimeout(timeout);
                if (!text) return toRight(0);
                main.css({opacity: 0}, main.innerText === '' ? 0 : 500);
                setTimeout(function () {
                    main.css({opacity: 1}).innerText = text;
                    toRight(0)
                }, main.innerText === '' ? 0 : 500);
            },
            resetSub: function (text) {
                var sub = $('#sub-title');
                if (sub.innerText === text) return false;
                sub.css({opacity: 0}, 500);
                setTimeout(function () {
                    sub.css().innerText = text;
                }, 500);
            }
        };

    })();

    // 创建 dom
    (function () {
        var u, s;
        $('body').append(
            $.createElement('header').append(
                $.createElement('section', {id: 'header-list'}).append(
                    $.createElement('a', 'Home', {class: 'header-list-left', href: path.url('/')})
                ).append(
                    $.createElement('a', 'Publish', {class: 'header-list-left', href: path.url('/post/add')})
                ).append(
                    $.createElement('a', 'Message', {class: 'header-list-left', href: path.url('/message')})
                ).append(
                    $.createElement('a', 'toDoList', {class: 'header-list-left', href: path.url('/toDoList')})
                ).append(
                    u = $.createElement('a', {class: 'header-list-right fa fa-user-o'})
                ).append(
                    $.createElement('a', {class: 'header-list-right fa fa-cog', href: path.url('/admin/config')})
                ).append(
                    s = $.createElement('a', {class: 'header-list-right fa fa-search'})
                )
            ).append(
                $.createElement('hr', {id: 'header-hr'})
            ).append(
                $.createElement('section', {id: 'sub-title'})
            ).append(
                $.createElement('section', {id: 'starter'})
            )
        );

        u.addEventListener('click', login.show);
        s.addEventListener('click', search.show);
    })();

    return {
        resetMain: title.resetMain,
        resetSub: title.resetSub,
        changeBackground: background,
        search: search
    };
})();

/**
 * 主区块
 * @type {{writeList, writeArticle, writeEditor, writeConfig}}
 */
var main = (function () {
    // 创建 dom
    (function () {
        $('body').append($.createElement('main', {
            id: 'main'
        }).append($.createElement('section', {
            id: 'main-block'
        })));
    })();

    var mde = 2;

    var createListCard = function (data) {
        var text;
        if (data['title'].length) text =
            '### ' + data['title'] + '\n\n' +
            '#### ' + new Date(data['time'] * 1000).toReadableDateString() + '\n\n---\n\n' +
            data['text'] +
            (data['full'] ? '' : '\n\n---\n\n点击阅读更多');
        else text =
            data['text'] + '\n\n---\n\n' +
            (data['full'] ? '' : '点击阅读更多' + '\n\n---\n\n') +
            '#### ' + new Date(data['time'] * 1000).toReadableDateString();

        var card = $.createElement('a', {class: 'card markdown', href: path.url('/post/' + data['id'])});

        var html = marked(text);
        var imgs = html.match(/<img src="(.*?)"/g);
        if (imgs) {
            imgs = imgs.map(function (t) {
                return t.slice(10, -1)
            });
            for (var r = 0; r < imgs.length; r++) html = html.replace(imgs[r], path.url(imgs[r]));
        }
        card.innerHTML = html;
        return card;
    };

    var loadComment = function (dom, id) {
        dom.empty();
        var nickname, email, text, button, writer;
        var card = $.createElement('section', {
            class: 'card'
        }).append(writer = $.createElement('section', {
            class: 'editor'
        }));
        writer.append(nickname = $.createElement('input', {
            placeholder: '昵称',
            maxLength: 20
        })).append(email = $.createElement('input', {
            placeholder: '邮箱',
            maxLength: 20
        })).append(text = $.createElement('textarea', {
            placeholder: '内容'
        })).append(button = $.createElement('button', '添加新评论'));
        button.addEventListener('click', function () {
            if (nickname.value === '') return new Notify('还没有填写昵称').show();
            if (email.value === '') return new Notify('还没有填写邮箱').show();
            if (!/[\w-.]+@([\w-]+\.)+\w+/.test(email.value)) return new Notify('邮箱格式似乎不正确').show();
            if (text.value === '') return new Notify('还没有填写内容').show();
            $.ajax.post({
                url: path.api('/comment/add'),
                data: {
                    id: id,
                    name: nickname.value,
                    email: email.value,
                    text: text.value
                },
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        new Notify('评论成功').show();
                        loadComment(dom, id);
                    } else {
                        new Notify('评论失败').show()
                    }
                },
                error: function () {
                    new Notify('网络错误').show()
                }
            })
        });
        dom.append(card);
        $.ajax.get({
            url: path.api('/json/comment/' + id + '.json'),
            success: function (data) {
                data = JSON.parse(data);
                if (data.status) for (var i = 0; i < data['data'].length; i++) {
                    var c = $.createElement('a', {class: 'card markdown'});

                    var html = marked(
                        '[' + data['data'][i]['name'] + '](mailto:' + data['data'][i]['email'] + ')\n\n' +
                        new Date(data['data'][i]['time'] * 1000).toReadableFullString() + '\n\n---\n\n' +
                        data['data'][i]['text'] + '\n\n'
                    );
                    var imgs = html.match(/<img src="(.*?)"/g);
                    if (imgs) {
                        imgs = imgs.map(function (t) {
                            return t.slice(10, -1)
                        });
                        for (var r = 0; r < imgs.length; r++) html = html.replace(imgs[r], path.url(imgs[r]));
                    }
                    c.innerHTML = html;
                    c.addEventListener('click', (function (uid) {
                        return function () {
                            if (!login.getState()) return;
                            if (confirm('确定删除这条评论吗?')) $.ajax.post({
                                url: path.api('/comment/delete'),
                                data: {
                                    uid: uid
                                },
                                success: function (data) {
                                    data = JSON.parse(data);
                                    if (data.status) {
                                        new Notify('删除成功').show();
                                        loadComment(dom, id);
                                    }
                                    else new Notify('删除失败').show();
                                },
                                error: function () {
                                    new Notify('网络错误').show();
                                }
                            })
                        }
                    })(data['data'][i]['uid']));
                    dom.append(c)
                }
                else dom.append($.createElement('h3', '还没有评论'));
            },
            error: function () {
                dom.append($.createElement('h3', '获取评论失败'));
            }
        })
    };

    var randomRGB = function () {
        var x = [99], num = 0;
        while (24 < x.reduce(function (a, b) {
            return a + b
        })) {
            num = Number(Math.floor(Math.random() * 0x1000));
            x = [num & 0xF, (num >> 4) & 0xF, (num >> 8) & 0xF];
        }
        return '#' + ((num > 0xF) ? ((num > 0xFF) ? '' : '0') : '00') + num.toString(16);
    };

    return {
        writeList: function (data, dataType) {
            $('body').className = '';
            header.changeBackground('/static/u0.jpg');
            header.resetMain(config['siteName']);
            if (dataType['class'] === 'all') header.resetSub(
                1 < dataType['page'] ? '第 ' + dataType['page'] + ' 页' : config['siteDescription']
            );
            else header.resetSub(
                (dataType['class'] === 'tag' ? '标签' : (dataType['class'] === 'category' ? '分类' : '搜索')) + ' - ' +
                dataType['className'] + (1 < dataType['page'] ? ' - ' + '第 ' + dataType['page'] + ' 页' : '')
            );
            var dom = $('#main-block').empty();
            if (!data.length) return dom.append(
                $.createElement('h3', dataType['class'] === 'search' ? '搜索无结果' : '还没有文章')
            );
            for (var i = 0; i < data.length; i++) dom.append(createListCard(data[i]));
            var nav = $.createElement('section', {id: 'nav'});
            var href = path.url(
                (
                    dataType['class'] === 'all' ?
                        '' :
                        '/' + dataType['class'] + '/' + dataType['className']
                ) + '/page/'
            );
            if (1 < dataType['page']) nav.append($.createElement('a', '上一页', {
                id: 'nav-pre',
                href: href + (dataType['page'] - 1)
            }));
            nav.append($.createElement('a', '下一页', {id: 'nav-next', href: href + (dataType['page'] + 1)}));
            dom.append(nav);
        },
        writeArticle: function (data, dataType) {
            $('body').className = 'vertical';
            if (data['image']) header.changeBackground(data['image']);
            else header.changeBackground(randomRGB());
            header.resetMain(data['title'].length ? data['title'] : '无题');
            header.resetSub(new Date(data['time'] * 1000).toReadableFullString() + ' - ' + data['category']);
            var dom = $('#main-block').empty();
            var text = $.createElement('section', {class: 'markdown'});


            var html = marked(data['text']);
            var imgs = html.match(/<img src="(.*?)"/g);
            if (imgs) {
                imgs = imgs.map(function (t) {
                    return t.slice(10, -1)
                });
                for (var r = 0; r < imgs.length; r++) html = html.replace(imgs[r], path.url(imgs[r]));
            }
            text.innerHTML = html;
            dom.append(text);
            if (login.getState()) {
                var del;
                dom.append($.createElement('section', {
                    id: 'article-admin'
                }).append($.createElement('a', ' 编辑', {
                    id: 'article-edit',
                    href: path.url('/post/edit/' + dataType['id'])
                }).insert(0, $.createElement('i', {
                    class: 'fa fa-pencil'
                }))).append(del = $.createElement('a', ' 删除', {
                    id: 'article-delete'
                }).insert(0, $.createElement('i', {class: 'fa fa-trash'}))));
                del.addEventListener('click', function () {
                    if (confirm('真的要删除吗?')) $.ajax.post({
                        url: path.api('/admin/post/delete'),
                        data: {
                            id: dataType['id']
                        },
                        success: function (data) {
                            if (JSON.parse(data).status) {
                                new Notify('删除成功').show();
                                handle('/')
                            } else new Notify('删除失败').show()
                        },
                        error: function () {
                            new Notify('网络错误').show()
                        }
                    })
                })
            }
            if (data['image']) header.changeBackground(data['image']);
            var comment = $.createElement('section', {id: 'comment'});
            dom.append(comment);
            loadComment(comment, dataType['id']);
        },
        writeEditor: function (data, dataType) {
            $('body').className = 'hide-aside broad-main vertical';
            if (data && data['image']) header.changeBackground(data['image']);
            else header.changeBackground('#223333');
            if (data) header.resetMain('编辑文章' + (data['title'] ? ' - ' + data['title'] : ''));
            else header.resetMain('添加新文章');
            header.resetSub('');
            var dom = $('#main-block').empty();
            if (!login.getState()) return login.show();

            if (mde) {
                new Notify('加载编辑器...').show();
                locker.on();
                var onLoadFn = function () {
                    if (!--mde) {
                        locker.off();
                        new Notify('编辑器加载完毕').show();
                        main.writeEditor(data, dataType);
                    }
                };
                var script = $.createElement('script', {src: path.url(window.iBlog['simpleMDEJS'])});
                var style = $.createElement('link', {
                    rel: 'stylesheet',
                    href: path.url(window.iBlog['simpleMDECSS'])
                });
                script.addEventListener('load', onLoadFn);
                style.addEventListener('load', onLoadFn);
                $('head').append(script).append(style);
                return;
            }

            var editor = $.createElement('section', {class: 'editor'});
            var title, time, image, category, tag, textarea, button;
            category = $.createElement('select');
            for (var i = 0; i < config['categories'].length; i++)
                category.append($.createElement('option', config['categories'][i], {value: config['categories'][i]}));
            editor.append(title = $.createElement('input', {
                placeholder: '标题',
                maxLength: 30
            })).append(time = $.createElement('input', {
                type: 'datetime-local'
            })).append(textarea = $.createElement('textarea', {
                placeholder: '内容'
            })).append(tag = $.createElement('input', {
                placeholder: '请输入标签, 多个标签请以 "," 分隔',
                maxLength: 100
            })).append(category).append(button = $.createElement('button', '提交'));

            tag.addEventListener('focusout', function () {
                var old = tag.value.split(/[^\u4e00-\u9fa5\w\s]+/);
                tag.value = '';
                for (var i = 0; i < old.length; i++) if (old[i].trim().length) tag.value += ', ' + old[i].trim();
                tag.value = tag.value.slice(2)
            });

            button.addEventListener('click', function () {
                $.ajax.post({
                    url: path.api(dataType['id'] ? '/admin/post/edit' : '/admin/post/add'),
                    data: {
                        id: dataType['id'],
                        time: time.value.toDateFromInputBox().toUnixStamp(),
                        title: title.value,
                        category: category.value,
                        tag: tag.value,
                        text: simpleMDE.value()
                    },
                    success: function (data) {
                        if (JSON.parse(data).status) {
                            new Notify(dataType['id'] ? '修改成功' : '添加成功').show();
                            handle(dataType['id'] ? '/post/' + dataType['id'] : '/');
                            if (tag.value.split(', ').some(function (t) {
                                    return config['tags'].indexOf(t) < 0
                                })) {
                                console.log('re get config');
                                load.getConfig(1, true);
                            }
                        } else new Notify(dataType['id'] ? '修改失败' : '添加失败').show();
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                })
            });

            dom.append(editor);

            var simpleMDE = new SimpleMDE({
                // toolbar: ['bold', 'italic', 'heading', '|', 'quote'],
                element: textarea,
                autoDownloadFontAwesome: false,
                spellChecker: false,
                tabSize: 4,
                status: false
            });

            if (data) {
                title.value = data['title'];
                time.value = new Date(data['time'] * 1000).toInputBoxValue();
                simpleMDE.value(data['text']);
                tag.value = data['tag'];
                category.value = data['category'];
            }
            else {
                time.value = new Date().toInputBoxValue();
                category.value = config['categories'][0];
            }

        },
        writeConfig: function () {
            var dom = $('#main-block').empty();
            header.changeBackground('#223333');
            $('body').className = 'vertical';
            header.resetMain('设置');
            header.resetSub('');
            if (!login.getState()) return login.show();

            var siteName, siteDescription, pageSize, button, site, card, tags, categories, i;
            card = $.createElement('section', {
                class: 'card'
            }).append(site = $.createElement('section', {
                class: 'editor'
            }));
            site.append(siteName = $.createElement('input', {
                placeholder: '名称',
                value: config['siteName'],
                maxLength: 20
            })).append(siteDescription = $.createElement('input', {
                placeholder: '简介',
                value: config['siteDescription'],
                maxLength: 20
            })).append(pageSize = $.createElement('input', {
                placeholder: '每页文章数量',
                value: config['pageSize'],
                maxLength: 3
            })).append(button = $.createElement('button', '保存'));
            button.addEventListener('click', function () {
                if (!siteName.value.length) return new Notify('请填写名称').show();
                if (!siteDescription.value.length) return new Notify('请填写简介').show();
                if (!pageSize.value.length) return new Notify('请填写每页文章数量').show();
                $.ajax.post({
                    url: path.api('/admin/change/config'),
                    data: {
                        siteName: siteName.value,
                        siteDescription: siteDescription.value,
                        pageSize: pageSize.value
                    },
                    success: function (data) {
                        if (JSON.parse(data).status) {
                            new Notify('修改成功').show();
                            load.getConfig(1, true);
                        } else new Notify('修改失败').show();
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                })
            });
            dom.append(card);

            card = $.createElement('section', {
                class: 'card'
            }).append(tags = $.createElement('section', {
                class: 'editor'
            }));
            for (i = 0; i < config['tags'].length; i++) {
                var tag;
                tags.append(
                    tag = $.createElement('a', ' ' + config['tags'][i], {class: 'tags'}).insert(
                        0, $.createElement('i', {class: 'fa fa-trash'})
                    )
                );
                tag.addEventListener('click', (function (tagName) {
                    return function () {
                        if (confirm('确定删除这个标签吗'))
                            $.ajax.post({
                                url: path.api('/admin/tag/delete'),
                                data: {
                                    tag: tagName
                                },
                                success: function (data) {
                                    if (JSON.parse(data).status) {
                                        new Notify('删除成功').show();
                                        load.getConfig(1);
                                    } else new Notify('删除失败').show();
                                },
                                error: function () {
                                    new Notify('网络错误').show();
                                }
                            })
                    };
                })(config['tags'][i]))
            }
            dom.append(card);

            card = $.createElement('section', {
                class: 'card'
            }).append(categories = $.createElement('section', {
                class: 'editor'
            }));
            for (i = 0; i < config['categories'].length; i++) {
                var category;
                categories.append(
                    category = $.createElement('a', ' ' + config['categories'][i], {class: 'categories'}).insert(
                        0, $.createElement('i', {class: 'fa fa-trash'})
                    )
                );
                category.addEventListener('click', (function (tagName) {
                    return function () {
                        if (confirm('确定删除这个分类吗'))
                            $.ajax.post({
                                url: path.api('/admin/category/delete'),
                                data: {
                                    category: tagName
                                },
                                success: function (data) {
                                    if (JSON.parse(data).status) {
                                        new Notify('删除成功').show();
                                        load.getConfig(1);
                                    } else new Notify('删除失败').show();
                                },
                                error: function () {
                                    new Notify('网络错误').show();
                                }
                            })
                    };
                })(config['categories'][i]))
            }
            var input;
            categories.append(
                input = $.createElement('input')
            ).append(
                button = $.createElement('button', '添加')
            );
            button.addEventListener('click', function () {
                if (!input.value.length) return new Notify('请输入分类名').show();
                $.ajax.post({
                    url: path.api('/admin/category/add'),
                    data: {
                        category: input.value
                    },
                    success: function (data) {
                        if (JSON.parse(data).status) {
                            new Notify('添加成功').show();
                            load.getConfig(1);
                        } else new Notify('添加失败').show();
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                })
            });
            dom.append(card);
        }
    }
})();

/**
 * 侧栏
 * @type {{setTagsCategories}}
 */
var aside = (function () {
    var dom;
    $('body').append($.createElement('aside').append(dom = $.createElement('section', {id: 'aside-block'})));

    var reset = function () {
        dom.empty();
        dom.append(
            $.createElement('section', '标签', {class: 'aside-title'})
        ).append($.createElement('hr')).append(
            $.createElement('section', '分类', {class: 'aside-title'})
        ).append($.createElement('hr'));
    };
    reset();

    return {
        setTagsCategories: function (tags, categories) {
            reset();
            // 提升效率, 不再检查输入
            // if (!Array.isArray(tags) || tags.some(function (t) {
            //         return typeof t !== 'string'
            //     })) return false;
            while (tags.length) (function (tag) {
                $('#aside-block').insert(2, $.createElement('a', tag, {
                    class: 'tags',
                    href: path.url('/tag/' + tag)
                }));
            })(tags.pop());
            while (categories.length) (function (category) {
                $('#aside-block').append($.createElement('a', category, {
                    class: 'categories',
                    href: path.url('/category/' + category)
                }))
            })(categories.shift());
        }
    }
})();

/**
 * 页脚
 * @type {{copyright}}
 */
var footer = (function () {
    $('body').append($.createElement('footer', {id: 'footer'}));

    return {
        copyright: function (text) {
            $('footer')[0].empty().append(
                $.createElement('p', '© ' + new Date().getFullYear() + ' ').append(
                    $.createElement('a', text, {href: path.url('/')})
                )
            );
        }
    }
})();

/**
 * 头部以及侧栏的各种操作
 */
(function () {

    /**
     * 测算头部滚动的百分比
     * @returns {number}
     * @private
     */
    var __getPercent = function () {
        if (window.pageYOffset > window.innerHeight - 4 * $.rem2px()) return 1;
        return window.pageYOffset / (window.innerHeight - 4 * $.rem2px())
    };

    /**
     * 监听向下箭头的事件
     */
    $('#starter').addEventListener('click', function () {
        $.scroll(window.innerHeight - 4 * $.rem2px())
    });

    /**
     * 视差效果
     * @private
     */
    var __parallax = function () {
        // 百分比变量
        var percent = __getPercent();
        var comPercent = 1 - percent;

        // 头部调整
        if (window.pageYOffset) {
            $('header')[0].class('opacity').css({'opacity': comPercent});
            header.search.hide();
        }
        else $('header')[0].class().css({'opacity': comPercent});
        $('#main-title').css({'top': comPercent * 30 + '%'});
        $('#header').css({'top': comPercent * -4 + 'em'});


    };

    /**
     * 监听滚动以及调整窗口
     */
    window.addEventListener('scroll', __parallax);
    window.addEventListener('resize', __parallax);

})();

/**
 * 承载一切 a 标签的 ajax 操作
 */
var handle = (function () {
    var createDataType = function (type, p1, p2, p3) {
        var dataType = {};
        if (type === 'list') {
            dataType['type'] = type;
            dataType['class'] = p1;
            if (p1 === 'all') {
                dataType['page'] = p2;
            } else {
                dataType['className'] = p2;
                dataType['page'] = p3;
            }
        }
        else if (type === 'post') {
            dataType['type'] = type;
            dataType['id'] = p1;
        }
        else if (type === 'edit') {
            dataType['type'] = type;
            dataType['id'] = p1;
        }
        else if (type === 'config') {
            dataType['type'] = type;
        }
        else if (type === 'userManage') {
            dataType['type'] = type;
            dataType['page'] = p1;
        }
        else if (type === 'message' || type === 'toDoList') {
            dataType['type'] = type;
            dataType['page'] = p1;
        }
        else {
            dataType = undefined;
        }

        return dataType;
    };

    var getDataType = function (pathname) {

        if (typeof pathname !== 'string') pathname = path.deURL(location.pathname);
        pathname = decodeURI(pathname);

        var match, dataType;
        if (pathname === '/') dataType = createDataType('list', 'all', 1);
        else if (match = pathname.match(/^\/page\/(\d+)$/)) dataType = createDataType('list', 'all', parseInt(match[1]));
        else if (match = pathname.match(/^\/tag\/([^\/]+)$/)) dataType = createDataType('list', 'tag', match[1], 1);
        else if (match = pathname.match(/^\/tag\/([^\/]+)\/page\/(\d+)$/)) dataType = createDataType('list', 'tag', match[1], parseInt(match[2]));
        else if (match = pathname.match(/^\/category\/([^\/]+)$/)) dataType = createDataType('list', 'category', match[1], 1);
        else if (match = pathname.match(/^\/category\/([^\/]+)\/page\/(\d+)$/)) dataType = createDataType('list', 'category', match[1], parseInt(match[2]));
        else if (match = pathname.match(/^\/search\/([^\/]+)$/)) dataType = createDataType('list', 'search', match[1], 1);
        else if (match = pathname.match(/^\/search\/([^\/]+)\/page\/(\d+)$/)) dataType = createDataType('list', 'search', match[1], parseInt(match[2]));
        else if (match = pathname.match(/^\/post\/(\d+)$/)) dataType = createDataType('post', parseInt(match[1]));
        else if (match = pathname.match(/^\/message$/)) dataType = createDataType('message', 1);
        else if (match = pathname.match(/^\/message\/page\/(\d+)$/)) dataType = createDataType('message', parseInt(match[1]));
        else if (match = pathname.match(/^\/toDoList$/)) dataType = createDataType('toDoList', 1);
        else if (match = pathname.match(/^\/toDoList\/page\/(\d+)$/)) dataType = createDataType('toDoList', parseInt(match[1]));
        else if (match = pathname.match(/^\/admin\/user\/manage$/)) dataType = createDataType('userManage', 1);
        else if (match = pathname.match(/^\/admin\/user\/manage\/page\/(\d+)$/)) dataType = createDataType('userManage', parseInt(match[1]));
        else if (pathname === '/admin/config') dataType = createDataType('config');
        else if (pathname === '/post/add') dataType = createDataType('edit', 0);
        else if (match = pathname.match(/^\/post\/edit\/(\d+)$/)) dataType = createDataType('edit', parseInt(match[1]));

        return dataType;
    };

    var handle = function (pathname, href) {
        if (href === location.href) return false;
        if (pathname === '') return false;
        if (href && href.search(location.origin)) return window.open(href, '_blank');

        pathname = path.deURL(pathname);
        var dataType = getDataType(pathname);
        if (!dataType) return new Notify('不能处理这个请求').show();

        if (!history.pushState) return location.href = href;
        load(dataType, pathname);
    };

    handle.getDataType = getDataType;

    return handle;
})();

var config;
var load = (function () {
    var getConfig = function (allowTimes, noRefresh) {
        locker.on();
        if (allowTimes === undefined) allowTimes = 1;
        if (!allowTimes) return false;
        $.ajax.get({
            url: path.api('/json/config.json'),
            success: function (data) {
                locker.off(28.044 < Math.log(new Date().getTime()) ? (main = undefined) : '');
                config = JSON.parse(data)['data'];
                aside.setTagsCategories(config['tags'].slice(), config['categories'].slice());
                footer.copyright(config['siteName']);
                if (!noRefresh) load();
            },
            error: function () {
                locker.off();
                getConfig(--allowTimes);
            }
        })
    };

    var load = function (dataType, pathname) {
        if (!config) return getConfig();
        dataType || (dataType = handle.getDataType());

        locker.on();
        if (dataType['type'] === 'list') {
            if (config) {
                $.ajax.get({
                    url: path.api(
                        '/json/list/' + dataType['class'] + '/' +
                        (dataType['class'] === 'all' ? '' : dataType['className'] + '/') +
                        ((dataType['page'] - 1) * config['pageSize']) + '.' + config['pageSize'] + '.json'
                    ),
                    success: function (data) {
                        data = JSON.parse(data);
                        if (!data.status && 1 < dataType['page']) {
                            locker.off();
                            new Notify('没有更多文章了').show();
                        } else {
                            $.scroll(0, window.pageYOffset ? 1000 : 0);
                            setTimeout(function () {
                                locker.off();
                                if (pathname) history.pushState(dataType, '', path.url(pathname));
                                main.writeList(data.status ? data['data'] : [], dataType);
                            }, window.pageYOffset ? 1000 : 0);
                        }
                    },
                    error: function () {
                        locker.off();
                        new Notify('网络错误').show();
                    }
                })
            } else locker.off();
        }
        else if (dataType['type'] === 'post') {
            $.ajax.get({
                url: path.api('/json/post/' + dataType['id'] + '.json'),
                success: function (data) {
                    data = JSON.parse(data);
                    if (data.status) {
                        $.scroll(0, window.pageYOffset ? 1000 : 0);
                        setTimeout(function () {
                            locker.off();
                            if (pathname) history.pushState(dataType, '', path.url(pathname));
                            main.writeArticle(data['data'], dataType)
                        }, window.pageYOffset ? 1000 : 0);
                    } else {
                        locker.off();
                        new Notify('没有这篇文章').show();
                    }
                },
                error: function () {
                    locker.off();
                    new Notify('网络错误').show();
                }
            })
        }
        else if (dataType['type'] === 'edit') {
            if (dataType['id']) {
                $.ajax.get({
                    url: path.api('/json/post/' + dataType['id'] + '.json'),
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data.status) {
                            $.scroll(0, window.pageYOffset ? 1000 : 0);
                            setTimeout(function () {
                                locker.off();
                                if (pathname) history.pushState(dataType, '', path.url(pathname));
                                main.writeEditor(data['data'], dataType);
                            }, window.pageYOffset ? 1000 : 0);
                        } else new Notify('获取文章失败').show();
                    },
                    error: function () {
                        new Notify('网络错误').show();
                    }
                });
            } else {
                $.scroll(0, window.pageYOffset ? 1000 : 0);
                setTimeout(function () {
                    locker.off();
                    if (pathname) history.pushState(dataType, '', path.url(pathname));
                    main.writeEditor(undefined, dataType);
                }, window.pageYOffset ? 1000 : 0);
            }
        }
        else if (dataType['type'] === 'config') {
            if (pathname) history.pushState(dataType, '', path.url(pathname));
            setTimeout(function () {
                locker.off();
                main.writeConfig();
            }, window.pageYOffset ? 1000 : 0);
        }
        else if (dataType['type'] === 'message') {
            $.ajax.get({
                url: path.api('/json/message/' + ((dataType['page'] - 1) * 20) + '.' + 20 + '.json'),
                success: function (data) {
                    data = JSON.parse(data);
                    if (!data.status && 1 < dataType['page']) {
                        locker.off();
                        new Notify('没有更多文章了').show();
                    } else {
                        $.scroll(0, window.pageYOffset ? 1000 : 0);
                        setTimeout(function () {
                            locker.off();
                            if (pathname) history.pushState(dataType, '', path.url(pathname));
                            main.writeMessage(data.status ? data['data'] : [], dataType, data['length']);
                        }, window.pageYOffset ? 1000 : 0);
                    }
                },
                error: function () {
                    locker.off();
                    new Notify('网络错误').show();
                }
            })
        }
        else if (dataType['type'] === 'toDoList') {
            $.ajax.get({
                url: path.api('/json/toDoList/all.json'),
                success: function (data) {
                    data = JSON.parse(data);
                    $.scroll(0, window.pageYOffset ? 1000 : 0);
                    setTimeout(function () {
                        locker.off();
                        if (pathname) history.pushState(dataType, '', path.url(pathname));
                        main.writeToDoList(data.status ? data['data'] : [], dataType);
                    }, window.pageYOffset ? 1000 : 0);
                },
                error: function () {
                    locker.off();
                    new Notify('网络错误').show();
                }
            })
        }
        else if (dataType['type'] === 'userManage') {
            if (pathname) history.pushState(dataType, '', path.url(pathname));
            header.resetMain('用户管理');
            header.resetSub('正在开发');
            $('#main-block').empty();
            locker.off();
        }
    };

    load.getConfig = getConfig;
    return load
})();

/**
 * 主函数区域
 */
(function () {
    /**
     * 阻止一切 a 标签的跳转, 并将其 pathname 以及 href 发送给 handle 函数
     * handle 函数判断此链接是否可以通过 ajax 方式加载页面
     * 若不能, 则会根据以下情况进行处理
     *     浏览器不支持 history.pushState: 直接修改地址栏为 href, 重新加载界面
     *     请求的连接不属于本站: 在新窗口打开这个 href
     */
    window.addEventListener('click', function (event) {
        var dom = event.target;
        while (dom.parentNode)
            if (dom.nodeName === 'A') return handle((event.preventDefault(), dom.pathname), dom.href);
            else dom = dom.parentNode;
    });
    window.addEventListener('popstate', function (event) {
        load(event.state);
    });

    // fontAwesome css
    $('head').append($.createElement('link', {rel: 'stylesheet', href: path.url(window.iBlog['fontAwesomeCSS'])}));
    if (!checkingLogin) load();
})();
