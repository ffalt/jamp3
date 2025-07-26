import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import ts from "typescript-eslint";
import jest from "eslint-plugin-jest";
import unicorn from "eslint-plugin-unicorn";

export default ts.config(
	{
		files: ["**/*.ts"],
		extends: [
			js.configs.recommended,
			...ts.configs.recommended,
			...ts.configs.stylistic,
			unicorn.configs.recommended,
			stylistic.configs.recommended
		],
		rules: {
			"arrow-body-style": ["error", "as-needed"],
			"arrow-parens": ["error", "as-needed"],
			"brace-style": ["error", "1tbs"],
			"class-methods-use-this": "off",
			"comma-dangle": "error",
			"complexity": ["error", { max: 30 }],
			"max-classes-per-file": ["error", 2],
			"max-len": ["error", { code: 240 }],
			"max-lines": ["error", 1000],
			"no-duplicate-case": "error",
			"no-duplicate-imports": "error",
			"no-empty": "error",
			"no-extra-bind": "error",
			"no-invalid-this": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"no-new-func": "error",
			"no-param-reassign": "error",
			"no-sequences": "error",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-void": "error",
			"prefer-const": "error",
			"prefer-object-spread": "error",
			"prefer-template": "error",
			"space-in-parens": ["error", "never"],
			"yoda": "error",

			"unicorn/prevent-abbreviations": "off",
			"unicorn/no-useless-promise-resolve-reject": "off",
			"unicorn/empty-brace-spaces": "off",
			"unicorn/filename-case": "off",
			"unicorn/no-null": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/throw-new-error": "off",
			"unicorn/no-process-exit": "off",
			"unicorn/no-useless-undefined": "off",
			"unicorn/prefer-top-level-await": "off",

			"@stylistic/semi": ["error", "always"],
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/no-tabs": ["error", { "allowIndentationTabs": true }],
			"@stylistic/member-delimiter-style": ["error", {
				"multiline": {
					"delimiter": "semi",
					"requireLast": true
				},
				"singleline": {
					"delimiter": "semi",
					"requireLast": false
				},
				"multilineDetection": "brackets"
			}],
			"@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
			"@stylistic/operator-linebreak": ["error", "after"],
			"@stylistic/type-annotation-spacing": "error",
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/quotes": ["error", "single"],
			"@stylistic/quote-props": ["error", "consistent"],

			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/array-type": ["error", { default: "generic" }],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					// "args": "all",
					argsIgnorePattern: "^_",
					// "caughtErrors": "all",
					caughtErrorsIgnorePattern: "^_",
					// "destructuredArrayIgnorePattern": "^_",
					varsIgnorePattern: "^_"
					// "ignoreRestSiblings": true
				}
			]
		},
		ignores: ["src/test/**.ts"]
	},
	{
		files: ["**/*.{js,cjs,mjs}"],
		extends: [
			js.configs.recommended,
			...ts.configs.recommended,
			...ts.configs.stylistic,
			unicorn.configs.recommended,
			stylistic.configs.recommended
		],
		rules: {
			"arrow-body-style": ["error", "as-needed"],
			"arrow-parens": ["error", "as-needed"],
			"brace-style": ["error", "1tbs"],
			"class-methods-use-this": "off",
			"comma-dangle": "error",
			"complexity": ["error", { max: 30 }],
			"max-classes-per-file": ["error", 2],
			"max-len": ["error", { code: 240 }],
			"max-lines": ["error", 1000],
			"no-duplicate-case": "error",
			"no-duplicate-imports": "error",
			"no-empty": "error",
			"no-extra-bind": "error",
			"no-invalid-this": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"no-new-func": "error",
			"no-param-reassign": "error",
			"no-sequences": "error",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-void": "error",
			"prefer-const": "error",
			"prefer-object-spread": "error",
			"prefer-template": "error",
			"space-in-parens": ["error", "never"],
			"yoda": "error",

			"unicorn/prevent-abbreviations": "off",
			"unicorn/no-useless-promise-resolve-reject": "off",
			"unicorn/empty-brace-spaces": "off",
			"unicorn/filename-case": "off",
			"unicorn/no-null": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/throw-new-error": "off",
			"unicorn/no-process-exit": "off",
			"unicorn/no-useless-undefined": "off",
			"unicorn/prefer-top-level-await": "off",

			"@stylistic/semi": ["error", "always"],
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/no-tabs": ["error", { "allowIndentationTabs": true }],
			"@stylistic/member-delimiter-style": ["error", {
				"multiline": {
					"delimiter": "semi",
					"requireLast": true
				},
				"singleline": {
					"delimiter": "semi",
					"requireLast": false
				},
				"multilineDetection": "brackets"
			}],
			"@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
			"@stylistic/operator-linebreak": ["error", "after"],
			"@stylistic/type-annotation-spacing": "error",
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/quote-props": ["error", "consistent"],

			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/array-type": ["error", { default: "generic" }],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					// "args": "all",
					argsIgnorePattern: "^_",
					// "caughtErrors": "all",
					caughtErrorsIgnorePattern: "^_",
					// "destructuredArrayIgnorePattern": "^_",
					varsIgnorePattern: "^_"
					// "ignoreRestSiblings": true
				}
			]
		},
		ignores: ["src/test/**.ts"]
	},
	{
		files: ["test/**"],
		languageOptions: {
			globals: jest.environments.globals.globals
		},
		extends: [
			js.configs.recommended,
			...ts.configs.recommended,
			...ts.configs.stylistic,
			unicorn.configs.recommended,
			stylistic.configs.recommended
		],
		plugins: {
			jest
		},
		rules: {
			"arrow-body-style": ["error", "as-needed"],
			"arrow-parens": ["error", "as-needed"],
			"brace-style": ["error", "1tbs"],
			"class-methods-use-this": "off",
			"comma-dangle": "error",
			"complexity": "off",
			"max-classes-per-file": ["error", 2],
			"max-len": ["error", { code: 240 }],
			"max-lines": ["error", 1000],
			"no-duplicate-case": "error",
			"no-duplicate-imports": "error",
			"no-empty": "error",
			"no-extra-bind": "error",
			"no-invalid-this": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"no-new-func": "error",
			"no-param-reassign": "error",
			"no-sequences": "error",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-void": "error",
			"prefer-const": "error",
			"prefer-object-spread": "error",
			"prefer-template": "error",
			"space-in-parens": ["error", "never"],
			"yoda": "error",

			"jest/prefer-each": "error",
			"jest/expect-expect": "off",
			"jest/no-done-callback": "off",

			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-explicit-any": "off",

			"@stylistic/semi": ["error", "always"],
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/no-tabs": ["error", { "allowIndentationTabs": true }],
			"@stylistic/member-delimiter-style": ["error", {
				"multiline": {
					"delimiter": "semi",
					"requireLast": true
				},
				"singleline": {
					"delimiter": "semi",
					"requireLast": false
				},
				"multilineDetection": "brackets"
			}],
			"@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
			"@stylistic/operator-linebreak": ["error", "after"],
			"@stylistic/type-annotation-spacing": "error",
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/quotes": ["error", "single"],
			"@stylistic/quote-props": ["error", "consistent"],

			"unicorn/no-array-reduce": "off",
			"unicorn/empty-brace-spaces": "off",
			"unicorn/prevent-abbreviations": "off",
			"unicorn/no-useless-promise-resolve-reject": "off",
			"unicorn/no-await-expression-member": "off",
			"unicorn/consistent-function-scoping": "off",
			"unicorn/prefer-string-raw": "off",
			"unicorn/no-null": "off"
		}
	},
	{
		ignores: [
			"**/coverage/",
			"**/bin/",
			"**/data/",
			"**/deploy/",
			"**/docs/",
			"**/dist/",
			"**/local/",
			"**/static/"
		]
	}
);
