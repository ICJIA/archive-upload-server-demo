"use strict";
const dirTree = require("./helpers/directoryTree");
const jsonfile = require("jsonfile");

function buildDirectoryTree({ directoryRoot, writeTarget, filename }) {
  const tree = dirTree(directoryRoot);

  jsonfile.writeFile(`${writeTarget}/${filename}`, tree, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${writeTarget}/${filename}`);
  });
}

module.exports = buildDirectoryTree;
