import ora from "ora";
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
        throw createError("LabelWorker", `Unknown language number: ${lang}`);
    }
  }

  async getExistingLabels() {
    try {
      const res = await this.api.get(`/repos/${this.targetRepo}/labels`);
      return res.data;
    } catch (error) {
      throw createError(
        "LabelWorker",
        "Failed to fetch existing labels",
        error,
      );
    }
  }

  async deleteExistingLabels(existingLabels, spinner) {
    if (existingLabels.length === 0) {
      spinner.info("No existing labels to delete.");
      return;
    }

    spinner.start("Deleting existing labels...");

    for (const label of existingLabels) {
      try {
        await this.api.delete(
          `/repos/${this.targetRepo}/labels/${encodeURIComponent(label.name)}`,
        );
      } catch (error) {
        spinner.fail(`Failed to delete label: ${label.name}`);
        throw createError(
          "LabelWorker",
          `Failed to delete label: ${label.name}`,
          error,
        );
      }
    }

    spinner.succeed(`Deleted ${existingLabels.length} existing labels.`);
  }

  async addNewLabels(spinner) {
    spinner.start("Adding new labels...");

    for (const label of this.labels) {
      const { name, color, description } = label;

      try {
        await this.api.post(`/repos/${this.targetRepo}/labels`, {
          name,
          color,
          description,
        });
      } catch (error) {
        spinner.fail(`Failed to add label: ${name}`);
        throw createError("LabelWorker", `Failed to add label: ${name}`, error);
      }
    }

    spinner.succeed(`Added ${this.labels.length} new labels.`);
  }

  async run() {
    const spinner = ora();

    try {
      spinner.start("Fetching existing labels...");

      const existingLabels = await this.getExistingLabels();
      spinner.succeed(`Fetched ${existingLabels.length} existing labels.`);

      await this.deleteExistingLabels(existingLabels, spinner);
      await this.addNewLabels(spinner);

      spinner.succeed("Label update completed successfully.");
    } catch (error) {
      spinner.fail("Label update failed.");
      throw createError("LabelWorker", error.message, error);
    }
  }
}

export default LabelWorker;
