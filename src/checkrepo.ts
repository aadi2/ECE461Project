/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/. 
*/

import axios from 'axios';
import fs from 'fs';

async function fetchGitHubRepositoryInfo() {
  const owner = 'thenativeweb';
  const name = 'timer2';

  // Read the GraphQL query from the file
  const query = fs.readFileSync('queries.txt', 'utf-8');

  // Make the GraphQL API request to GitHub
  try {
    const response = await axios.post('https://api.github.com/graphql', {
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
  } catch (error) {
    console.error('Error fetching repository info:', error);
  }
}

fetchGitHubRepositoryInfo();
