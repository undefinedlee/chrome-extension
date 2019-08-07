/**
 * 此脚本注入到页面中
 * 拥有页面的全部权限
 * @inject
 */

var messageDom = document.getElementById(MESSAGE_DOM_ID);
// 注入脚本
messageDom.addEventListener("script", function(){
    var commandContent = this.value;
    (new Function(commandContent))();
});

// 监听背景页消息，并给出响应
var responseEvent = document.createEvent('Event');
responseEvent.initEvent('page-response', true, true);
var listeners = [];
messageDom.addEventListener("background-message", function(){
    var info = this.value;
    try{
        info = JSON.parse(info);
    }catch(e){}

    if(info){
        listeners.forEach(function(listener){
            listener(info.message, function(response){
                messageDom.value = JSON.stringify({
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
messageDom.addEventListener("background-response", function(){
    var info = this.value;
    try{
        info = JSON.parse(info);
    }catch(e){}
    var callback;
    if(info && (callback = messageCallbacks[info.id])){
        delete messageCallbacks[info.id];
        callback(info.response);
    }
});
var messageEvent = document.createEvent('Event');
messageEvent.initEvent('page-message', true, true);

window.$Kraken = {
    onMessage: function(listener){
        listeners.push(listener);
    },
    offMessage: function(listener){
        var index = listeners.indexOf(listener);
        if(index !== -1){
            listeners.splice(index, 1);
        }
    },
    sendMessage: function(message, callback){
        var id = +new Date();
        messageDom.value = JSON.stringify({
            id: id,
            message: message
        });
        if(callback){
            messageCallbacks[id] = callback;
        }
        messageDom.dispatchEvent(messageEvent);
    }
};

// 通知背景页bridge注入成功
var readyEvent = document.createEvent('Event');
readyEvent.initEvent('inject-ready', true, true);
messageDom.dispatchEvent(readyEvent);