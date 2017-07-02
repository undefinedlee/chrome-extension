define("test-extension@0.0.1/content_script_1.js", function(require){
    return [
        		// content_script_1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _file = __inner_require__(1 /*pages/wangwang/file1.js*/);
        			
        			var _file2 = babelHelpers.interopRequireDefault(_file);
        			
        			module.exports = [_file2.default];
        		},
        		// pages/wangwang/file1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			console.log("wangwang file1");
        		}
    ];
});