"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCorrectnessScore = exports.licenseCheck = exports.RampUp = exports.responsiveMaintainer = exports.netScore = exports.calculateBusFactor = void 0;
var simple_git_1 = require("simple-git");
function calculateBusFactor(repositoryUrl, localDirectory, topContributorsCount) {
    if (topContributorsCount === void 0) { topContributorsCount = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var git, log, commitCounts, _i, _a, commit, author, sortedContributors, busFactor, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    // Clone the Git repository
                    return [4 /*yield*/, git.clone(repositoryUrl, localDirectory)];
                case 2:
                    // Clone the Git repository
                    _b.sent();
                    console.log('Repository cloned successfully.');
                    return [4 /*yield*/, git.log()];
                case 3:
                    log = _b.sent();
                    commitCounts = new Map();
                    // Iterate through the commit log and count contributions
                    for (_i = 0, _a = log.all; _i < _a.length; _i++) {
                        commit = _a[_i];
                        author = commit.author_name;
                        // If the author is already in the map, increment their commit count
                        if (commitCounts.has(author)) {
                            commitCounts.set(author, commitCounts.get(author) + 1);
                        }
                        else {
                            // Otherwise, initialize their commit count to 1
                            commitCounts.set(author, 1);
                        }
                    }
                    sortedContributors = Array.from(commitCounts.entries()).sort(function (a, b) { return b[1] - a[1]; });
                    busFactor = sortedContributors.slice(0, topContributorsCount).map(function (_a) {
                        var contributor = _a[0], count = _a[1];
                        return ({
                            name: contributor,
                            commitCount: count,
                        });
                    });
                    // Return the bus factor as an array of contributor objects
                    return [2 /*return*/, busFactor];
                case 4:
                    error_1 = _b.sent();
                    console.error("Error: ".concat(error_1));
                    throw error_1; // Re-throw the error if needed
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.calculateBusFactor = calculateBusFactor;
function netScore(ls, bf, rm, cs, ru) {
    return (ls * (bf * 0.3 + rm * 0.3 + cs * 0.1 + ru * 0.2)); // Adjust the weights as needed
}
exports.netScore = netScore;
function responsiveMaintainer(date) {
    // Calculate the number of days since the last publish
    var currentDate = new Date();
    var lastPublishDate = new Date(date);
    var daysSinceLastPublish = Math.floor((currentDate.getTime() - lastPublishDate.getTime()) / (1000 * 60 * 60 * 24));
    var resp = 1 - (daysSinceLastPublish / 365);
    if (resp > 0) {
        return resp;
    }
    return 0;
}
exports.responsiveMaintainer = responsiveMaintainer;
function RampUp(weekly) {
    var score = weekly / 100000000;
    if (score < 1) {
        return score;
    }
    return 1;
}
exports.RampUp = RampUp;
function licenseCheck(readmeContent) {
    // Use regex to parse the project readme and check for the required license
    var licenseRegex = /GNU Lesser General Public License v2\.1/;
    var hasLicense = licenseRegex.test(readmeContent);
    // Return a score of 1 if the license matches, 0 otherwise
    return hasLicense ? 1 : 0;
}
exports.licenseCheck = licenseCheck;
function calculateCorrectnessScore(issues) {
    // Implement your logic to calculate the "correctness" score based on issues
    // For example, you can count open bugs and calculate a score
    var openBugs = issues.filter(function (issue) { return issue.isBug && issue.status === 'open'; }).length;
    var totalBugs = issues.filter(function (issue) { return issue.isBug; }).length;
    // Calculate the correctness score as the ratio of open bugs to total bugs
    if (totalBugs === 0) {
        return 1; // If there are no bugs, consider it perfect
    }
    return 1 - openBugs / totalBugs;
}
exports.calculateCorrectnessScore = calculateCorrectnessScore;
