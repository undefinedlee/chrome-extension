define("chrome-extension-inject@0.1/page-background.js", function(require){
    return [
        		// page-background.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			Object.defineProperty(exports, "__esModule", {
        			    value: true
        			});
        			
        			exports.default = function (scripts) {
        			    scripts.forEach(function (script) {
        			        if (typeof script === "function") {
        			            injectScript(script);
        			        } else if ((typeof script === "undefined" ? "undefined" : babelHelpers.typeof(script)) === "object" && typeof script.id === "string" && typeof script.factory === "function") {
        			            var code = "define(\"" + script.id + "\", " + script.factory.toString() + ");";
        			            if (script.isEntry) {
        			                code += "\nrequire(\"" + script.id + "\");";
        			            }
        			            injectScript(code);
        			        }
        			    });
        			};
        			
        			var _bridge = __inner_require__(1 /*bridge.js*/);
        			
        			var _bridge2 = babelHelpers.interopRequireDefault(_bridge);
        			
        			// 注入桥接脚本
        			function injectBridge() {
        			    location.href = 'javascript:void((' + _bridge2.default.toString().replace(/\/\/.*\n/g, "").replace(/\n/g, "") + ')())';
        			}
        			
        			// 创建用于通信的dom节点
        			/**
        			 * 此脚本是chrome的content script
        			 * 运行在每个页面中，但是只能操作页面的dom，无法与页面中的js进行交互
        			 */
        			
        			var messageDom = document.createElement("div");
        			messageDom.id = "__$_Kraken_message_dom_$__";
        			messageDom.style.cssText = "display:none;";
        			document.body.appendChild(messageDom);
        			
        			// bridge注入ready事件
        			var listeners = [];
        			var isReady = false;
        			function onReady(listener) {
        			    if (isReady) {
        			        listener();
        			    } else {
        			        listeners.push(listener);
        			    }
        			}
        			
        			// 当桥接脚本准备好后，就可以开始向页面发送命令
        			messageDom.addEventListener("inject-ready", function () {
        			    isReady = true;
        			    listeners.forEach(function (listener) {
        			        listener();
        			    });
        			    listeners = [];
        			});
        			
        			// 给背景发送消息，并将响应返回给页面
        			var responseEvent = document.createEvent('Event');
        			responseEvent.initEvent('background-response', true, true);
        			messageDom.addEventListener("page-message", function () {
        			    var info = this.innerText;
        			    try {
        			        info = JSON.parse(info);
        			    } catch (e) {}
        			
        			    if (info) {
        			        var id = info.id;
        			        chrome.extension.sendRequest(info.message, function (response) {
        			            messageDom.innerText = JSON.stringify({
        			                id: id,
        			                response: response
        			            });
        			            messageDom.dispatchEvent(responseEvent);
        			        });
        			    }
        			});
        			
        			// 将页面响应返回给背景
        			var messageCallbacks = {};
        			messageDom.addEventListener("page-response", function () {
        			    var info = this.innerText;
        			    try {
        			        info = JSON.parse(info);
        			    } catch (e) {}
        			
        			    var callback;
        			    if (info && (callback = messageCallbacks[info.id])) {
        			        delete messageCallbacks[info.id];
        			        callback(info.response);
        			    }
        			});
        			// 监听背景页消息，发送给页面
        			var messageEvent = document.createEvent('Event');
        			messageEvent.initEvent('background-message', true, true);
        			chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        			    var id = +new Date();
        			    messageDom.innerText = JSON.stringify({
        			        id: id,
        			        message: request
        			    });
        			    messageCallbacks[id] = sendResponse;
        			    messageDom.dispatchEvent(messageEvent);
        			});
        			
        			injectBridge();
        			
        			// 给页面注入脚本方法
        			var scriptEvent = document.createEvent('Event');
        			scriptEvent.initEvent('script', true, true);
        			function injectScript(script) {
        			    if (typeof script === "function") {
        			        script = "~" + script.toString() + "()";
        			    }
        			    onReady(function () {
        			        messageDom.innerText = script;
        			        messageDom.dispatchEvent(scriptEvent);
        			    });
        			}
        		},
        		// bridge.js
        		function(__inner_require__, exports, module){
        			module.exports = function () {
        			    "use strict";
        			
        			    /**
        			     * 此脚本注入到页面中
        			     * 拥有页面的全部权限
        			     * @inject
        			     */
        			
        			    var messageDom = document.getElementById("__$_Kraken_message_dom_$__");
        			    // 注入脚本
        			    messageDom.addEventListener("script", function () {
        			        var commandContent = this.innerText;
        			        new Function(commandContent)();
        			    });
        			
        			    // 监听背景页消息，并给出响应
        			    var responseEvent = document.createEvent('Event');
        			    responseEvent.initEvent('page-response', true, true);
        			    var listeners = [];
        			    messageDom.addEventListener("background-message", function () {
        			        var info = this.innerText;
        			        try {
        			            info = JSON.parse(info);
        			        } catch (e) {}
        			
        			        if (info) {
        			            listeners.forEach(function (listener) {
        			                listener(info.message, function (response) {
        			                    messageDom.innerText = JSON.stringify({
        			                        id: info.id,
        			                        response: response
        			                    });
        			                    messageDom.dispatchEvent(responseEvent);
        			                });
        			            });
        			        }
        			    });
        			
        			    // 给背景页发送消息，并监听响应
        			    var messageCallbacks = {};
        			    messageDom.addEventListener("background-response", function () {
        			        var info = this.innerText;
        			        try {
        			            info = JSON.parse(info);
        			        } catch (e) {}
        			        var callback;
        			        if (info && (callback = messageCallbacks[info.id])) {
        			            delete requests[info.id];
        			            callback(info.response);
        			        }
        			    });
        			    var messageEvent = document.createEvent('Event');
        			    messageEvent.initEvent('page-message', true, true);
        			
        			    window.$Kraken = {
        			        onMessage: function onMessage(listener) {
        			            listeners.push(listener);
        			        },
        			        offMessage: function offMessage(listener) {
        			            var index = listeners.indexOf(listener);
        			            if (index !== -1) {
        			                listeners.splice(index, 1);
        			            }
        			        },
        			        sendMessage: function sendMessage(message, callback) {
        			            var id = +new Date();
        			            messageDom.innerText = JSON.stringify({
        			                id: id,
        			                message: message
        			            });
        			            if (callback) {
        			                messageCallbacks[id] = callback;
        			            }
        			            messageDom.dispatchEvent(messageEvent);
        			        }
        			    };
        			
        			    // 通知背景页bridge注入成功
        			    var readyEvent = document.createEvent('Event');
        			    readyEvent.initEvent('inject-ready', true, true);
        			    messageDom.dispatchEvent(readyEvent);
        			};
        		}
    ];
});