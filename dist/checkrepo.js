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
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
function fetchGitHubRepositoryInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const owner = 'thenativeweb';
        const name = 'timer2';
        // Read the GraphQL query from the file
        const query = fs_1.default.readFileSync('queries.txt', 'utf-8');
        // Make the GraphQL API request to GitHub
        try {
            const response = yield axios_1.default.post('https://api.github.com/graphql', {
                query,
            });
            const data = response.data.data.repository;
            const lastCommitDate = new Date(data.defaultBranchRef.target.history.edges[0].node.committedDate);
            const currentDate = new Date();
            const timeDifference = currentDate.getTime() - lastCommitDate.getTime();
            const daysSinceLastCommit = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const readmeText = data.object.text;
            // You can use regular expressions to extract specific information from the README.md file here.
            console.log(`Last Commit Date: ${lastCommitDate.toISOString()}`);
            console.log(`Days Since Last Commit: ${daysSinceLastCommit}`);
            console.log(`README.md Text:\n${readmeText}`);
        }
        catch (error) {
            console.error('Error fetching repository info:', error);
        }
    });
}
fetchGitHubRepositoryInfo();
