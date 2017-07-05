import { Background } from "chrome-extension-kraken";

// 监听页面的新消息
Background.onMessage("new-message", function(pageName, message){
    console.log(message);
});
// 响应页面获取时间的请求
Background.onRequest("time", function(pageName, params){
    return +new Date();
});
// 监听页面注册
Background.onMessage("$register", function(pageName){
    // 给页面发送消息
    Background.sendMessage(pageName, "send-message", "hello " + pageName);
    // 请求页面获取message
    Background.request(pageName, "message", {
        myName: "background"
    }, function(response){
        console.log(response);
    });
});