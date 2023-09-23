import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { calculateBusFactor, netScore, responsiveMaintainer, licenseCheck } from './algo';
import { getInfo, processUrls } from './parser';

// Determine the subdirectory name for storing cloned repositories
const localRepositorySubdirectory = 'cloned_repositories';

// Construct the full path to the local repository directory
const localRepositoryDirectory = path.join(__dirname, localRepositorySubdirectory);

// Read GraphQL queries from queries.txt
const queries = fs.readFileSync('queries.txt', 'utf8');

// Define your GitHub Personal Access Token
const githubToken = process.env.GITHUB_TOKEN; // Use environment variable for security

// Define the GraphQL endpoint URL
const graphqlEndpoint = 'https://api.github.com/graphql';

// Define headers with the authorization token
const headers = {
  Authorization: `Bearer ${githubToken}`,
};

// Function to fetch the number of weekly commits and other required data
async function fetchDataAndCalculateScore() {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      { query: queries },
      { headers }
    );

    const data = response.data.data;

    // Extract the necessary data from the GraphQL response
    const lastCommitDate = new Date(data.repository.defaultBranchRef.target.history.edges[0].node.committedDate);
    const readmeText = data.repository.object.text;

    // Calculate the date one week ago from the current date
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count the number of commits within the past week
    let weeklyCommitCount = 0;
    for (const commit of data.repository.defaultBranchRef.target.history.edges) {
      const commitDate = new Date(commit.node.committedDate);
      if (commitDate >= oneWeekAgo && commitDate <= lastCommitDate) {
        weeklyCommitCount++;
      } else {
        // Break the loop as soon as a commit is older than one week
        break;
      }
    }

    // Process the data using your algo functions
    const busFactorResult = await calculateBusFactor(
      repoUrl, // Replace with the actual repository URL
      localRepositoryDirectory // Replace with the local directory path
    );

    const responsiveMaintainerResult = responsiveMaintainer(
      lastCommitDate.getTime()
    );

    const licenseCheckResult = licenseCheck(readmeText);

    // Calculate the net score using your netScore function
    const netScoreResult = netScore(
      busFactorResult.length,
      busFactorResult.length,
      responsiveMaintainerResult,
      licenseCheckResult,
      weeklyCommitCount // Use the retrieved weeklyCommits value
    );

    // Print the results or perform further processing
    console.log('Bus Factor:', busFactorResult);
    console.log('Responsive Maintainer:', responsiveMaintainerResult);
    console.log('License Check:', licenseCheckResult);
    console.log('Net Score:', netScoreResult);

  } catch (error) {
    console.error('Error fetching data or calculating score:', error);
  }
}

// Call the fetchDataAndCalculateScore function to initiate the integration
fetchDataAndCalculateScore();
