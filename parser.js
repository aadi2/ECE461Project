"use strict";
/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/.
*/
exports.__esModule = true;
exports.processUrls = exports.getInfo = void 0;
var fs = require("fs");
var getInfo = function (url) {
    // Your logic to handle and process the URL goes here
};
exports.getInfo = getInfo;
var processUrls = function (filePath) {
    return new Promise(function (resolve, reject) {
        // Read the file content
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                return;
            }
            if (!data.trim()) {
                return;
            }
            // Split lines and process each URL
            var urls = data.split('\n').filter(function (url) { return url.trim() !== ''; }); // this will filter out any empty lines
            if (urls.length === 0) {
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
        process.exit(1);
    }
    (0, exports.processUrls)(filePath);
}
