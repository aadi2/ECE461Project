"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUrls = exports.getInfo = void 0;
var fs = require("fs");
console.log("parser.js is being executed...");
var getInfo = function (url) {
    // Your logic to handle and process the URL goes here
    console.log("Processing URL: ".concat(url));
};
exports.getInfo = getInfo;
var processUrls = function (filePath) {
    console.log("Attempting to process file: ".concat(filePath));
    // Read the file content
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error("Error reading the file: ".concat(err));
            process.exit(1);
        }
        if (!data.trim()) {
            console.error("File is empty or contains only whitespace.");
            process.exit(1);
        }
        // Split lines and process each URL
        var urls = data.split('\n').filter(function (url) { return url.trim() !== ''; }); // this will filter out any empty lines
        if (urls.length === 0) {
            console.error("No URLs found in the file.");
            process.exit(1);
        }
        urls.forEach(function (url) { return (0, exports.getInfo)(url); });
    });
};
exports.processUrls = processUrls;
// Check if this module is being run directly
if (require.main === module) {
    var filePath = process.argv[2];
    if (!filePath) {
        console.error("No file path provided.");
        process.exit(1);
    }
    (0, exports.processUrls)(filePath);
}
