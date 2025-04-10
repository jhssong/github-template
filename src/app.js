import axios from "axios";
import askQuestion from "./utils/askQuestion.js";
import readline from "readline";
import LabelWorker from "./apis/LabelWorker.js";
import TemplateWorker from "./apis/TemplateWorker.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("===================");
  console.log("  GITHUB TEMPLATE");
  console.log("===================");
  try {
    const GITHUB_TOKEN = await askQuestion(rl, "Enter your GitHub token: ");
    const OWNER_NAME = await askQuestion(rl, "Enter the owner name: ");
    const REPO_NAME = await askQuestion(rl, "Enter the repository name: ");

    const api = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    let work = 0;
    while (1) {
      console.log("\n\n");
      console.log("===================");
      console.log("     Work List");
      console.log("===================");
      work = await askQuestion(
        rl,
        "Select the work\n" +
          "[1] Add labels, [2] Add template, [3] Quit\n" +
          ": ",
        "int"
      );

      if (work == 3) break;
      if (work != 1 && work != 2) {
        console.log("Unknown work number please select again");
        continue;
      }

      let lang = 0;
      while (lang != 1 && lang != 2 && lang != 3)
        lang = await askQuestion(
          rl,
          "Select the language\n" + "[1] Ko, [2] En [3] Back\n" + ": ",
          "int"
        );
      if (lang == 3) continue;
      console.log();

      let worker;
      switch (work) {
        case 1:
          // Work 1: Add Labels
          worker = new LabelWorker(api, `${OWNER_NAME}/${REPO_NAME}`, lang);
          break;
        case 2:
          // Work 2: Add Templates
          worker = new TemplateWorker(api, OWNER_NAME, REPO_NAME, lang);
          break;
        default:
          // Quit
          break;
      }
      await worker.run();
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    console.log("\nBye");
    rl.close();
  }
}

main();
