import * as fs from 'fs';
import axios from 'axios';
import { calculateBusFactor, netScore, responsiveMaintainer, licenseCheck } from './algo'; // Import functions from algo.ts
import { getInfo, processUrls } from './parser';

// Read GraphQL queries from queries.txt
const queries = fs.readFileSync('queries.txt', 'utf8');

// Define your GitHub Personal Access Token
const githubToken = 'YOUR_GITHUB_TOKEN'; // Replace with your GitHub token

// Define the GraphQL endpoint URL
const graphqlEndpoint = 'https://api.github.com/graphql';

// Define headers with the authorization token
const headers = {
  Authorization: `Bearer ${githubToken}`,
};

const repoUrl = (processUrls as any).repoUrl;
// Send the GraphQL query
async function sendQuery() {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      { query: queries },
      { headers }
    );

    // Handle the GraphQL response
    const data = response.data.data; // Extract the relevant data

    // Process the data using your algo functions
    const busFactorResult = await calculateBusFactor(
      repoUrl, // Replace with the actual repository URL
      'LOCAL_DIRECTORY' // Replace with the local directory path
    );

    const responsiveMaintainerResult = responsiveMaintainer(
      new Date(data.repository.defaultBranchRef.target.history.edges[0].node.committedDate).getTime()
    );

    const licenseCheckResult = licenseCheck(
      data.repository.object.text
    );

    const weeklyCommits = 0; // Replace with the actual weekly commits from QUeries

    // Calculate the net score using your netScore function
    const netScoreResult = netScore(
      busFactorResult.length,
      busFactorResult.length,
      responsiveMaintainerResult,
      licenseCheckResult,
      weeklyCommits
    );

    // Print the results or perform further processing
    console.log('Bus Factor:', busFactorResult);
    console.log('Responsive Maintainer:', responsiveMaintainerResult);
    console.log('License Check:', licenseCheckResult);
    console.log('Net Score:', netScoreResult);

  } catch (error) {
    console.error('Error sending GraphQL query:', error);
  }
}

// Call the sendQuery function to initiate the integration
sendQuery();
