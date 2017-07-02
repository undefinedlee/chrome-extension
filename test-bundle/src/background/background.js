import Background from "chrome-extension-inject/background";

Background.onMessage(function (pageId, info) {
    console.log(info);
    Background.sendMessage(pageId, {
        name: "background"
    });
});