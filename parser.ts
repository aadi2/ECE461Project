import * as fs from 'fs';

export const getInfo = (url: string): void => {
    // Your logic to handle and process the URL goes here
    console.log(`Processing URL: ${url}`);
};

// Check if this module is being run directly (i.e., `node project.js`)
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

        // Split lines and process each URL
        const urls = data.split('\n').filter(url => url.trim() !== ''); // this will filter out any empty lines
        urls.forEach(url => getInfo(url));
    });
}
