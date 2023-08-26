import axios from "axios";
import { Octokit } from "@octokit/rest";
import env from "dotenv";
env.config();

// README file update information
const filePath = "README.md"; // Path to the README file
const commitMessage = "README file quotes changes";
const branch = "main";

// export async function getRepositoryDetails() {
//   try {
//     // creating new connection
//     const octokit = new Octokit({
//       auth: githubToken,
//     });

//     const response = await octokit.repos.get({
//       owner: owners,
//       repo: repo,
//     });

//     // console.log("Repository details:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }

export async function updateReadme(
  githubToken: string,
  owner: string,
  repo: string,
  quote: string
) {
  try {
    // creating new connection
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Get the current file contents
    const response = await octokit.repos.getContent({
      owner: owner,
      repo: repo,
      path: filePath,
      ref: branch,
    });

    const sha = (response.data as any).sha;

    // Update the file
    await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(quote).toString("base64"),
      sha: sha,
      branch: branch,
    });

    console.log("README file updated successfully.");
    return "Successfully commit sended due to 0 commit";
  } catch (error: any) {
    console.error("An error occurred:", error);
    return "Unable to send the commit :-> " + error.message;
  }
}

async function getQuotes() {
  const url = "https://zenquotes.io/api/random";
  try {
    const response = await axios.get(url);
    const quote = response.data[0];

    return `${quote.q} | **by ${quote.a}**`;
  } catch (error: any) {
    console.log(error.message);
  }

  return "No quotes exist";
}

export async function getTodayCommitCount(githubToken: string, owner: string) {
  try {
    // creating new connection
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Get the list of commits
    const response = await octokit.activity.listPublicEventsForUser({
      username: owner,
    });

    // filter the latest commit
    const latestCommits = response.data.filter((value) => {
      if (value.type == "PushEvent") {
        return value;
      }
    });

    // Count commits made today
    const today = new Date().toISOString().split("T")[0];

    const todayCommits = latestCommits.filter((value) => {
      if (
        value &&
        value.created_at &&
        value.created_at.split("T")[0] == today
      ) {
        return value;
      }
    });

    return todayCommits.length;
  } catch (error: any) {
    console.log(error.message);
    return -1;
  }
}

export async function start(
  tokens: string[],
  owners: string[],
  repo: string[]
) {
  const reports = Array<{
    owner: string;
    repo: string;
    message: string;
  }>();

  // getting quotes
  const quote = await getQuotes();

  for (let index = 0; index < tokens.length; index++) {
    // sending request
    const count = await getTodayCommitCount(tokens[index], owners[index]);

    const report = {
      owner: owners[index],
      repo: repo[index],
      message: "",
    };

    // update readme if commit count is zero
    if (count == 0) {
      report.message = await updateReadme(
        tokens[index],
        owners[index],
        repo[index],
        quote
      );
    } else if (count > 0) {
      report.message = "You have already committed today.";
    } else {
      report.message =
        "Something went wrong with your repo! or your repo not found or bad credentials (github-token)";
    }

    reports.push(report);
  }

  return { response: reports };
}
