/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          module: 'CommonJS',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Redirect src imports to dist/cjs for testing
    '^../src$': '<rootDir>/dist/cjs/index.js',
    '^../src/(.*)$': '<rootDir>/dist/cjs/$1',
  },
  collectCoverage: false,
};
