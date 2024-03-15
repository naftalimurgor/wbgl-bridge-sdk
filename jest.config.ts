/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  verbose: false,
  testEnvironment: 'node',
  cacheDirectory: '/tmp/jest_rs',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    'node_modules/',
    'src/__tests__/utils/',
    'src/external/'
  ],
  coverageProvider: 'v8',

  // Jest extended matchers: https://github.com/jest-community/jest-extended
  setupFilesAfterEnv: ['jest-extended/all', './setUpEnvVars'], roots: ['src/__tests__/'],
  testPathIgnorePatterns: [
    'node_modules/',
    'src/abi/',
    'src/external',
    'src/__test__/utils/',
    'src/chains.ts'
  ],

  moduleFileExtensions: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],

  testMatch: [
    '**/__tests__/**/*.[t]s?(x)',
    '**/?(*.)+(spec|test).[t]s?(x)'
  ],
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],
}

export default config
