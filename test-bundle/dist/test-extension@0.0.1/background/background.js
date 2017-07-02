define("test-extension@0.0.1/background/background.js", function(require){
    return [
        		// background/background.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _background = require("chrome-extension-inject@0.1/background.js");
        			
        			var _background2 = babelHelpers.interopRequireDefault(_background);
        			
        			_background2.default.onMessage(function (pageId, info) {
        			    console.log(info);
        			    _background2.default.sendMessage(pageId, {
        			        name: "background"
        			    });
        			});
        		}
    ];
});
require("test-extension@0.0.1/background/background.js");