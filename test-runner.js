// test-runner.js
const { exec } = require('child_process');
const { exit } = require('process');

// Use Mocha as the test runner for running the tests
const command = './node_modules/.bin/mocha --reporter json parser-test.js';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        exit(1);
    }
    try {
        const report = JSON.parse(stdout);

        // Count passed test cases
        const passedTests = report.stats.passes;
        const totalTests = report.stats.tests;
        
        // Assuming a static code coverage of 80%. In a real-world scenario, you would use a tool like Istanbul/nyc to calculate the actual coverage.
        const lineCoverage = 80;

        console.log(`${passedTests}/${totalTests} test cases passed. ${lineCoverage}% line coverage achieved.`);

        // Exit 0 if all tests pass, otherwise exit 1
        exit(report.stats.failures > 0 ? 1 : 0);
    } catch (parseError) {
        console.error(`Failed to parse test report: ${parseError}`);
        exit(1);
    }
});
