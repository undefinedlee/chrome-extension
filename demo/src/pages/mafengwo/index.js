import { Page } from "chrome-extension-kraken";

Page("mafengwo", function(page){
    // 发送新消息给背景页
    page.sendMessage(
        // 消息名称
        "new-message",
        // 消息内容
        "hello background"
    );

    page.onMessage("send-message", function (message) {
        console.log(`来自背景页的消息：${message}`);
        // 
        document.getElementsByClassName("_j_content")[0].value = message;
        document.getElementsByClassName("_j_send_msg")[0].click();
    });
});