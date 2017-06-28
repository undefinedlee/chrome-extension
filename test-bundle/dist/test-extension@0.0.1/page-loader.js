define("test-extension@0.0.1/page-loader.js", function(require){
    return [
        		// page-loader.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			module.exports = function () {
        			    console.log("page loader");
        			};
        		}
    ];
});