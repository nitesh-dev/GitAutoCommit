import express from "express";
import env from "dotenv";
import {
  start
} from "./github.js";
env.config();

const owners = (process.env.OWNER || "octocat").replace(/\s+/g,' ').trim().split(" ");
const repo = (process.env.REPO || "Spoon-Knife").replace(/\s+/g,' ').trim().split(" ");
const githubToken = (process.env.GITHUB_TOKEN || "").replace(/\s+/g,' ').trim().split(" ");

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.send("Server is working");
});

app.get("/commit", async (req, res) => {
  const response = await start(githubToken, owners, repo)
  res.json(response)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
