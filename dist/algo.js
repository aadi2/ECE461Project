"use strict";
/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCorrectnessScore = exports.licenseCheck = exports.RampUp = exports.responsiveMaintainer = exports.netScore = exports.calculateBusFactor = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
//Bus Factor = Total Code Contributions by Top Contributors / Total Code Contributions
function calculateBusFactor(repositoryUrl, localDirectory, topContributorsCount = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize SimpleGit
        const git = (0, simple_git_1.default)({ baseDir: localDirectory });
        try {
            // Clone the Git repository
            const httpsRepositoryUrl = convertToHttpsUrl(repositoryUrl);
            yield git.clone(httpsRepositoryUrl, localDirectory);
            // Get the list of commit log lines
            const log = yield git.log();
            // Create a map to store commit counts per contributor
            const commitCounts = new Map();
            // Iterate through the commit log and count contributions
            for (const commit of log.all) {
                const author = commit.author_name;
                // If the author is already in the map, increment their commit count
                if (commitCounts.has(author)) {
                    commitCounts.set(author, commitCounts.get(author) + 1);
                }
                else {
                    // Otherwise, initialize their commit count to 1
                    commitCounts.set(author, 1);
                }
            }
            // Sort contributors by commit count in descending order
            const sortedContributors = Array.from(commitCounts.entries()).sort((a, b) => b[1] - a[1]);
            // Calculate the total code contributions by top contributors
            let totalTopContributions = 0;
            for (let i = 0; i < topContributorsCount && i < sortedContributors.length; i++) {
                totalTopContributions += sortedContributors[i][1];
            }
            // Calculate the total code contributions for the entire project
            const totalContributions = log.total;
            // Calculate the Bus Factor
            const busFactor = totalTopContributions / totalContributions;
            return busFactor;
        }
        catch (error) {
            console.error(`Error: ${error}`);
            throw error; // Re-throw the error if needed
        }
    });
}
exports.calculateBusFactor = calculateBusFactor;
function netScore(ls, bf, rm, cs, ru) {
    return (ls * .1 + +bf * 0.3 + rm * 0.3 + cs * 0.1 + ru * 0.2); // Adjust the weights as needed
}
exports.netScore = netScore;
function responsiveMaintainer(date) {
    // Calculate the number of days since the last publish
    const currentDate = new Date();
    const lastPublishDate = new Date(date);
    const daysSinceLastPublish = Math.floor((currentDate.getTime() - lastPublishDate.getTime()) / (1000 * 60 * 60 * 24));
    let resp = 1 - (daysSinceLastPublish / 365);
    if (resp > 0) {
        return resp;
    }
    return 0;
}
exports.responsiveMaintainer = responsiveMaintainer;
function RampUp(weekly) {
    let score = weekly / 100;
    if (score < 1) {
        return score;
    }
    return 1;
}
exports.RampUp = RampUp;
function licenseCheck(readmeContent) {
    // Use regex to parse the project readme and check for the required license
    const licenseRegex = /GNU Lesser General Public License v2\.1/;
    const hasLicense = licenseRegex.test(readmeContent);
    // Return a score of 1 if the license matches, 0 otherwise
    return hasLicense ? 1 : 0;
}
exports.licenseCheck = licenseCheck;
function calculateCorrectnessScore(issues) {
    // Implement your logic to calculate the "correctness" score based on issues
    // For example, you can count open bugs and calculate a score
    const openBugs = issues.filter((issue) => issue.isBug && issue.status === 'open').length;
    const totalBugs = issues.filter((issue) => issue.isBug).length;
    // Calculate the correctness score as the ratio of open bugs to total bugs
    if (totalBugs === 0) {
        return 1; // If there are no bugs, consider it perfect
    }
    return 1 - openBugs / totalBugs;
}
exports.calculateCorrectnessScore = calculateCorrectnessScore;
function convertToHttpsUrl(repositoryUrl) {
    // Check if the repository URL starts with 'git@github.com:'
    if (repositoryUrl.startsWith('git@github.com:')) {
        // Extract the owner and repo from the SSH URL
        const parts = repositoryUrl.split(':');
        const ownerAndRepo = parts[1].replace('.git', '');
        // Construct the HTTPS URL
        return `https://github.com/${ownerAndRepo}`;
    }
    // If it's not an SSH URL, return the original URL
    return repositoryUrl;
}
