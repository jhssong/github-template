import labelsEn from "../templates/en/labels.js";
import labelsKo from "../templates/ko/labels.js";
import createError from "../utils/createError.js";

class LabelWorker {
  constructor(api, targetRepo, lang) {
    this.api = api;
    this.targetRepo = targetRepo;
    this.lang = lang;
    this.labels = this.selectLabelsByLanguage(lang);
  }

  selectLabelsByLanguage(lang) {
    switch (lang) {
      case 1:
        return labelsKo;
      case 2:
        return labelsEn;
      default:
        throw createError("LabelManager", `Unknown language number: ${lang}`);
    }
  }

  async getExistingLabels() {
    console.log(`Fetch existing labels from ${this.targetRepo}`);
    try {
      const res = await this.api.get(`/repos/${this.targetRepo}/labels`);
      return res.data;
    } catch (error) {
      throw createError(
        "LabelManager",
        "Failed to fetch existing labels",
        error
      );
    }
  }

  async deleteExistingLabels(existingLabels) {
    console.log(`Delete ${existingLabels.length} existing labels`);
    for (const label of existingLabels) {
      try {
        await this.api.delete(
          `/repos/${this.targetRepo}/labels/${encodeURIComponent(label.name)}`
        );
      } catch (error) {
        throw createError(
          "LabelManager",
          `Failed to delete label: ${label.name}`,
          error
        );
      }
    }
  }

  async addNewLabels() {
    console.log(`Add ${this.labels.length} new labels`);
    for (const label of this.labels) {
      const { name, color, description } = label;
      try {
        await this.api.post(`/repos/${this.targetRepo}/labels`, {
          name,
          color,
          description,
        });
      } catch (error) {
        throw createError(
          "LabelManager",
          `Failed to add label: ${name}`,
          error
        );
      }
    }
  }

  async run() {
    try {
      const existingLabels = await this.getExistingLabels();
      await this.deleteExistingLabels(existingLabels);
      await this.addNewLabels();
      console.log("✅ Add label work completed!");
    } catch (error) {
      throw createError("LabelManager", error.message, error);
    }
  }
}

export default LabelWorker;
