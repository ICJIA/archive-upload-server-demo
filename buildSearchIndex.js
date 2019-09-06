const buildSearchIndex = require("./lib/buildSearchIndex");
const jsonfile = require("jsonfile");

let arhiveSearchObj = {
  directoryRoot: "./root/files",
  writeTarget: "./root",
  filename: "searchIndex.json",
  archiveBase: "https://archive.icjia.cloud/files",
  exclusions: ["directoryTree.json", "searchIndex.json", "sitemap.xml"]
};

buildSearchIndex(arhiveSearchObj).then(response => {
  jsonfile.writeFile(
    `${arhiveSearchObj.writeTarget}/${arhiveSearchObj.filename}`,
    response,
    function(err) {
      if (err) console.error(err);
    }
  );
  console.log(
    `Created: ${arhiveSearchObj.writeTarget}/${arhiveSearchObj.filename}`
  );
});
