export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['algorithms.js', '!node_modules/**'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
};
