import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import alloy from "eslint-config-alloy/base.js";
import alloyts from "eslint-config-alloy/typescript.js";
import importPlugin from "eslint-plugin-import";
import noAutoFix from "eslint-plugin-no-autofix";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

function main() {
  const setting = Object.values(SettingConfig).flat();
  const main = Object.values(MainConfig).flat();
  const linting = Object.values(LintingConfig)
    .flat()
    .map((config) => unfixable(config));
  return tseslint.config(...setting, ...main, ...linting);
}

function unfixable(config) {
  if (!config.rules) {
    return config;
  }
  const newRules = Object.fromEntries(
    Object.entries(config.rules).flatMap(([key, value]) => [
      [key, "off"],
      [`noAutoFix/` + key, value],
    ]),
  );
  return {
    ...config,
    plugins: {
      ...config.plugins,
      noAutoFix: noAutoFix,
    },
    rules: newRules,
  };
}

class SettingConfig {
  static ignore = [includeIgnoreFile(path.resolve(import.meta.dirname, ".gitignore"))];
}

class MainConfig {
  static js = [eslint.configs.recommended, { rules: alloy.rules }];
  static ts = [
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    { rules: alloyts.rules },
  ];

  static typecheckRulesSettings = [
    // Linting with Type Information https://typescript-eslint.io/getting-started/typed-linting/
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
        globals: {
          ...globals.node,
        },
      },
    },
    // type-checked rules for files outscoped of tsconfig
    // cause Error: `Parsing error: was not found by the project service`.
    // avoid the error with disabling typechecked rules for the files
    {
      files: ["**/*.{js,cjs,mjs,jsx}"],
      ...tseslint.configs.disableTypeChecked,
    },
  ];
  static removingTsRulesFromJs = {
    files: ["**/*.{js,cjs,mjs,jsx}"],
    rules: {
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  };
  static tuning = {
    rules: {
      "max-params": ["off", { max: 3 }],
      "@typescript-eslint/no-unused-vars": ["off"],
      "@typescript-eslint/member-ordering": ["off"],
      "@typescript-eslint/dot-notation": ["off"],
    },
  };

  static preferNodeProtocol = {
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: {
      unicorn,
    },
    rules: {
      "unicorn/prefer-node-protocol": "warn",
    },
  };
  static sortImport = {
    plugins: {
      importPlugin,
    },
    rules: {
      "importPlugin/consistent-type-specifier-style": ["warn", "prefer-top-level"],
      "importPlugin/first": ["warn"],
      "importPlugin/newline-after-import": ["warn", { considerComments: true }],
      "importPlugin/no-duplicates": ["warn"],
      "importPlugin/no-namespace": ["warn"],
      "importPlugin/order": [
        "warn",
        {
          "newlines-between": "always",
          named: true,
          alphabetize: {
            order: "asc",
            orderImportKind: "desc",
          },
          groups: ["builtin", "external", ["internal", "parent", "sibling"], "index", "object"],
        },
      ],
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          project: ["**/tsconfig.json"],
        },
      },
    },
  };
}

class LintingConfig {
  static unusedImports = {
    plugins: {
      unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": ["warn"],
    },
  };
}

export default main();
