import axios from "axios";
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import LabelWorker from "./apis/LabelWorker.js";
import TemplateWorker from "./apis/TemplateWorker.js";

function printBanner() {
  const banner = figlet.textSync("GitHub Template", {
    horizontalLayout: "default",
    verticalLayout: "default",
  });
  console.clear();
  console.log(chalk.green(banner));
}

async function main() {
  printBanner();

  try {
    const answers = await inquirer.prompt([
      {
        type: "password",
        name: "token",
        message: "Enter your GitHub token:",
        mask: "*",
        validate: (input) => (input ? true : "GitHub token is required."),
      },
      {
        type: "input",
        name: "owner",
        message: "Enter the owner name:",
        validate: (input) => (input ? true : "Owner name is required."),
      },
      {
        type: "input",
        name: "repo",
        message: "Enter the repository name:",
        validate: (input) => (input ? true : "Repository name is required."),
      },
    ]);

    const api = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `token ${answers.token}`,
        Accept: "application/vnd.github+json",
      },
    });

    while (true) {
      const { work } = await inquirer.prompt([
        {
          type: "select",
          name: "work",
          message: "Select the work:",
          choices: [
            { name: "Add labels", value: 1 },
            { name: "Add template", value: 2 },
            { name: "Quit", value: 3 },
          ],
        },
      ]);

      if (work === 3) break;

      const { lang } = await inquirer.prompt([
        {
          type: "select",
          name: "lang",
          message: "Select the language:",
          choices: [
            { name: "Korean", value: 1 },
            { name: "English", value: 2 },
            { name: "Back", value: 3 },
          ],
        },
      ]);

      if (lang === 3) continue;

      let worker;

      switch (work) {
        case 1:
          worker = new LabelWorker(
            api,
            `${answers.owner}/${answers.repo}`,
            lang,
          );
          break;
        case 2:
          worker = new TemplateWorker(api, answers.owner, answers.repo, lang);
          break;
      }

      console.log("\nProcessing...\n");

      try {
        await worker.run();
        console.log("✅ Done successfully.\n");
      } catch (err) {
        console.error(err.message);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error.message);
  }

  console.log("\nBye 👋");
}

main();
