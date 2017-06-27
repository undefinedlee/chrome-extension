import fs from "fs";
import path from "path";
import utils from "node-pearls";
import rimraf from "rimraf";
import bundle from "enjoy-bundle";
import * as babel from "babel-core";

const tpls = {
    "page": fs.readFileSync(path.join(__dirname, "tpls", "page.js"), "utf8")
};

export default async function(src, dist){
    const manifest = utils.readJson.sync(path.join(src, "manifest.json"));
    const tempDir = path.join(path.dirname(src), ".chrome-extension-bundle");

    rimraf.sync(tempDir);
    utils.mkdirs.sync(tempDir);
    fs.writeFileSync(
        path.join(tempDir, `package.json`),
        fs.readFileSync(path.join(path.dirname(src), "package.json"))
    );

    var entries = [];
    await Promise.all(manifest["content_scripts"].map(async function(contentScript, index){
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

        await utils.copyFiles(contentScript.js.map(function(js){
            return {
                src: path.join(src, js),
                dist: path.join(tempDir, js)
            };
        }));

        entries[index] = `content_script${index}.js`;

        fs.writeFileSync(path.join(tempDir, `content_script${index}.js`), contentScriptCode);
    }));

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
            plugins: []
        }
    });
}