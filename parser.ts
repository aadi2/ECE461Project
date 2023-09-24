import * as fs from 'fs';


export const getInfo = (url: string): void => {
    // Your logic to handle and process the URL goes here
};

export const processUrls = (filePath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {

        // Read the file content
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return;
            }

            if (!data.trim()) {
                return;
            }

            // Split lines and process each URL
            const urls = data.split('\n').filter(url => url.trim() !== ''); // this will filter out any empty lines
            if (urls.length === 0) {
                return;
            }
            resolve(urls);
        });
    });
}

// Check if this module is being run directly
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        process.exit(1);
    }
    processUrls(filePath);
}
