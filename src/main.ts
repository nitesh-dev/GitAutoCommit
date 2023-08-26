import express from "express";
import env from "dotenv";
env.config();
import {
  getRepositoryDetails,
  getTodayCommitCount,
  updateReadme,
} from "./github.js";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.send("Server is working");
});

app.post("/commit", async (req, res) => {
  const count = await getTodayCommitCount();
  if (count == 0) {
    await updateReadme();
    return res.send("done");
    
  } else if (count > 0) {
    res.send("Commit already exist");
  } else {
    res.send("unable to commit");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
