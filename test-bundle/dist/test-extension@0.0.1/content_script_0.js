define("test-extension@0.0.1/content_script_0.js", function(require){
    return [
        		// content_script_0.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _pageBackground = require("chrome-extension-inject@0.1/page-background.js");
        			
        			var _pageBackground2 = babelHelpers.interopRequireDefault(_pageBackground);
        			
        			var _pageLoader = require("test-extension@0.0.1/page-loader.js");
        			
        			var _pageLoader2 = babelHelpers.interopRequireDefault(_pageLoader);
        			
        			var _file = __inner_require__(1 /*pages/mafengwo/file1.js*/);
        			
        			var _file2 = babelHelpers.interopRequireDefault(_file);
        			
        			var _file3 = __inner_require__(2 /*pages/mafengwo/file2.js*/);
        			
        			var _file4 = babelHelpers.interopRequireDefault(_file3);
        			
        			(0, _pageBackground2.default)([_pageLoader2.default, _file2.default, _file4.default]);
        		},
        		// pages/mafengwo/file1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			module.exports = function () {
        			    console.log("file1");
        			};
        		},
        		// pages/mafengwo/file2.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			module.exports = function () {
        			    console.log("file2");
        			};
        		}
    ];
});
require("test-extension@0.0.1/content_script_0.js");