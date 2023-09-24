const { exec } = require('child_process');
const { exit } = require('process');
const fs = require('fs');

// Run Jest tests
const command = './node_modules/.bin/jest --json';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        exit(1);
    }

    try {
        const report = JSON.parse(stdout);
        const passedTests = report.numPassedTests;
        const totalTests = report.numTotalTests;

        console.log(`${passedTests}/${totalTests} test cases passed.`);

        // Write test results to a file
        fs.writeFileSync('test-results.ndjson', JSON.stringify({
            TEST_PASSED: passedTests,
            TEST_TOTAL: totalTests,
        }) + '\n');

        // Exit 0 if all tests pass, otherwise exit 1
        exit(report.numFailedTests > 0 ? 1 : 0);

    } catch (parseError) {
        console.error(`Failed to parse test report: ${parseError}`);
        exit(1);
    }
});
