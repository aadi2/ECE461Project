import simpleGit, { SimpleGit, LogResult, DefaultLogFields } from 'simple-git';

interface Contributor {
  name: string;
  commitCount: number;
}

export async function calculateBusFactor(repositoryUrl: string, localDirectory: string, topContributorsCount: number = 3): Promise<Contributor[]> {
  // Initialize SimpleGit
  const git: SimpleGit = simpleGit();

  try {
    // Clone the Git repository
    await git.clone(repositoryUrl, localDirectory);
    console.log('Repository cloned successfully.');

    // Get the list of commit log lines
    const log: LogResult<DefaultLogFields> = await git.log();

    // Create a map to store commit counts per contributor
    const commitCounts = new Map<string, number>();

    // Iterate through the commit log and count contributions
    for (const commit of log.all) {
      const author = commit.author_name;

      // If the author is already in the map, increment their commit count
      if (commitCounts.has(author)) {
        commitCounts.set(author, commitCounts.get(author)! + 1);
      } else {
        // Otherwise, initialize their commit count to 1
        commitCounts.set(author, 1);
      }
    }

    // Sort contributors by commit count in descending order
    const sortedContributors = Array.from(commitCounts.entries()).sort((a, b) => b[1] - a[1]);

    // Calculate the bus factor (e.g., top N contributors)
    const busFactor = sortedContributors.slice(0, topContributorsCount).map(([contributor, count]) => ({
      name: contributor,
      commitCount: count,
    }));

    // Return the bus factor as an array of contributor objects
    return busFactor;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error; // Re-throw the error if needed
  }
}

export function netScore(ls: number, bf: number, rm: number, cs: number, ru: number) {
    return (ls * (bf * .3 + rm * .3 + cs * .2 + ru * .2));
}

export function responsiveMaintainer(date:number) {
    // Calculate the number of days since the last publish
    const currentDate = new Date();
    const lastPublishDate = new Date(date);
    const daysSinceLastPublish = Math.floor((currentDate.getTime() - lastPublishDate.getTime()) / (1000 * 60 * 60 * 24));

    let resp: number = 1 - (daysSinceLastPublish / 365);
    if (resp > 0) {
        return resp;
    }
    return 0;
}

export function RampUp(weekly:number){
    let score: number = weekly/100000000;
    if(score < 1) {
        return score;
    }
    return 1;
}

export function licenseCheck(readmeContent: string): number {
    // Use regex to parse the project readme and check for the required license
    const licenseRegex = /GNU Lesser General Public License v2\.1/;
    const hasLicense = licenseRegex.test(readmeContent);
  
    // Return a score of 1 if the license matches, 0 otherwise
    return hasLicense ? 1 : 0;
}


//TODO:Correctness
