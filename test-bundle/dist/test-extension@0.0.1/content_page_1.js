define("test-extension@0.0.1/content_page_1.js", function(require){
    return [
        		// content_page_1.js
        		function(__inner_require__, exports, module){
        			"use strict";
        			
        			var _pageBackground = require("chrome-extension-inject@0.1/page-background.js");
        			
        			var _pageBackground2 = babelHelpers.interopRequireDefault(_pageBackground);
        			
        			var _pageLoader = require("test-extension@0.0.1/page-loader.js");
        			
        			var _pageLoader2 = babelHelpers.interopRequireDefault(_pageLoader);
        			
        			var _pageBabelHelpers = require("test-extension@0.0.1/page-babel-helpers.js");
        			
        			var _pageBabelHelpers2 = babelHelpers.interopRequireDefault(_pageBabelHelpers);
        			
        			var pages = [];
        			pages.push(injectRequire("test-extension@0.0.1/content_script_1.js", true));
        			(0, _pageBackground2.default)([_pageLoader2.default, _pageBabelHelpers2.default].concat(pages));
        		}
    ];
});
require("test-extension@0.0.1/content_page_1.js");