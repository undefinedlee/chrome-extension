import fs from "fs";
import path from "path";
import utils from "node-pearls";
import rimraf from "rimraf";
import bundle from "enjoy-bundle";
import * as babel from "babel-core";
import {
    overWriteTlp as tpl,
    overWriteJoin as join
} from "enjoy-source-map";
import glob from "glob";
// 模板
const tpls = (function(files){
    var tpls = {};
    files.forEach(function(file){
        tpls[file] = fs.readFileSync(path.join(__dirname, "tpls", file + ".js"), "utf8");
    });
    return tpls;
})([
    //
    "content-script",
    // content script入口文件，用来将当前页面需要的js注入到页面中
    "page",
    // bundle时，独立模块的包装结构
    "mod",
    // 注入到页面中的脚本需要包装在函数内
    "page-package",
    // content script运行时loader
    "loader",
    //
    "babel-helpers"
]);
// 获取content script的文件名
function getContentScriptName(index){
    return `content_script_${index}.js`;
}
function getContentPageName(index){
    return `content_page_${index}.js`;
}
// 全局宏
const CONSTS = {
    "MESSAGE_DOM_ID": "__$_Kraken_message_dom_$__"
};
// 判断是否是不需要babel转换的文件
function isNative(ast){
    return ast.comments.some(comment => /@native\b/.test(comment.value));
}
// 判断是否是需要注入到页面中的文件
function isInject(ast){
    return ast.comments.some(comment => /@inject\b/.test(comment.value));
}

