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
const temp_directory = "./.tmp/";
const buildDirectoryTree = require("./lib/buildDirectoryTree");
const jsonfile = require("jsonfile");
// const buildSearchIndex = require("./lib/buildSearchIndex");
// const buildSiteMap = require("./lib/buildSitemap");
const { createSitemap } = require("sitemap");

if (!fs.existsSync(temp_directory)) {
  console.log("create temp directory");
  fs.mkdirSync(temp_directory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb, dest) => {
    cb(null, temp_directory);
  },
  filename: (req, file, cb) => {
    const newFilename = `${file.originalname}`;

    cb(null, newFilename);
  }
});

const upload = multer({ storage });
const app = express();
const sitemap = createSitemap({
  hostname: "http://example.com",
  cacheTime: 600000, // 600 sec - cache purge period
  urls: [
    { url: "/page-1/", changefreq: "daily", priority: 0.3 },
    { url: "/page-2/", changefreq: "monthly", priority: 0.7 },
    { url: "/page-3/" }, // changefreq: 'weekly',  priority: 0.5
    { url: "/page-4/", img: "http://urlTest.com" }
  ]
});
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send({ status: 200, msg: "Working!" }));

app.get("/sitemap.xml", function(req, res) {
  try {
    const xml = sitemap.toXML();
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.post("/", upload.array("files"), async (req, res) => {
  let clientToken = req.body.uploadToken;
  if (clientToken !== serverToken) {
    res.status(403).end();
  } else {
    let dir = req.body.path;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let successfulUploads = [];
    let failedUploads = [];

    req.files.forEach(file => {
      if (!fs.existsSync(dir + file.originalname)) {
        successfulUploads.push(file.originalname);
        fs.move(
          temp_directory + file.originalname,
          dir + file.originalname,
          function(err) {
            if (err) {
              return console.error(err);
            }
          }
        );
      } else {
        failedUploads.push(file.originalname);
        fs.emptyDirSync(temp_directory);
        console.log("File exists: ", dir + file.originalname);
      }
    });

    //Rebuild directory tree
    const arhiveDirectoryObj = {
      directoryRoot: path.resolve(__dirname + "/root/files"),
      writeTarget: path.resolve(__dirname + "/root"),
      filename: "directoryTree.json"
    };

    buildDirectoryTree(arhiveDirectoryObj).then(response => {
      jsonfile.writeFileSync(
        `${arhiveDirectoryObj.writeTarget}/${arhiveDirectoryObj.filename}`,
        response,
        function(err) {
          if (err) console.error(err);
        }
      );
      res.send({
        status: 200,
        msg: "Success",
        allFiles: req.files,
        successfulUploads,
        failedUploads
      });
    });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
