export default {
	preset: "ts-jest",
	testEnvironment: "node",
	coverageDirectory: "coverage",
	modulePathIgnorePatterns: ["<rootDir>/local/", "<rootDir>/examples", "<rootDir>/dist", "<rootDir>/docs", "<rootDir>/bin"],
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(test).[jt]s?(x)"]
};
