import fs from "fs";
import path from "path";
import utils from "node-pearls";

const tpls = {
    "page": fs.readFileSync(path.join(__dirname, "tpls", "page.js"), "utf8")
};

export default function(src, dist){
    const manifest = utils.readJson.sync(path.join(src, "manifest.json"));

    manifest["content_scripts"].forEach(function(contentScript){
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

        tpls.page.replace(/\{([a-zA-Z_\-]+)\}/g, function(all, key){
            return data[key];
        });
    });
}