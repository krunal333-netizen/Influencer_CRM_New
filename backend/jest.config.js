/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};