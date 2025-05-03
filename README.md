# Template

This repository contains Github templates and labels metadata.

## Source Links

- [Feature Request Template](https://github.com/jhssong/template/blob/main/.github/ISSUE_TEMPLATE/feature_request.yml)

- [Bug Report Template](https://github.com/jhssong/template/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml)

- [Pull Request Template](https://github.com/jhssong/template/blob/main/.github/PULL_REQUEST_TEMPLATE.md)

- [Labels](https://github.com/jhssong/template/blob/main/labels.js)

## Automatically Add Labels

This repository includes a Node.js script to automatically add labels to a target repository.

To use it, first install `axios` and then run `node addLabel.js`. Follow the instructions in the terminal.

# 🛠️ GitHub Template Manager

A command-line utility that simplifies the setup of GitHub repositories by managing **issue labels**, **issue templates**, and **pull request templates** through the GitHub API.

---

## ✨ Features

- 🔖 Add or replace issue labels with localized presets (Korean & English)
- 📄 Upload modern YAML-based GitHub Issue Templates
- 🔃 Automatically create a new pull request to propose template changes
- 🌐 Multi-language support (Korean 🇰🇷 / English 🇺🇸)
- 🛡️ Secure GitHub token usage via input prompt

---

## 📦 Installation

```bash
git clone https://github.com/your-username/github-template-manager.git
cd github-template-manager
npm install
```

## 🧑‍💻 Usage

```bash
npm start
```

You will be guided through prompts:

1. 🔐 Enter GitHub Personal Access Token (with repo or public_repo scope)

2. 🧑‍💼 Enter repository owner and name

3. ⚙️ Choose a task:

   - [1] Add labels

   - [2] Add templates

   - [3] Quit

4. 🌍 Select a language:

   - [1] Korean

   - [2] English

   - [3] Back

## 🧱 Modules

### 🏷 `LabelWorker.js`

Handles complete replacement of all issue labels in the repository.

**Workflow:**

1. Fetch all existing labels.

2. Delete them one by one.

3. Upload new labels based on the selected language preset (labelsEn, labelsKo).

**Example Label Format:**

```js
{
    name: "✨ Feature",
    color: "a2eeef",
    description: "Features and improvements",
}
```

## 📂 TemplateWorker.js

Manages issue and pull request templates, and creates a pull request to introduce them.

**Features:**

- Adds:

  - config.yml (issue template configuration)

  - feature_request.yml

  - bug_report.yml

  - PULL_REQUEST_TEMPLATE.md

- Automatically:

  - Creates docs/add-template branch if not exists

  - Deletes old .md-style templates if present

  - Uploads YAML templates

  - Opens a pull request to the main branch (if not already open)

**Template File Paths:**

```bash
.github/
  └─ ISSUE_TEMPLATE/
        ├─ config.yml
        ├─ feature_request.yml
        └─ bug_report.yml
  └─ PULL_REQUEST_TEMPLATE.md
```

> 🔍 Templates are loaded from src/templates/en/ or src/templates/ko/ depending on language selection.

## 🔐 Token Scopes

To use this tool, create a GitHub personal access token with:

- repo (for private repositories)

- or public_repo (for public ones)

[Generate one here →](https://github.com/settings/tokens)

## 📄 License

This project is licensed under the [MIT License](/LICENSE.txt).
