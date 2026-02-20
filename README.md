# GitHub Template Manager

A command-line utility that simplifies the setup of GitHub repositories by managing **labels**, **issue templates**, and **pull request templates** through the GitHub API.

---

## Features

- Add or replace issue labels with localized presets (Korean & English)
- Upload modern YAML-based GitHub Issue Templates
- Automatically create a new pull request to propose template changes
- Multi-language support (Korean / English)
- Secure GitHub token usage via input prompt

---

## Installation

```bash
git clone https://github.com/jhssong/github-template.git
cd github-template
npm install
```

## Usage

```bash
npm start
```

You will be guided through prompts:

1. Enter GitHub Personal Access Token (with repo or public_repo scope)

2. Enter repository owner and name

3. Choose a task:
   - [1] Add labels

   - [2] Add templates

   - [3] Quit

4. Select a language:
   - [1] Korean

   - [2] English

   - [3] Back

## Modules

### LabelWorker

Handles complete replacement of all labels in the repository.

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

## TemplateWorker.js

Manages issue and pull request templates, and creates a pull request to introduce them.
Templates are loaded from src/templates/en/ or src/templates/ko/ depending on language selection.

**Workflows:**

1. Creates docs/add-template branch if not exists

2. Deletes old .md-style templates if present

3. Uploads YAML templates

4. Opens a pull request to the main branch (if not already open)

**Example:** [Pull Request Template](/src/templates/en/.github/PULL_REQUEST_TEMPLATE.md)

## Token Scopes

To use this tool, create a GitHub personal access token with:

- repo (for private repositories)

- or public_repo (for public ones)

[Generate one here →](https://github.com/settings/tokens)

## License

This project is licensed under the [MIT License](/LICENSE.txt).
