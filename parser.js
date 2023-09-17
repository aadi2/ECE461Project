"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfo = void 0;
var fs = require("fs");
var getInfo = function (url) {
    // Your logic to handle and process the URL goes here
    console.log("Processing URL: ".concat(url));
};
exports.getInfo = getInfo;
// Check if this module is being run directly (i.e., `node project.js`)
if (require.main === module) {
    var filePath = process.argv[2];
    if (!filePath) {
        console.error("No file path provided.");
        process.exit(1);
    }
    // Read the file content
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading the file: ".concat(err));
            process.exit(1);
        }
        // Split lines and process each URL
        var urls = data.split('\n').filter(function (url) { return url.trim() !== ''; }); // this will filter out any empty lines
        urls.forEach(function (url) { return (0, exports.getInfo)(url); });
    });
}
