require("dotenv").config();
const port = process.env.PORT || 3000;
const serverToken = process.env.VUE_APP_ARCHIVE_SECRET;
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const path = require("path");
const cors = require("cors");
const fs = require("fs-extra");
const TEMP_DIRECTORY = "./.tmp/";
const buildDirectoryTree = require("./lib/buildDirectoryTree");
const buildSearchIndex = require("./lib/buildSearchIndex");

if (!fs.existsSync(TEMP_DIRECTORY)) {
  console.log("create temp directory");
  fs.mkdirSync(TEMP_DIRECTORY, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb, dest) => {
    cb(null, TEMP_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const newFilename = `${file.originalname}`;

    cb(null, newFilename);
  }
});

const upload = multer({ storage });

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Howdy!"));

app.post("/", upload.array("files"), (req, res) => {
  let clientToken = req.body.uploadToken;
  if (clientToken !== serverToken) {
    res.status(403).send({ errorCode: "403", message: "Forbidden" });
  } else {
    let dir = req.body.path;
    if (!fs.existsSync(dir)) {
      console.log("create upload path");
      fs.mkdirSync(dir, { recursive: true });
    }

    let successfulUploads = [];
    let failedUploads = [];

    req.files.forEach(file => {
      if (!fs.existsSync(dir + file.originalname)) {
        successfulUploads.push(file.originalname);
        fs.move(
          TEMP_DIRECTORY + file.originalname,
          dir + file.originalname,
          function(err) {
            if (err) {
              return console.error(err);
            }
          }
        );
      } else {
        failedUploads.push(file.originalname);
        fs.emptyDirSync(TEMP_DIRECTORY)
        console.log("File exists: ", dir + file.originalname);
      }
    });

    // Rebuild directory tree
    const arhiveDirectoryObj = {
      directoryRoot: "./root/files",
      writeTarget: "./root",
      filename: "directoryTree.json"
    };
    buildDirectoryTree(arhiveDirectoryObj);

    // Rebuild search index
    let arhiveSearchObj = {
      directoryRoot: "./root/files",
      writeTarget: "./root",
      filename: "searchIndex.json",
      archiveBase: "https://archive.icjia.cloud/files",
      exclusions: ["directoryTree.json", "searchIndex.json"]
    };

    buildSearchIndex(arhiveSearchObj);

    res.send({
      status: 200,
      msg: "Success",
      allFiles: req.files,
      successfulUploads,
      failedUploads
    });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
