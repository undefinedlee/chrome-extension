define("test-extension@0.0.1/page-loader.js", function(require){
    return [
        		// page-loader.js
        		function(__inner_require__, exports, module){
        			module.exports = function () {
        			    // @inject
        			    // @native
        			    (function () {
        			        var mods = {};
        			        var nativeMods = {};
        			
        			        function require(id) {
        			            var factory = mods[id];
        			
        			            if (!factory.isInitialized) {
        			                // 防止循环依赖，所以放到前面
        			                factory.isInitialized = true;
        			                factory.exports = {};
        			                factory.exports = factory();
        			            }
        			
        			            return factory.exports;
        			        }
        			
        			        function injectRequire(id, isEntry) {
        			            return {
        			                id: id,
        			                factory: nativeMods[id],
        			                isEntry: isEntry
        			            };
        			        }
        			
        			        // 解析一个模块的内部模块列表
        			        function parseFactory(mods, modName) {
        			            return function __inner_require__(id) {
        			                var factory = mods[id];
        			
        			                if (!factory) {
        			                    console.warn("无法找到模块'" + modName + "'的第" + id + "个内部模块");
        			                    return null;
        			                }
        			
        			                var module;
        			
        			                if (!factory.isInitialized) {
        			                    mods[id] = module = {
        			                        exports: {},
        			                        isInitialized: true
        			                    };
        			
        			                    try {
        			                        factory(__inner_require__, module.exports, module);
        			                    } catch (e) {
        			                        console.error("模块'" + modName + "'的第" + id + "个内部模块错误:\n" + (e && (e.stack || e)));
        			                    }
        			                }
        			
        			                return (module || factory).exports;
        			            }(0);
        			        }
        			
        			        // 定义一个模块
        			        function define(id, factory) {
        			            nativeMods[id] = factory;
        			            // 
        			            mods[id] = function () {
        			                var innerMods = factory(require);
        			                if (innerMods instanceof Array) {
        			                    return parseFactory(innerMods, id);
        			                } else {
        			                    return innerMods;
        			                }
        			            };
        			        };
        			
        			        window.require = require;
        			        window.define = define;
        			        window.injectRequire = injectRequire;
        			    })();
        			};
        		}
    ];
});