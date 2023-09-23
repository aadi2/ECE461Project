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
var fs = require("fs");
var path = require("path");
var axios_1 = require("axios");
var algo_1 = require("./algo");
var parser_1 = require("./parser");
// Determine the subdirectory name for storing cloned repositories
var localRepositorySubdirectory = 'cloned_repositories';
// Construct the full path to the local repository directory
var localRepositoryDirectory = path.join(__dirname, localRepositorySubdirectory);
// Function to create or clear a directory
function createOrClearDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        var files = fs.readdirSync(directoryPath);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filePath_1 = path.join(directoryPath, file);
            if (fs.lstatSync(filePath_1).isDirectory()) {
                // Recursively remove directories
                createOrClearDirectory(filePath_1);
                fs.rmdirSync(filePath_1);
            }
            else {
                // Delete files
                fs.unlinkSync(filePath_1);
            }
        }
    }
    else {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}
// Create or clear the local repository directory
createOrClearDirectory(localRepositoryDirectory);
var repoUrl = 'https://github.com/krahets/hello-algo';
var _a = parseGitHubUrl(repoUrl), owner = _a.owner, repoName = _a.repoName;
// Read GraphQL queries from queries.txt
var queries = "\n  query {\n    repository(owner:\"".concat(owner, "\",name:\"").concat(repoName, "\"){\n      defaultBranchRef{\n        target{\n          ... on Commit{\n            history(first:1){\n              edges{\n                node{\n                  committedDate\n                }\n              }\n            }\n          }\n        }\n      }\n      object(expression: \"HEAD:README.md\") {\n        ... on Blob {\n          text\n        }\n      }\n    }\n  }\n");
// Define your GitHub Personal Access Token
var githubToken = ' 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 '; // Replace with your GitHub token
// Define the GraphQL endpoint URL
var graphqlEndpoint = 'https://api.github.com/graphql';
// Define headers with the authorization token
var headers = {
    Authorization: "Bearer ".concat(githubToken),
};
// Function to fetch the number of weekly commits and other required data
function fetchDataAndCalculateScore(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, lastCommitDate, readmeText, oneWeekAgo, weeklyCommitCount, _i, _a, commit, commitDate, rampUpResult, issues, correctnessScore, busFactorResult, responsiveMaintainerResult, licenseCheckResult, netScoreResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post(graphqlEndpoint, { query: queries }, { headers: headers })];
                case 1:
                    response = _b.sent();
                    data = response.data.data;
                    lastCommitDate = new Date(data.repository.defaultBranchRef.target.history.edges[0].node.committedDate);
                    console.log(lastCommitDate);
                    readmeText = data.repository.object.text;
                    oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    weeklyCommitCount = 0;
                    for (_i = 0, _a = data.repository.defaultBranchRef.target.history.edges; _i < _a.length; _i++) {
                        commit = _a[_i];
                        commitDate = new Date(commit.node.committedDate);
                        if (commitDate >= oneWeekAgo && commitDate <= lastCommitDate) {
                            weeklyCommitCount++;
                        }
                        else {
                            // Break the loop as soon as a commit is older than one week
                            break;
                        }
                    }
                    rampUpResult = (0, algo_1.RampUp)(weeklyCommitCount);
                    return [4 /*yield*/, fetchAndProcessIssues(repoUrl)];
                case 2:
                    issues = _b.sent();
                    correctnessScore = (0, algo_1.calculateCorrectnessScore)(issues);
                    return [4 /*yield*/, (0, algo_1.calculateBusFactor)(repoUrl, // Replace with the actual repository URL
                        localRepositoryDirectory // Replace with the local directory path
                        )];
                case 3:
                    busFactorResult = _b.sent();
                    responsiveMaintainerResult = (0, algo_1.responsiveMaintainer)(lastCommitDate.getTime());
                    licenseCheckResult = (0, algo_1.licenseCheck)(readmeText);
                    netScoreResult = (0, algo_1.netScore)(licenseCheckResult, busFactorResult, responsiveMaintainerResult, correctnessScore, // Include the correctness score
                    rampUpResult // Use the retrieved weeklyCommits value
                    );
                    // Print the results or perform further processing
                    console.log('Ramp Up', rampUpResult);
                    console.log('Correctness Score', correctnessScore);
                    console.log('Bus Factor:', busFactorResult);
                    console.log('Responsive Maintainer:', responsiveMaintainerResult);
                    console.log('License Check:', licenseCheckResult);
                    console.log('Net Score:', netScoreResult);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('Error fetching data or calculating score:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function processAndCalculateScoresForUrls(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var urls, _i, urls_1, repoUrl_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, parser_1.processUrls)(filePath)];
                case 1:
                    urls = _a.sent();
                    _i = 0, urls_1 = urls;
                    _a.label = 2;
                case 2:
                    if (!(_i < urls_1.length)) return [3 /*break*/, 5];
                    repoUrl_1 = urls_1[_i];
                    return [4 /*yield*/, fetchDataAndCalculateScore(repoUrl_1)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error processing URLs or calculating scores:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
var filePath = process.argv[2];
if (!filePath) {
    console.error("No file path provided.");
    process.exit(1);
}
processAndCalculateScoresForUrls(filePath);
// Call the fetchDataAndCalculateScore function to initiate the integration
// Call the fetchDataAndCalculateScore function to initiate the integration
// fetchDataAndCalculateScore();
// Define a function to fetch and process issues data from the repository
function fetchAndProcessIssues(repositoryUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var parts, owner_1, repo, response, issues, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    parts = repositoryUrl.split('/');
                    owner_1 = parts[parts.length - 2];
                    repo = parts[parts.length - 1];
                    return [4 /*yield*/, axios_1.default.get("https://api.github.com/repos/".concat(owner_1, "/").concat(repo, "/issues"))];
                case 1:
                    response = _a.sent();
                    issues = response.data.map(function (issue) { return ({
                        isBug: issue.labels.some(function (label) { return label.name === 'bug'; }),
                        status: issue.state,
                    }); });
                    return [2 /*return*/, issues];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching or processing issues:', error_3);
                    return [2 /*return*/, []]; // Return an empty array in case of an error
                case 3: return [2 /*return*/];
            }
        });
    });
}
function parseGitHubUrl(url) {
    var githubRegex = /github\.com\/([^/]+)\/([^/]+)/;
    var match = url.match(githubRegex);
    if (match && match.length === 3) {
        var owner_2 = match[1];
        var repoName_1 = match[2];
        return { owner: owner_2, repoName: repoName_1 };
    }
    else {
        console.error('Invalid GitHub URL');
        return null;
    }
}
