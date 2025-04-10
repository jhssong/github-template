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

    let work = 0;
    while (work != 2) {
      console.log();
      console.log("===================");
      console.log("     Work List");
      console.log("===================");
      work = await askQuestion(
        rl,
        "Enter the work number\n" + "[1] Add labels, [2] Quit\n" + ": ",
        "int"
      );

      switch (work) {
        case 1:
          // Work 1: Add Labels
          let lang = 0;
          while (lang != 1 && lang != 2)
            lang = await askQuestion(
              rl,
              "Enter the language number\n" + "[1] Ko, [2] En\n" + ": ",
              "int"
            );
          await addLabels(GITHUB_TOKEN, TARGET_REPO, lang);
          break;
        case 2:
          // Work 2: Quit
          break;
        default:
          console.log("Unknown work number please select again");
          break;
      }
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    console.log("Bye!");
    rl.close();
  }
}

main();
