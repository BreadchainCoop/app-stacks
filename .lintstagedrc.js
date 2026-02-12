// .lintstagedrc.js   (rename back from .mjs if needed, but .js is fine)

import { relative } from "path";
import { cwd } from "process";

const buildEslintCommand = (filenames) =>
  filenames.length > 0
    ? `next lint --fix --file ${filenames
        .map((f) => relative(cwd(), f))
        .join(" --file ")}`
    : "echo No files to lint";

export default {
  "*.{js,jsx,ts,tsx}": [
    "prettier --write --ignore-unknown",
    buildEslintCommand,
  ],
  "*.{json,md,css,scss,yaml,yml}": "prettier --write --ignore-unknown",
};
