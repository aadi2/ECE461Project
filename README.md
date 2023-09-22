# ECE461Project

AUTHORS: Aadi Aggarwal, Vaibhav Turaga, Ferati Ogunwemimo, Alisher Sultansikhov

## Usage

This project streamlines common development tasks with a Bash script, `your-script.sh`. Ensure Node.js and npm are installed for the following commands:

- **Installation**: Run `./your-script.sh install` to install dependencies, including TypeScript and testing tools.

- **Fetching GitHub Repository Info**: Use `./your-script.sh fetchGitHubInfo filename-to-parse` to fetch GitHub repository information from a TypeScript file (place before "test" in the script).

- **Testing**: Execute TypeScript tests with `./your-script.sh test`. Place your tests in a "tests" folder or use filenames ending in ".test.ts".

## Algorithm Implementation (algo.ts)

This file contains TypeScript functions to assess GitHub repositories:

- **`calculateBusFactor`**: Calculates the Bus Factor, identifying top contributors based on commit history.

- **`netScore`**: Computes a net score considering various factors.

- **`responsiveMaintainer`**: Measures the responsiveness of maintainers.

- **`RampUp`**: Evaluates the repository's activity ramp-up.

- **`licenseCheck`**: Checks for a specific license in the README.

## GitHub Repository Information Checker (checkrepo.ts)

A TypeScript script (`checkrepo.ts`) fetches and analyzes GitHub repository info. Customize GraphQL queries in `queries.txt`.

## Jest Configuration (jtest.config.js)

This Jest configuration file (`jtest.config.js`) simplifies TypeScript testing setup.

## GitHub Repository Information Integration (main.ts)

This TypeScript script (`main.ts`) integrates GitHub API queries, data processing, and custom algorithms.

## URL Parsing and Processing (parser.js / parser.ts)

These modules handle and process URLs from a file, with JavaScript (`parser.js`) and TypeScript (`parser.ts`) options.

### Usage

- Import `getInfo` function for custom URL processing.

- Run as a script with `node parser.js filePath` (JavaScript) or `ts-node parser.ts filePath` (TypeScript).
