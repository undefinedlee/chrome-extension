/**
 * 此脚本运行在chrome后台
 */

var listeners = [];
// 监听页面消息
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    listeners.forEach(function(listener){
        listener(sender.tab.id, request, sendResponse);
    });
});

export default {
    onMessage: function(listener){
        listeners.push(listener);
    },
    offMessage: function(listener){
        var index = listeners.indexOf(listener);
        if(index !== -1){
            listeners.splice(index, 1);
        }
    },
    // 给页面发送消息
    sendMessage: function(pageId, message, callback){
        chrome.tabs.sendRequest(pageId, message, callback);
    }
};