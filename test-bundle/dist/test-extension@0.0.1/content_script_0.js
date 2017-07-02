define("test-extension@0.0.1/content_script_0.js", function(require){
    return [
        		// content_script_0.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _file = __inner_require__(1 /*pages/mafengwo/file1.js*/);
        			
        			var _file2 = babelHelpers.interopRequireDefault(_file);
        			
        			var _file3 = __inner_require__(2 /*pages/mafengwo/file2.js*/);
        			
        			var _file4 = babelHelpers.interopRequireDefault(_file3);
        			
        			module.exports = [_file2.default, _file4.default];
        		},
        		// pages/mafengwo/file1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			console.log("file1");
        			$Kraken.onMessage(function (info) {
        			    console.log(info);
        			});
        			$Kraken.sendMessage({
        			    name: "page"
        			});
        		},
        		// pages/mafengwo/file2.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			console.log("file2");
        		}
    ];
});