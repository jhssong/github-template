import axios from "axios";
import labelsEn from "../templates/en/labels.js";
import labelsKo from "../templates/ko/labels.js";
import createError from "../utils/createError.js";

async function getExistingLabels(api, TARGET_REPO) {
  console.log(`Fetch existing labels from ${TARGET_REPO}`);
  try {
    const res = await api.get(`/repos/${TARGET_REPO}/labels`);
    return res.data;
  } catch (error) {
    throw createError("addLabels", "Failed to fetch existing labels", error);
  }
}

async function deleteExistingLabels(api, TARGET_REPO, existingLabels) {
  console.log(`Delete ${existingLabels.length} existing labels`);
  for (const label of existingLabels) {
    try {
      await api.delete(
        `https://api.github.com/repos/${TARGET_REPO}/labels/${encodeURIComponent(
          label.name
        )}`
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
}

async function addNewLabels(api, TARGET_REPO, newLabels) {
  console.log(`Add ${newLabels.length} new labels`);
  for (const label of newLabels) {
    const { name, color, description } = label;
    try {
      api.post(`https://api.github.com/repos/${TARGET_REPO}/labels`, {
        name,
        color,
        description,
      });
    } catch (error) {
      throw createError("addLabels", `Failed to add label: ${name}`, error);
    }
  }
}

async function addLabels(api, TARGET_REPO, lang) {
  // Setup labels by selected language
  let newLabels;
  switch (lang) {
    case 1:
      newLabels = labelsKo;
      break;
    case 2:
      newLabels = labelsEn;
      break;
    default:
      throw createError("addLabels", `Unknown language number: ${lang}`);
  }

  try {
    // Fetch all existing labels
    const existingLabels = await getExistingLabels(api, TARGET_REPO);

    // Delete all existing labels
    await deleteExistingLabels(api, TARGET_REPO, existingLabels);

    // Add new labels
    await addNewLabels(api, TARGET_REPO, newLabels);
  } catch (error) {
    throw createError("addLabels", error.message, error);
  }
}

export default addLabels;
