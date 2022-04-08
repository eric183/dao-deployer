import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { mockServerWorker } from './__mocks__';

beforeAll(() => {
  mockServerWorker.listen();
});

afterEach(() => {
  mockServerWorker.resetHandlers();
});

afterAll(() => {
  mockServerWorker.close();
});

// "jest": {
//   "globals": {
//     "ts-jest": {
//       "tsConfig": "tsconfig.json"
//     }
//   },
//   "preset": "ts-jest",
//   "testMatch": [
//     "**/__tests__/**/*.ts?(x)",
//     "**/?(*.)+(spec|test).ts?(x)"
//   ],
//   "moduleNameMapper": {
//     "^.+\\.css$": "identity-obj-proxy",
//     "^(app/.+)$": "<rootDir>/src/$1/",
//     "^(components/.+)$": "<rootDir>/src/$1/",
//     "^(stores/.+)$": "<rootDir>/src/$1/",
//     "^(views/.+)$": "<rootDir>/src/$1/",
//     "^(assets/.+)$": "<rootDir>/src/$1/",
//     "^(models/.+)$": "<rootDir>/src/$1/",
//     "^~/(.*)$": "<rootDir>/src/$1"
//   }
// },
