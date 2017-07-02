console.log("file1");
$Kraken.onMessage(function (info) {
    console.log(info);
});
$Kraken.sendMessage({
    name: "page"
});