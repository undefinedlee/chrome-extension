export default function (name, callback) {
    var listeners = {};
    var requestListeners = {};

    var page = {
        onMessage: function(messageName, listener){
            if(!listeners[messageName]){
                listeners[messageName] = [];
            }
            listeners[messageName].push(listener);
        },
        sendMessage: function(messageName, data){
            $Kraken.sendMessage({
                type: messageName,
                value: data
            });
        },
        onRequest: function(requestName, listener){
            requestListeners[requestName] = listener;
        },
        request: function(requestName, params, callback){
            $Kraken.sendMessage({
                type: "$request",
                value: {
                    requestName,
                    params
                }
            }, callback);
        }
    };

    $Kraken.onMessage(function(info, callback){
        var messageName = info.type;
        switch(messageName){
            case "$request":
                let requestName = info.value.requestName;
                if(requestListeners[requestName]){
                    let result = requestListeners[requestName](info.value.params);
                    if(result instanceof Promise){
                        result.then(callback);
                    }else{
                        callback(result);
                    }
                }
                return;
        }

        if(listeners[messageName]){
            listeners[messageName].forEach(listener => listener(info.value));
        }
    });

    $Kraken.sendMessage({
        type: "$open",
        value: {
            name: name,
            info: {
                url: location.href
            }
        }
    }, function(){
        callback(page);
    });
    // 页面离开
    window.addEventListener("beforeunload", function(){
        $Kraken.sendMessage({
            type: "$close",
            value: name
        });
    });
}