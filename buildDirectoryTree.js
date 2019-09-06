const buildDirectoryTree = require("./lib/buildDirectoryTree");
const jsonfile = require("jsonfile");
const path = require("path");

let arhiveDirectoryObj = {
  directoryRoot: path.resolve(__dirname + "/root/files"),
  writeTarget: path.resolve(__dirname + "/root"),
  filename: "directoryTree.json"
};

buildDirectoryTree(arhiveDirectoryObj).then(response => {
  jsonfile.writeFile(
    `${arhiveDirectoryObj.writeTarget}/${arhiveDirectoryObj.filename}`,
    response,
    function(err) {
      if (err) console.error(err);
    }
  );
  console.log(
    `Created: ${arhiveDirectoryObj.writeTarget}/${arhiveDirectoryObj.filename}`
  );
});