export default async function(src, dist){
    // 临时中转文件夹
    const tempDir = path.join(path.dirname(src), ".chrome-extension-bundle");
    // 清空临时中转文件夹
    rimraf.sync(tempDir);
    utils.mkdirs.sync(tempDir);
    // 清空dist目录
    rimraf.sync(dist);
    // 将src中的文件拷贝到临时中转文件夹
    const files = glob.sync("**/*", {
        cwd: src,
        nodir: true
    });
    await utils.copyFiles(files.map(function(file){
        return {
            src: path.join(src, file),
            dist: path.join(tempDir, file)
        };
    }));
    // 将package.json、注入到页面的loader和babel-helpers拷贝到临时文件夹
    const packageJson = utils.readJson.sync(path.join(path.dirname(src), "package.json"));
    fs.writeFileSync(
        path.join(tempDir, `package.json`),
        JSON.stringify(packageJson, null, " ")
    );

    fs.writeFileSync(
        path.join(tempDir, "page-loader.js"),
        "// @inject\n" + tpls["loader"]
    );

    fs.writeFileSync(
        path.join(tempDir, "page-babel-helpers.js"),
        "// @inject\n" + tpls["babel-helpers"]
    );
    // 插件配置文件
    var manifest = utils.readJson.sync(path.join(tempDir, "manifest.json"));
    var entries = [];
    // 分析content scripts
    manifest["content_scripts"].forEach(function(contentScript, index){
        var data = {
            "import_pages": [],
            "pages": []
        };

        contentScript.js.forEach(function(js){
            var name = js.split("/").pop().split(".")[0].replace(/\-[a-z]/g, function(all){
                return all.replace("-", "").toUpperCase();
            });
            data["import_pages"].push(`import ${name} from "./${js}";`);
            // data["require_pages"].push(`var ${name} = injectRequire("./${js}");`);
            data["pages"].push(name);
        });

        data["import_pages"] = data["import_pages"].join("\n");
        data["pages"] = data["pages"].join(",");

        var contentScriptCode = tpls["content-script"].replace(/\{([a-zA-Z_\-]+)\}/g, function(all, key){
            return data[key];
        });
        var contentscriptName = getContentScriptName(index);
        // 生成content scripts入口文件
        fs.writeFileSync(
            path.join(tempDir, contentscriptName),
            contentScriptCode
        );
        entries.push(contentscriptName);

        var contentPageName = getContentPageName(index);
        fs.writeFileSync(
            path.join(tempDir, contentPageName),
            tpls["page"]
        );
        entries.push(contentPageName);
    });

    manifest.background.scripts.forEach(function(file, index){
        entries.push(file);
    });

    var depsHash = {};

    bundle(tempDir, null, null, {
        config: {
            entries: entries,
            output: dist,
            useVersion: false,
            loaders: [{
                test: /\.js$/,
                loader: [function(code){
                    var result = babel.transform(code, {
                        compact: false,
                        sourceFileName: this.file,
                        plugins: [
                            "syntax-async-functions",
                            "syntax-class-properties",
                            "syntax-decorators",
                            "syntax-object-rest-spread",
                            // 替换全局宏
                            function({types: t}){
                                return {
                                    visitor: {
                                        Identifier: {
                                            enter(path){
                                                var value = CONSTS[path.node.name];
                                                switch(typeof value){
                                                    case "string":
                                                        path.replaceWith(
                                                            t.StringLiteral(value)
                                                        );
                                                        break;
                                                }
                                            }
                                        }
                                    }
                                };
                            }
                        ]
                    });

                    if(!isNative(result.ast)){
                        result = babel.transformFromAst(result.ast, result.code, {
                            presets: [
                                "latest",
                                "react",
                                "stage-0"
                            ],
                            plugins: [
                                "transform-decorators-legacy",
                                "external-helpers"
                            ]
                        });
                    }

                    if(isInject(result.ast)){
                        return tpl(tpls["page-package"], {
                            content: result.code
                        });
                    }

                    return result.code;
                }]
            }],
            plugins: [function() {
                this.plugin("before-render-code", function(info) {
                    return tpl(tpls["mod"], {
                        id: [info.packageName, info.file].join("/"),
                        // deps: info.deps.map(item => '"' + item + '"').join(", "),
                        mods: join(info.codes)
                    });
                });
                this.plugin("bundle-complete", function(info){
                    for(let file in info.depsHash){
                        depsHash[path.join(info.packageName, file)] = info.depsHash[file];
                    }
                });
            }]
        }
    }, function(){
        rimraf.sync(tempDir);
        rimraf.sync(path.join(dist, ".package-list.json"));

        fs.writeFileSync(
            path.join(dist, "loader.js"),
            tpls["loader"]
        );
        fs.writeFileSync(
            path.join(dist, "babel-helpers.js"),
            tpls["babel-helpers"]
        );

        var packageName = [packageJson.name, packageJson.version].join("@");

        manifest["content_scripts"].forEach(function(contentScript, index){
            var files = [];

            var contentPageName = path.join(packageName, getContentPageName(index));
            (function _(file){
                if(files.indexOf(file) === -1){
                    files.push(file);
                    if(depsHash[file]){
                        depsHash[file].forEach(_);
                    }
                }
            })(contentPageName);

            var injectScripts = [];
            var contentScriptName = path.join(packageName, getContentScriptName(index));
            (function _(file){
                if(files.indexOf(file) === -1){
                    files.push(file);
                    injectScripts.push({
                        file: file,
                        isEntry: file === contentScriptName
                    });
                    if(depsHash[file]){
                        depsHash[file].forEach(_);
                    }
                }
            })(contentScriptName);
            
            var contentPageFile = path.join(dist, contentPageName);
            var contentPageCode = fs.readFileSync(contentPageFile, "utf8");
            contentPageCode = contentPageCode.replace(/\/\/\s*#content\-scripts#\s*\n/, injectScripts.map(function(file){
                return `pages.push(injectRequire("${file.file}", ${file.isEntry}));\n`;
            }).join("")) + `\nrequire("${contentPageName}");`;
            fs.writeFileSync(contentPageFile, contentPageCode);

            contentScript.js = ["loader.js", "babel-helpers.js"].concat(files.reverse());
        });

        var backgroundScripts = [];
        manifest.background.scripts.forEach(function(script){
            script = [packageName, script].join("/");

            (function _(file){
                if(files.indexOf(file) === -1){
                    backgroundScripts.push(file);
                    if(depsHash[file]){
                        depsHash[file].forEach(_);
                    }
                }
            })(script);

            var code = fs.appendFileSync(path.join(dist, script), `\nrequire("${script}");`);
            return script;
        });
        manifest.background.scripts = ["loader.js", "babel-helpers.js"].concat(backgroundScripts.reverse());

        fs.writeFileSync(path.join(dist, "manifest.json"), JSON.stringify(manifest, null, " "));
    });
}