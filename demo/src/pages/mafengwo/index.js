import { Page } from "chrome-extension-kraken";

Page("mafengwo", function(page){
    // 监听背景页send-message事件
    page.onMessage("send-message", function (message) {
        console.log(message);
    });
    // 发送新消息给背景页
    page.sendMessage("new-message", "hello background");

    // 响应背景页message的请求
    page.onRequest("message", function(params){
        return "no message";
    });

    // 请求背景页获取时间
    page.request("time", {
        myName: "page mafengwo"
    }, function(response){
        console.log(response);
    });
});