/**
 * 此脚本是chrome的content script
 * 运行在每个页面中，但是只能操作页面的dom，无法与页面中的js进行交互
 */

import bridge from "./bridge";

// 注入桥接脚本
function injectBridge(){
    location.href = 'javascript:void((' + bridge.toString().replace(/\/\/.*\n/g, "").replace(/\n/g, "") + ')())';
}

// 创建用于通信的dom节点
var messageDom = document.createElement("textarea");
messageDom.id = MESSAGE_DOM_ID;
messageDom.style.cssText = "display:none;";
document.body.appendChild(messageDom);

// bridge注入ready事件
var listeners = [];
var isReady = false;
function onReady(listener){
    if(isReady){
        listener();
    }else{
        listeners.push(listener);
    }
}

// 当桥接脚本准备好后，就可以开始向页面发送命令
messageDom.addEventListener("inject-ready", function(){
    isReady = true;
    listeners.forEach(function(listener){
        listener();
    });
    listeners = [];
});

// 给背景发送消息，并将响应返回给页面
var responseEvent = document.createEvent('Event');
responseEvent.initEvent('background-response', true, true);
messageDom.addEventListener("page-message", function(){
    var info = this.value;
    try{
        info = JSON.parse(info);
    }catch(e){}

    if(info){
        var id = info.id;
        chrome.extension.sendRequest(info.message, function(response) {
            messageDom.value = JSON.stringify({
                id: id,
                response: response
            });
            messageDom.dispatchEvent(responseEvent);
        });
    }
});

// 将页面响应返回给背景
var messageCallbacks = {};
messageDom.addEventListener("page-response", function(){
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
// 监听背景页消息，发送给页面
var messageEvent = document.createEvent('Event');
messageEvent.initEvent('background-message', true, true);
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var id = +new Date();
    messageDom.value = JSON.stringify({
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
function injectScript(script){
    if(typeof script === "function"){
        script = `~${script.toString()}()`;
    }
    onReady(function(){
        messageDom.value = script;
        messageDom.dispatchEvent(scriptEvent);
    });
}

export default function(scripts){
    scripts.forEach(function(script){
        if(typeof script === "function"){
            injectScript(script);
        }else if(
            typeof script === "object" &&
            typeof script.id === "string" &&
            typeof script.factory === "function"
        ){
            let code = `define("${script.id}", ${script.factory.toString()});`;
            if(script.isEntry){
                code += `\nrequire("${script.id}");`;
            }
            injectScript(code);
        }
    });
}