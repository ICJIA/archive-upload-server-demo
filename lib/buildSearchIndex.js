"use strict";
const fs = require("fs");
const path = require("path");
const jsonfile = require("jsonfile");

function getStats(file) {
  const { size, atime, mtime, ctime, birthtime } = fs.statSync(file);
  let obj = {};
  obj.size = size;
  obj.atime = atime;
  obj.mtime = mtime;
  obj.ctime = ctime;
  obj.birthtime = birthtime;
  return obj;
}

function walkDir(directoryRoot, exclusions, archiveBase) {
  const result = [];
  const files = [directoryRoot];
  do {
    const filepath = files.pop();
    const stat = fs.lstatSync(filepath);
    if (stat.isDirectory()) {
      fs.readdirSync(filepath).forEach(f => {
        files.push(path.join(filepath, f));
      });
    } else if (
      stat.isFile() &&
      !exclusions.includes(path.relative(directoryRoot, filepath))
    ) {
      let obj = {};
      obj.path = "/" + path.relative(directoryRoot, filepath);

      let parts = path.relative(directoryRoot, filepath).split("/");
      obj.agency = parts[0];
      obj.download = `${archiveBase}${obj.path}`;
      obj.name = path.basename(directoryRoot + "/" + obj.path);
      obj.parent = obj.download.replace(obj.name, "");
      obj.stats = getStats(directoryRoot + "/" + obj.path);

      result.push(obj);
    }
  } while (files.length !== 0);

  return result;
}

function buildSearchIndex({
  directoryRoot,
  writeTarget,
  filename,
  archiveBase,
  exclusions
}) {
  let searchIndex = walkDir(directoryRoot, exclusions, archiveBase);

  jsonfile.writeFile(`${writeTarget}/${filename}`, searchIndex, function(err) {
    if (err) console.error(err);
    console.log(`Created: ${writeTarget}/${filename}`);
  });
}

module.exports = buildSearchIndex;
