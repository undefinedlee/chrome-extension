var path = require("path");
var bundle = require("chrome-extension-bundle").default;

bundle(
    path.join(__dirname, "src"),
    path.join(__dirname, "dist")
);