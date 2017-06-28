import fs from "fs";
import path from "path";
import utils from "node-pearls";
import rimraf from "rimraf";
import bundle from "enjoy-bundle";
import * as babel from "babel-core";
import { overWriteTlp as tpl, overWriteJoin as join } from "enjoy-source-map";

const tpls = {
    "page": fs.readFileSync(path.join(__dirname, "tpls", "page.js"), "utf8"),
    "mod": fs.readFileSync(path.join(__dirname, "tpls", "mod.js"), "utf8"),
    "page-package": fs.readFileSync(path.join(__dirname, "tpls", "page-package.js"), "utf8"),
    "loader": fs.readFileSync(path.join(__dirname, "tpls", "loader.js"), "utf8"),
    "page-loader": fs.readFileSync(path.join(__dirname, "tpls", "page-loader.js"), "utf8")
};

function getContentScriptName(index){
    return `content_script_${index}.js`;
}

export default async function(src, dist){
    var manifest = utils.readJson.sync(path.join(src, "manifest.json"));
    const tempDir = path.join(path.dirname(src), ".chrome-extension-bundle");
    const packageJson = utils.readJson.sync(path.join(path.dirname(src), "package.json"));

    rimraf.sync(tempDir);
    utils.mkdirs.sync(tempDir);
    fs.writeFileSync(
        path.join(tempDir, `package.json`),
        JSON.stringify(packageJson, null, " ")
    );

    fs.writeFileSync(
        path.join(tempDir, "page-loader.js"),
        tpl(tpls["page-package"], {
            content: tpls["page-loader"]
        })
    );

    var entries = [];
    manifest["content_scripts"].forEach(async function(contentScript, index){
        var data = {
            "import_pages": [],
            "pages": []
        };

        contentScript.js.forEach(function(js){
            var name = js.split("/").pop().split(".")[0].replace(/\-[a-z]/g, function(all){
                return all.replace("-", "").toUpperCase();
            });
            data["import_pages"].push(`import ${name} from "./${js}";`);
            data["pages"].push(name);
        });

        data["import_pages"] = data["import_pages"].join("\n");
        data["pages"] = data["pages"].join(",");

        var contentScriptCode = tpls.page.replace(/\{([a-zA-Z_\-]+)\}/g, function(all, key){
            return data[key];
        });

        contentScript.js.forEach(function(file){
            var code = fs.readFileSync(path.join(src, file), "utf8");
            var distFile = path.join(tempDir, file);
            utils.mkdirs.sync(path.dirname(distFile));
            fs.writeFileSync(distFile, tpl(tpls["page-package"], {
                content: code
            }));
        });

        fs.writeFileSync(path.join(tempDir, entries[index] = getContentScriptName(index)), contentScriptCode);
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
                    return babel.transform(code, {
                        compact: false,
                        sourceFileName: this.file,
                        presets: [
                            "latest",
                            "react",
                            "stage-0"
                        ],
                        plugins: [
                            "transform-decorators-legacy",
                            "external-helpers"
                        ]
                    }).code;
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

        var packageName = [packageJson.name, packageJson.version].join("@");

        manifest["content_scripts"].forEach(function(contentScript, index){
            var files = [];
            var contentScriptName = path.join(packageName, getContentScriptName(index));
            (function _(file){
                if(files.indexOf(file) === -1){
                    files.push(file);
                    if(depsHash[file]){
                        depsHash[file].forEach(_);
                    }
                }
            })(contentScriptName);

            fs.appendFileSync(path.join(dist, contentScriptName), `\nrequire("${contentScriptName}");`);

            contentScript.js = ["loader.js"].concat(files.reverse());
        });

        fs.writeFileSync(path.join(dist, "manifest.json"), JSON.stringify(manifest, null, " "));
    });
}