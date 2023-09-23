import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { calculateBusFactor, netScore, responsiveMaintainer, licenseCheck, calculateCorrectnessScore } from './algo';
import { getInfo, processUrls } from './parser';
import simpleGit, { SimpleGit, LogResult, DefaultLogFields } from 'simple-git';

// Determine the subdirectory name for storing cloned repositories
const localRepositorySubdirectory = 'cloned_repositories';

// Construct the full path to the local repository directory
const localRepositoryDirectory = path.join(__dirname, localRepositorySubdirectory);

// Function to create or clear a directory
function createOrClearDirectory(directoryPath: string) {
  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Recursively remove directories
        createOrClearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        // Delete files
        fs.unlinkSync(filePath);
      }
    }
  } else {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

// Create or clear the local repository directory
createOrClearDirectory(localRepositoryDirectory);

// Read GraphQL queries from queries.txt
const queries = fs.readFileSync('queries.txt', 'utf8');

// Define your GitHub Personal Access Token
const githubToken = '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'; // Replace with your GitHub token

// Define the GraphQL endpoint URL
const graphqlEndpoint = 'https://api.github.com/graphql';

// Define headers with the authorization token
const headers = {
  Authorization: `Bearer ${githubToken}`,
};

const repoUrl = 'https://github.com/cloudinary/cloudinary_npm';
console.log('URL:', repoUrl);

// Function to fetch the number of weekly commits and other required data
async function fetchDataAndCalculateScore(url: string) {
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

    // Fetch and process issues data
    const issues = await fetchAndProcessIssues(repoUrl);

    // Calculate the "correctness" score
    const correctnessScore = calculateCorrectnessScore(issues);

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
      licenseCheckResult,
      busFactorResult.length,
      responsiveMaintainerResult,
      correctnessScore, // Include the correctness score
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
const filePath = process.argv[2];
if (!filePath) {
    console.error("No file path provided.");
    process.exit(1);
}
processUrls(filePath).then(urls => {
  urls.forEach(url => {
      fetchDataAndCalculateScore(url);
  });
}).catch(error => {
  console.error('Error processing URLs:', error);
});

// Define a function to fetch and process issues data from the repository
async function fetchAndProcessIssues(repositoryUrl: string) {
  try {
    // Assuming your GitHub repository URL is in the format "https://github.com/owner/repo"
    const parts = repositoryUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    // Fetch issues from the GitHub REST API
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`);

    // Process the issues and return an array of Issue objects
    const issues = response.data.map((issue: any) => ({
      isBug: issue.labels.some((label: any) => label.name === 'bug'),
      status: issue.state,
    }));

    return issues;
  } catch (error) {
    console.error('Error fetching or processing issues:', error);
    return []; // Return an empty array in case of an error
  }
}
