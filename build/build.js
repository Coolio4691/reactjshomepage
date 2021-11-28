var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var files = [
    "../src/vars.js",
    "../src/rules.js",
    "../src/util.js",
    "../src/classes/settings.js",
    "../src/classes/pageContainer.js",
    "../src/classes/page.js",
    "../src/classes/time.js",
    "../src/classes/weather.js",
    "../src/classes/customPage.js",
    "../src/classes/body.js",
    "../src/pages/homepage.js",
    "../src/classes/databasemanager.js",
    "../src/index.js",
    "../src/events.js",
]

browserify({ debug: true, entries: files })
  .transform(babelify, { comments: false, compact: true })
  .bundle()
  .on("error", function (err) { console.log("Error: " + err.message); })
  .pipe(fs.createWriteStream("../bundle.js"));