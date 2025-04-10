import axios from "axios";
import addLabels from "./apis/addLabels.js";
import askQuestion from "./utils/askQuestion.js";
import readline from "readline";

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
    const TARGET_REPO = await askQuestion(
      rl,
      "Enter the target repository (e.g., user/repo): "
    );

    const api = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    let work = 0;
    while (work != 9) {
      console.log();
      console.log("===================");
      console.log("     Work List");
      console.log("===================");
      work = await askQuestion(
        rl,
        "Select the work\n" +
          "[1] Add labels, [2] Add Issue template, [3] Add Bug template, [4] Add PR Template, [9] Quit\n" +
          ": ",
        "int"
      );

      if (work == 9) break;

      if (work != 1 && work != 2 && work != 3 && work != 4) {
        console.log("Unknown work number please select again");
        continue;
      }

      let lang = 0;
      while (lang != 1 && lang != 2)
        lang = await askQuestion(
          rl,
          "Select the language\n" + "[1] Ko, [2] En\n" + ": ",
          "int"
        );

      switch (work) {
        case 1:
          // Work 1: Add Labels
          await addLabels(api, TARGET_REPO, lang);
          break;
        case 2:
          // Work 2: Add Issue template
          break;
        case 3:
          // Work 2: Add Bug template
          break;
        case 4:
          // Work 2: Add PR template
          break;
        default:
          // Quit
          break;
      }

      console.log("✅ Work completed!");
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    console.log("Bye!");
    rl.close();
  }
}

main();
