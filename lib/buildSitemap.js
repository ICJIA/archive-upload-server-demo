const fs = require("fs-extra");
const path = require("path");
const { createSitemap } = require("sitemap");
const searchIndex = require("../root/searchIndex.json");
let urls = [];
searchIndex.forEach(item => {
  let obj = {};
  obj.url = item.download;
  obj.changefreq = "monthly";
  obj.priority = 0.5;
  urls.push(obj);
});

const sitemap = createSitemap({
  hostname: "https://archive.icjia.cloud",
  cacheTime: 600000, // 600 sec - cache purge period
  urls
});

function buildSitemap(sitemapLocation) {
  const xml = sitemap.toXML();
  fs.writeFileSync(sitemapLocation, xml, err => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log(`Created: ${sitemapLocation}`);
  });
}

module.exports = buildSitemap;
