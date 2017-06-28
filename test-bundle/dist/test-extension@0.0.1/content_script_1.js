define("test-extension@0.0.1/content_script_1.js", function(require){
    return [
        		// content_script_1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _pageBackground = require("chrome-extension-inject@0.1/page-background.js");
        			
        			var _pageBackground2 = babelHelpers.interopRequireDefault(_pageBackground);
        			
        			var _pageLoader = require("test-extension@0.0.1/page-loader.js");
        			
        			var _pageLoader2 = babelHelpers.interopRequireDefault(_pageLoader);
        			
        			var _file = __inner_require__(1 /*pages/wangwang/file1.js*/);
        			
        			var _file2 = babelHelpers.interopRequireDefault(_file);
        			
        			(0, _pageBackground2.default)([_pageLoader2.default, _file2.default]);
        		},
        		// pages/wangwang/file1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			module.exports = function () {
        			    console.log("wangwang file1");
        			};
        		}
    ];
});
require("test-extension@0.0.1/content_script_1.js");