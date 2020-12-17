module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
	],
	parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
	plugins: ["@typescript-eslint"],
	parserOptions: {
		ecmaVersion: 2020,  // Allows for the parsing of modern ECMAScript features
		sourceType: 'module',  // Allows for the use of imports
		project: "./tsconfig.eslint.json",
		tsconfigRootDir: __dirname,
	},
	env: {
		node: true
	},
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".ts"]
			}
		}
	},
	rules: {
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/member-delimiter-style": 0,
		"@typescript-eslint/no-explicit-any": 0,
		"@typescript-eslint/no-unused-vars": 0,
		"@typescript-eslint/interface-name-prefix": 0,
		"@typescript-eslint/no-inferrable-types": 0,
		"@typescript-eslint/camelcase": 0,
		"@typescript-eslint/no-empty-interface": 0,
		"@typescript-eslint/no-namespace": 0,
		"no-prototype-builtins": 0
	},
	"overrides": [
		{
			// enable the rule specifically for TypeScript files
			"files": ["*.ts"],
			"rules": {
				"@typescript-eslint/no-unused-vars": ["error", {"args": "none"}],
				"@typescript-eslint/no-var-requires": 2,
				"@typescript-eslint/ban-types": 0,
				"@typescript-eslint/no-non-null-assertion": 0,
				"@typescript-eslint/explicit-module-boundary-types": 0,
				"@typescript-eslint/explicit-function-return-type": 0,
				"@typescript-eslint/member-delimiter-style": [
					"error",
					{
						"multiline": {
							"delimiter": "semi",
							"requireLast": true
						},
						"singleline": {
							"delimiter": "semi",
							"requireLast": false
						}
					}
				]
			}
		}
	]
};
