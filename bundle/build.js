var path = require("path");
var filesToEs5 = require("files-to-es5");

if(__dirname.split(path.sep).splice(-2, 1)[0] === "node_modules"){
	filesToEs5({
		src: __dirname,
		output: __dirname,
		ignore: [
            "node_modules/**/*",
            "build.js",
            "**/tpls/**/*"
        ]
	});
}