import axios from "axios";
import readline from "readline";
import labels from "./labels.js"; // Import labels from labels.js

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and return the user's input
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function addLabels() {
  try {
    // Prompt the user for the GitHub token
    const GITHUB_TOKEN = await askQuestion("Enter your GitHub token: ");
    // Prompt the user for the target repository
    const TARGET_REPO = await askQuestion(
      "Enter the target repository (e.g., user/repo): "
    );

    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    console.log(`Fetching existing labels from ${TARGET_REPO}...`);

    // Fetch all existing labels
    const { data: existingLabels } = await axios.get(
      `https://api.github.com/repos/${TARGET_REPO}/labels`,
      { headers }
    );

    console.log(`Deleting ${existingLabels.length} existing labels...`);
    // Delete all existing labels
    for (const label of existingLabels) {
      try {
        await axios.delete(
          `https://api.github.com/repos/${TARGET_REPO}/labels/${encodeURIComponent(
            label.name
          )}`,
          { headers }
        );
        console.log(`Deleted label: ${label.name}`);
      } catch (error) {
        console.error(`Failed to delete label: ${label.name}`);
        console.error(error.response?.data || error.message);
      }
    }

    console.log("Adding new labels...");
    // Add new labels from labels.js
    for (const label of labels) {
      const { name, color, description } = label;
      try {
        await axios.post(
          `https://api.github.com/repos/${TARGET_REPO}/labels`,
          { name, color, description },
          { headers }
        );
        console.log(`Added label: ${name}`);
      } catch (error) {
        console.error(`Failed to add label: ${name}`);
        console.error(error.response?.data || error.message);
      }
    }

    console.log("Label management process completed!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close(); // Close the readline interface
  }
}

addLabels();
