"use strict";
const dirTree = require("./helpers/directoryTree");
const jsonfile = require("jsonfile");

function buildDirectoryTree({ directoryRoot, writeTarget, filename }) {
  return new Promise(function(resolve, reject) {
    const tree = dirTree(directoryRoot);
    resolve(tree);
  });
}

module.exports = buildDirectoryTree;
