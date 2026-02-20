import fs from "fs";
import path from "path";
import createError from "../utils/createError.js";

const MAIN_BRANCH = "main";
const PR_BRANCH = "docs/0-update-template";
const PR_TITLE = "docs: Update GitHub templates";
const COMMIT_MSG = "docs: Update GitHub templates";

const CONFIG_YML_FILE_PATH = ".github/ISSUE_TEMPLATE/config.yml";
const FEATURE_MD_FILE_PATH = ".github/ISSUE_TEMPLATE/feature_request.md";
const FEATURE_YML_FILE_PATH = ".github/ISSUE_TEMPLATE/feature_request.yml";
const BUG_MD_FILE_PATH = ".github/ISSUE_TEMPLATE/bug_report.md";
const BUG_YML_FILE_PATH = ".github/ISSUE_TEMPLATE/bug_report.yml";
const REFACTORING_MD_FILE_PATH = ".github/ISSUE_TEMPLATE/refactoring.md";
const REFACTORING_YML_FILE_PATH = ".github/ISSUE_TEMPLATE/refactoring.yml";
const PULL_REQUEST_FILE_PATH = ".github/PULL_REQUEST_TEMPLATE.md";

class TemplateWorker {
  constructor(api, owner, repo, lang) {
    this.api = api;
    this.owner = owner;
    this.repo = repo;
    this.lang = lang;
  }

  async getBranchRef(branch) {
    const res = await this.api.get(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${branch}`,
    );
    return res.data;
  }

  async createBranch(newBranch, baseSha) {
    await this.api.post(`/repos/${this.owner}/${this.repo}/git/refs`, {
      ref: `refs/heads/${newBranch}`,
      sha: baseSha,
    });
  }

  async getCommit(commitSha) {
    const res = await this.api.get(
      `/repos/${this.owner}/${this.repo}/git/commits/${commitSha}`,
    );
    return res.data;
  }

  async createBlob(content) {
    const res = await this.api.post(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      {
        content,
        encoding: "utf-8",
      },
    );
    return res.data.sha;
  }

  async createTree(baseTreeSha, treeItems) {
    const res = await this.api.post(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeItems,
      },
    );
    return res.data.sha;
  }

  async createCommit(message, treeSha, parentSha) {
    const res = await this.api.post(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message,
        tree: treeSha,
        parents: [parentSha],
      },
    );
    return res.data.sha;
  }

  async updateRef(branch, newSha) {
    await this.api.patch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${branch}`,
      { sha: newSha },
    );
  }

  async fileExists(filePath, branch) {
    try {
      await this.api.get(
        `/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${branch}`,
      );
      return true;
    } catch (error) {
      if (error.response?.status === 404) return false;
      throw error;
    }
  }

  getTemplateFilesByLang(langCode) {
    const basePath = langCode === 1 ? "src/templates/ko" : "src/templates/en";
    return {
      config: {
        filePath: CONFIG_YML_FILE_PATH,
        localPath: `${basePath}/${CONFIG_YML_FILE_PATH}`,
      },
      feature: {
        filePath: FEATURE_YML_FILE_PATH,
        localPath: `${basePath}/${FEATURE_YML_FILE_PATH}`,
      },
      bug: {
        filePath: BUG_YML_FILE_PATH,
        localPath: `${basePath}/${BUG_YML_FILE_PATH}`,
      },
      refactor: {
        filePath: REFACTORING_YML_FILE_PATH,
        localPath: `${basePath}/${REFACTORING_YML_FILE_PATH}`,
      },
      pr: {
        filePath: PULL_REQUEST_FILE_PATH,
        localPath: `${basePath}/${PULL_REQUEST_FILE_PATH}`,
      },
    };
  }

  getDeleteTargets() {
    return [FEATURE_MD_FILE_PATH, BUG_MD_FILE_PATH, REFACTORING_MD_FILE_PATH];
  }

  getPRBodyByLang() {
    const basePath = this.lang === 1 ? "src/templates/ko" : "src/templates/en";

    const filePath = path.resolve(`${basePath}/pr-body.md`);

    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      throw createError(
        "TemplateWorker",
        `Failed to read PR body file: ${filePath}`,
        error,
      );
    }
  }

  async run() {
    try {
      const templates = this.getTemplateFilesByLang(this.lang);

      // Ensure branch exists
      let branchRef;
      try {
        branchRef = await this.getBranchRef(PR_BRANCH);
      } catch {
        const mainRef = await this.getBranchRef(MAIN_BRANCH);
        await this.createBranch(PR_BRANCH, mainRef.object.sha);
        branchRef = await this.getBranchRef(PR_BRANCH);
      }

      const latestCommitSha = branchRef.object.sha;
      const commitData = await this.getCommit(latestCommitSha);
      const baseTreeSha = commitData.tree.sha;

      const treeItems = [];

      // Delete existing GitHub Templates
      for (const filePath of this.getDeleteTargets()) {
        const exists = await this.fileExists(filePath, PR_BRANCH);

        if (exists) {
          treeItems.push({
            path: filePath,
            sha: null,
          });
        }
      }

      // Update GitHub Templates
      for (const key of Object.keys(templates)) {
        const { filePath, localPath } = templates[key];
        const content = fs.readFileSync(path.resolve(localPath), "utf8");
        const blobSha = await this.createBlob(content);

        treeItems.push({
          path: filePath,
          mode: "100644",
          type: "blob",
          sha: blobSha,
        });
      }

      const newTreeSha = await this.createTree(baseTreeSha, treeItems);

      const newCommitSha = await this.createCommit(
        COMMIT_MSG,
        newTreeSha,
        latestCommitSha,
      );

      await this.updateRef(PR_BRANCH, newCommitSha);

      console.log("✅ All templates committed.");

      const res = await this.api.get(
        `/repos/${this.owner}/${this.repo}/pulls?head=${this.owner}:${PR_BRANCH}&state=open`,
      );

      if (res.data.length === 0) {
        await this.api.post(`/repos/${this.owner}/${this.repo}/pulls`, {
          title: PR_TITLE,
          head: PR_BRANCH,
          base: MAIN_BRANCH,
          body: this.getPRBodyByLang(),
        });
        console.log("✅ Pull request created.");
      }
    } catch (error) {
      throw createError("TemplateWorker", error.message, error);
    }
  }
}

export default TemplateWorker;
