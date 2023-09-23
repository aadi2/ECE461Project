import * as fs from 'fs';

console.log("parser.js is being executed...");

export const getInfo = (url: string): void => {
    // Your logic to handle and process the URL goes here
    console.log(`Processing URL: ${url}`);
};

export const processUrls = (filePath: string): void => {
    console.log(`Attempting to process file: ${filePath}`);

    // Check if this module is being run directly
    if (require.main === module) {
        const filePath = process.argv[2];
        if (!filePath) {
            console.error("No file path provided.");
            process.exit(1);
        }

        // Read the file content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading the file: ${err}`);
                process.exit(1);
            }

            if (!data.trim()) {
                console.error("File is empty or contains only whitespace.");
                process.exit(1);
            }

            // Split lines and process each URL
            const urls = data.split('\n').filter(url => url.trim() !== ''); // this will filter out any empty lines
            if (urls.length === 0) {
                console.error("No URLs found in the file.");
                process.exit(1);
            }
            urls.forEach(url => getInfo(url));
        });
    }
}
