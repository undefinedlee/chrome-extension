import PageBackground from "chrome-extension-inject/page-background";
import Loader from "./page-loader";
import pageBabelHelpers from "./page-babel-helpers";
var pages = [];
// #content-scripts#
PageBackground([Loader, pageBabelHelpers].concat(pages));