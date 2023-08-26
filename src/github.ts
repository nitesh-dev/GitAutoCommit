import axios from "axios";
import { Octokit } from "@octokit/rest";
import env from "dotenv";
env.config();

const owner = process.env.OWNER || "octocat";
const repo = process.env.REPO || "Spoon-Knife";
const githubToken = process.env.GITHUB_TOKEN || "";

// README file update information
const filePath = "README.md"; // Path to the README file
const commitMessage = "README file quotes changes";
const branch = "main";

export async function getRepositoryDetails() {
  try {
    // creating new connection
    const octokit = new Octokit({
      auth: githubToken,
    });

    const response = await octokit.repos.get({
      owner: owner,
      repo: repo,
    });

    // console.log("Repository details:", response.data);
    return response.data;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

export async function updateReadme() {
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

    // getting quotes
    const newFileContent = await getQuotes();

    // Update the file
    await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(newFileContent).toString("base64"),
      sha: sha,
      branch: branch,
    });

    console.log("README file updated successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
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

export async function getTodayCommitCount() {
  try {
    // creating new connection
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Get the list of commits
    const response = await octokit.repos.listCommits({
      owner: owner,
      repo: repo,
      sha: branch,
    });

    // Count commits made today
    const today = new Date().toISOString().split('T')[0];
    const todayCommits = response.data.map((value) => {
      if(value){
        if(value.commit.author && value.commit.author.date){
          if(value.commit.author.date.split("T")[0] == today){
            return value
          }
        }
      }
    })

    return todayCommits.length;
  } catch (error: any) {
    console.log(error.message)
    return -1
  }
}
