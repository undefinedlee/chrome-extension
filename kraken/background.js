import Background from "chrome-extension-inject/background";

var openPages = {};
var listeners = {};
var requestListeners = {};
function getPageName(pageId){
    return Object.keys(openPages).find(pageName => openPages[pageName] === pageId);
}
Background.onMessage(function (pageId, info, callback) {
    switch(info.type){
        case "$open":
            openPages[info.value.name] = pageId;
            callback();
            if(listeners["$open"]){
                listeners["$open"].forEach(listener => listener(info.value.name, info.value.info));
            }
            return;
        case "$close":
            delete openPages[info.value];
            if(listeners["$close"]){
                listeners["$close"].forEach(listener => listener(info.value));
            }
            return;
        case "$request":
            let requestName = info.value.requestName;
            if(requestListeners[requestName]){
                let pageName = getPageName(pageId);
                if(pageName){
                    let result = requestListeners[requestName](pageName, info.value.params);
                    if(result instanceof Promise){
                        result.then(callback);
                    }else{
                        callback(result);
                    }
                }else{
                    console.error("接收到未注册页面的请求");
                }
            }
            return;
    }

    let pageName = getPageName(pageId);
    if(pageName){
        let messageName = info.type;
        if(listeners[messageName]){
            listeners[messageName].forEach(listener => listener(pageName, info.value));
        }
    }else{
        console.error("接收到未注册页面的消息");
    }
});

export default {
    onMessage: function(messageName, listener){
        if(!listeners[messageName]){
            listeners[messageName] = [];
        }
        listeners[messageName].push(listener);
    },
    sendMessage: function(pageName, messageName, data){
        var pageId = openPages[pageName];
        if(typeof pageId !== "undefined"){
            Background.sendMessage(pageId, {
                type: messageName,
                value: data
            });
        }else{
            console.error(`页面${pageName}没有注册`);
        }
    },
    onRequest: function(requestName, listener){
        requestListeners[requestName] = listener;
    },
    request: function(pageName, requestName, params, callback){
        var pageId = openPages[pageName];
        if(typeof pageId !== "undefined"){
            Background.sendMessage(pageId, {
                type: "$request",
                value: {
                    requestName,
                    params
                }
            }, callback);
        }else{
            console.error(`页面${pageName}没有注册`);
        }
    }
};