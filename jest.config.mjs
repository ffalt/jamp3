export default {
	testEnvironment: "node",
	coverageDirectory: "coverage",
	modulePathIgnorePatterns: ["<rootDir>/local/", "<rootDir>/examples", "<rootDir>/dist", "<rootDir>/docs", "<rootDir>/bin"],
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(test).[jt]s?(x)"],
	moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
	transform: {
		"^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }]
	}
};
