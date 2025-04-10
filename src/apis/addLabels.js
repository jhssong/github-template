import axios from "axios";
import labelsEn from "../templates/en/labels.js";
import labelsKo from "../templates/ko/labels.js";
import askQuestion from "../utils/askQuestion.js";
import createError from "../utils/createError.js";

async function addLabels(GITHUB_TOKEN, TARGET_REPO, lang) {
  // Setup labels by selected language
  let newlabels;
  switch (lang) {
    case 1:
      newlabels = labelsKo;
      break;
    case 2:
      newlabels = labelsEn;
      break;
    default:
      throw createError("addLabels", `Unknown language number: ${lang}`);
  }

  try {
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    console.log(`Fetching existing labels from ${TARGET_REPO}`);

    // Fetch all existing labels
    const { data: existingLabels } = await axios.get(
      `https://api.github.com/repos/${TARGET_REPO}/labels`,
      { headers }
    );

    console.log(`Deleting ${existingLabels.length} existing labels`);

    // Delete all existing labels
    for (const label of existingLabels) {
      try {
        await axios.delete(
          `https://api.github.com/repos/${TARGET_REPO}/labels/${encodeURIComponent(
            label.name
          )}`,
          { headers }
        );
        // Only for debugging
        // console.log(`Deleted label: ${label.name}`);
      } catch (error) {
        throw createError(
          "addLabels",
          `Failed to delete label: ${label.name}`,
          error
        );
      }
    }

    // Add new labels
    console.log("Adding new labels");

    for (const label of newlabels) {
      const { name, color, description } = label;
      try {
        await axios.post(
          `https://api.github.com/repos/${TARGET_REPO}/labels`,
          { name, color, description },
          { headers }
        );
        // Only for debugging
        // console.log(`Added label: ${name}`);
      } catch (error) {
        throw createError("addLabels", `Failed to add label: ${name}`, error);
      }
    }

    console.log("✅ Process completed!");
  } catch (error) {
    throw createError("addLabels", error.message, error);
  }
}

export default addLabels;
