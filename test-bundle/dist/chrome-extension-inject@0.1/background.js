define("chrome-extension-inject@0.1/background.js", function(require){
    return [
        		// background.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			Object.defineProperty(exports, "__esModule", {
        			    value: true
        			});
        			/**
        			 * 此脚本运行在chrome后台
        			 */
        			
        			var listeners = [];
        			// 监听页面消息
        			chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        			    listeners.forEach(function (listener) {
        			        listener(sender.tab.id, request);
        			    });
        			});
        			
        			exports.default = {
        			    onMessage: function onMessage(listener) {
        			        listeners.push(listener);
        			    },
        			    offMessage: function offMessage(listener) {
        			        var index = listeners.indexOf(listener);
        			        if (index !== -1) {
        			            listeners.splice(index, 1);
        			        }
        			    },
        			    // 给页面发送消息
        			    sendMessage: function sendMessage(pageId, message, callback) {
        			        chrome.tabs.sendRequest(pageId, message, callback);
        			    }
        			};
        		}
    ];
});