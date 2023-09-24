const { exec } = require('child_process');
const { exit } = require('process');
const fs = require('fs');

// Use Mocha as the test runner for running the tests
const command = './node_modules/.bin/mocha --reporter json parser-test.js';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        exit(1);
    }

    try {
        const report = JSON.parse(stdout);
        const passedTests = report.stats.passes;
        const totalTests = report.stats.tests;

        // For code coverage, we'll utilize nyc (which is Istanbul's command-line tool)
        exec('./node_modules/.bin/nyc report --reporter=json', (err, coverageOutput) => {
            if (err) {
                console.error(`Coverage error: ${err}`);
                exit(1);
            }

            try {
                const coverageReport = JSON.parse(coverageOutput);
                const lineCoverage = (coverageReport.total.lines.covered / coverageReport.total.lines.total) * 100;

                console.log(`${passedTests}/${totalTests} test cases passed. ${lineCoverage.toFixed(2)}% line coverage achieved.`);

                // Writing test results to a file
                fs.writeFileSync('test-results.ndjson', JSON.stringify({
                    TEST_PASSED: passedTests,
                    TEST_TOTAL: totalTests,
                    LINE_COVERAGE: lineCoverage.toFixed(2)
                }) + '\n');

                // Exit 0 if all tests pass, otherwise exit 1
                exit(report.stats.failures > 0 ? 1 : 0);
            } catch (coverageParseError) {
                console.error(`Failed to parse coverage report: ${coverageParseError}`);
                exit(1);
            }
        });
    } catch (parseError) {
        console.error(`Failed to parse test report: ${parseError}`);
        exit(1);
    }
});
