import axios from "axios";
import { Octokit } from "octokit";
const octokit = new Octokit({
  auth: "your_personal_access_token",
});

const owner = process.env.OWNER || 'octocat'
const repo = process.env.REPO || "Spoon-Knife"
const githubToken = process.env.GITHUB_TOKEN

async function getRepositoryDetails() {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
        owner: owner,
        repo: repo,
      });

    console.log("Repository details:", response.data);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
