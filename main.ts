import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { calculateBusFactor, netScore, responsiveMaintainer, licenseCheck, calculateCorrectnessScore, RampUp } from './algo';
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
const repoUrl = 'https://github.com/krahets/hello-algo';

const { owner, repoName } = parseGitHubUrl(repoUrl);
// Read GraphQL queries from queries.txt
const queries = `
  query {
    repository(owner:"${owner}",name:"${repoName}"){
      defaultBranchRef{
        target{
          ... on Commit{
            history(first:1){
              edges{
                node{
                  committedDate
                }
              }
            }
          }
        }
      }
      object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
    }
  }
`;
// Define your GitHub Personal Access Token
const githubToken = ' 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 '; // Replace with your GitHub token

// Define the GraphQL endpoint URL
const graphqlEndpoint = 'https://api.github.com/graphql';

// Define headers with the authorization token
const headers = {
  Authorization: `Bearer ${githubToken}`,
};


// Function to fetch the number of weekly commits and other required data
async function fetchDataAndCalculateScore(url : string) {
  try {
    const response = await axios.post(
      graphqlEndpoint,
      { query: queries },
      { headers }
    );

    const data = response.data.data;

    // Extract the necessary data from the GraphQL response
    const lastCommitDate = new Date(data.repository.defaultBranchRef.target.history.edges[0].node.committedDate);
    console.log(lastCommitDate);
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

    const rampUpResult = RampUp(weeklyCommitCount);
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
      busFactorResult,
      responsiveMaintainerResult,
      correctnessScore, // Include the correctness score
      rampUpResult // Use the retrieved weeklyCommits value
    );

    // Print the results or perform further processing
    console.log('URL:', url);
    console.log('Ramp Up', rampUpResult);
    console.log('Correctness Score', correctnessScore);
    console.log('Bus Factor:', busFactorResult);
    console.log('Responsive Maintainer:', responsiveMaintainerResult);
    console.log('License Check:', licenseCheckResult);
    console.log('Net Score:', netScoreResult);

  } catch (error) {
    console.error('Error fetching data or calculating score:', error);
  }
}

// Call the fetchDataAndCalculateScore function to initiate the integration
// Call the fetchDataAndCalculateScore function to initiate the integration

  fetchDataAndCalculateScore();


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

function parseGitHubUrl(url) {
  const githubRegex = /github\.com\/([^/]+)\/([^/]+)/;
  const match = url.match(githubRegex);

  if (match && match.length === 3) {
    const owner = match[1];
    const repoName = match[2];
    return { owner, repoName };
  } else {
    console.error('Invalid GitHub URL');
    return null;
  }
}
