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
    return new Promise(function (resolve, reject) {
        console.log("Attempting to process file: ".concat(filePath));
        // Read the file content
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                console.error("Error reading the file: ".concat(err));
                reject(err);
                return;
            }
            if (!data.trim()) {
                console.error("File is empty or contains only whitespace.");
                reject(new Error("File is empty or contains only whitespace."));
                return;
            }
            // Split lines and process each URL
            var urls = data.split('\n').filter(function (url) { return url.trim() !== ''; }); // this will filter out any empty lines
            if (urls.length === 0) {
                console.error("No URLs found in the file.");
                reject(new Error("No URLs found in the file."));
                return;
            }
            resolve(urls);
        });
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
