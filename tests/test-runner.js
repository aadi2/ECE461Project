/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/. 
*/
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
