const buildSiteMap = require("./lib/buildSitemap");
const path = require("path");

sitemapPath = path.resolve(__dirname + "/root/sitemap.xml");
buildSiteMap(sitemapPath);
