import { Background } from "chrome-extension-kraken";

// 监听页面的新消息
Background.onMessage("new-message", function(pageName, message){
    console.log(`来自${pageName}的消息：${message}`);
});
// 监听页面打开
Background.onMessage("$open", function(pageName, pageInfo){
    console.log(`hello ${pageName}`);
    console.log(pageInfo);
    // 给页面发送消息
    Background.sendMessage(
        // 要发送给的页面
        pageName,
        // 消息名称
        "send-message",
        // 消息内容
        `hello ${pageName}`
    );
});
// 监听页面关闭
Background.onMessage("$close", function(pageName){
    console.log("bye " + pageName);
});