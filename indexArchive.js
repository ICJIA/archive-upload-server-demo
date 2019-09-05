const buildDirectoryTree = require("./lib/buildDirectoryTree");
const buildSearchIndex = require("./lib/buildSearchIndex");

let arhiveDirectoryObj = {
  directoryRoot: "./root/files",
  writeTarget: "./root",
  filename: "directoryTree.json"
};

buildDirectoryTree(arhiveDirectoryObj);

let arhiveSearchObj = {
  directoryRoot: "./root/files",
  writeTarget: "./root",
  filename: "searchIndex.json",
  archiveBase: "https://archive.icjia.cloud/files",
  exclusions: ["directoryTree.json", "searchIndex.json"]
};

buildSearchIndex(arhiveSearchObj);
