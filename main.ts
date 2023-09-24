import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { calculateBusFactor, netScore, responsiveMaintainer, licenseCheck, calculateCorrectnessScore, RampUp } from './algo';
import { getInfo, processUrls } from './parser';
import * as dotenv from 'dotenv'
const winston = require('winston'); // Import Winston using CommonJS syntax
winston.remove(winston.transports.Console); // Remove the default console transport


dotenv.config();
// Configure Winston to use a log file and set log level based on environment variables
winston.configure({
  level: process.env.LOG_LEVEL || 'error', // Default to 'error' if LOG_LEVEL is not set
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: process.env.LOG_FILE || 'app.log' }), // Log to a file
  ],
});

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

// Function to fetch the number of weekly commits and other required data
async function fetchDataAndCalculateScore(repoUrl: string) {
  // Define your GitHub Personal Access Token
  const githubToken = process.env.GITHUB_TOKEN; // Replace with your GitHub token

  // Define headers with the authorization token
  const headers = {
    Authorization: `Bearer ${githubToken}`,
  };
  // Define the GraphQL endpoint URL
  const graphqlEndpoint = 'https://api.github.com/graphql';

  // Create or clear the local repository directory
  createOrClearDirectory(localRepositoryDirectory);
  winston.info(`Processing URL: ${repoUrl}`);

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
    
    winston.debug(`Weekly Commit Count: ${weeklyCommitCount}`);
    winston.debug(`Ramp Up Score: ${rampUpResult}`);
    winston.debug(`Correctness Score: ${correctnessScore}`);
    winston.debug(`Bus Factor Score: ${busFactorResult}`);
    winston.debug(`Responsive Maintainer Score: ${responsiveMaintainerResult}`);
    winston.debug(`License Score: ${licenseCheckResult}`);

    // Calculate the net score using your netScore function
    const netScoreResult = netScore(
      licenseCheckResult,
      busFactorResult,
      responsiveMaintainerResult,
      correctnessScore, // Include the correctness score
      rampUpResult // Use the retrieved weeklyCommits value
    );
    winston.info(`NET_SCORE: ${netScoreResult}`);

    // Return the result for NDJSON formatting
    const output = {
      URL: repoUrl,
      NET_SCORE: netScoreResult,
      RAMP_UP_SCORE: rampUpResult,
      CORRECTNESS_SCORE: correctnessScore,
      BUS_FACTOR_SCORE: busFactorResult,
      RESPONSIVE_MAINTAINER_SCORE: responsiveMaintainerResult,
      LICENSE_SCORE: licenseCheckResult,
    };
    
    const jsonOutput = JSON.stringify(output);

    console.log(jsonOutput);

  } catch (error) {
    winston.error(`Error processing URL ${repoUrl}: ${error}`);
    process.exit(1); // Exit with a failure status code (1) on error
  }
}

async function processAndCalculateScoresForUrls(filePath: string, outputStream: NodeJS.WritableStream) {
  try {
    const urls = await processUrls(filePath);

    // Process URLs sequentially using async/await
    for (const repoUrl of urls) {
      const result = await fetchDataAndCalculateScore(repoUrl);

      // Format the result as NDJSON and write it to the output stream
      outputStream.write(JSON.stringify(result) + '\n');
    }

    // All URLs processed successfully, exit with a success status code (0)
    process.exit(0);
  } catch (error) {
    console.error('Error processing URLs or calculating scores:', error);
    process.exit(1); // Exit with a failure status code (1) on error
  }
}

const filePath = process.argv[2];
if (!filePath) {
  process.exit(1); // Exit with a failure status code (1) when no file path is provided
}

// Create a writable stream for NDJSON output
const outputStream = fs.createWriteStream('output.ndjson');

// Write the NDJSON header
outputStream.write('[');

// Process URLs and write NDJSON output
processAndCalculateScoresForUrls(filePath, outputStream);

// Handle the end of NDJSON data and close the output stream
outputStream.on('finish', () => {
  // Close the NDJSON array
  fs.appendFileSync('output.ndjson', ']');
  process.exit(0);
});

// Define a function to parse GitHub repository URL
function parseGitHubUrl(url) {
  const githubRegex = /github\.com\/([^/]+)\/([^/]+)/;
  const match = url.match(githubRegex);

  if (match && match.length === 3) {
    const owner = match[1];
    const repoName = match[2];
    return { owner, repoName };
  } else {
    return null;
  }
}

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
    return []; // Return an empty array in case of an error
  }
}
