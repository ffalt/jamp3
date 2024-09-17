import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
		eslint.configs.recommended,
		...tseslint.configs.recommended,
		// {
		// 	files: ["**/test/**/*.ts"],
		// 	rules: {
		// 		"@typescript-eslint/no-explicit-any": "off",
		// 		"@typescript-eslint/no-unused-vars": "off"
		// 	}
		// },
		{
			files: ["**/*.js"],
			languageOptions: {
				globals: {
					...globals.node
				}
			},
			rules: {
				"@typescript-eslint/no-require-imports": 0
			}
		},
		{
			files: ["**/*.ts"],
			rules: {
				"@typescript-eslint/no-explicit-any": 0,
				"@typescript-eslint/interface-name-prefix": 0,
				"@typescript-eslint/no-inferrable-types": 0,
				"@typescript-eslint/camelcase": 0,
				"@typescript-eslint/no-empty-interface": 0,
				"@typescript-eslint/no-namespace": 0,
				"no-prototype-builtins": 0,
				"@typescript-eslint/no-empty-object-type": 0,
				"@typescript-eslint/no-unused-vars": [
					"error",
					{
						// "args": "all",
						"argsIgnorePattern": "^_",
						// "caughtErrors": "all",
						"caughtErrorsIgnorePattern": "^_",
						// "destructuredArrayIgnorePattern": "^_",
						"varsIgnorePattern": "^_",
						// "ignoreRestSiblings": true
					}
				],
				"@typescript-eslint/no-var-requires": 2,
				"@typescript-eslint/ban-types": 0,
				"@typescript-eslint/no-non-null-assertion": 0,
				"@typescript-eslint/explicit-module-boundary-types": 0,
				"@typescript-eslint/explicit-function-return-type": 0
			}
		},
		{
			ignores: [
				"**/.github/",
				"**/node_modules/",
				"**/data/",
				"**/coverage/",
				"**/dist/",
				"**/docs/",
				"**/static/",
				"**/temp/",
				"**/local/"
			]
		}
);
