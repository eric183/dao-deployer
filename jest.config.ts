export default {
  verbose: true,
  preset: 'ts-jest',

  roots: ['<rootDir>'],
  rootDir: '.',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  testEnvironment: 'jsdom',
  // projects: ['<rootDir>/packages/client'],

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/packages/client/tsconfig.json',
    },
  },
  testMatch: [
    '<rootDir>/packages/client/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/packages/client/**/*.(spec|test).ts?(x)',
    // '<rootDir>/packages/d42paas-official/**/*.(spec|test).ts?(x)',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    // '\\.m?jsx?$': [
    //   'babel-jest',
    //   {
    //     plugins: ['@babel/plugin-transform-modules-commonjs'],
    //   },
    // ],
    '^.+\\.js?$': 'babel-jest',

    // '^.+\\.ts?$': 'ts-jest',
    // '^.+\\.(t|j)s$': 'ts-jest',
    // '^.+\\.ts?$': 'ts-jest',
    // '\\.[jt]sx?$': 'ts-jest',
    // '\\.tsx?$': 'ts-jest',
    // 'node_modules/monaco-editor/.+\\.(j|t)sx?$': 'ts-jest',
  },
  modulePaths: ['node_modules'],
  moduleDirectories: ['node_modules', 'packages/client/src'],
  transformIgnorePatterns: [
    'dist/',
    // 'node_modules/(?!(monaco-editor)/)',
    // 'node_modules/(?!(ninja-keys)/)',
  ],
  moduleNameMapper: {
    '^.+\\.css$': 'identity-obj-proxy',

    '^~/(.*)$': '<rootDir>/packages/client/src/$1',
    // '^ninja-keys$': '<rootDir>/node_modules/ninja-keys',
    // '^monaco-editor$':
    //   '<rootDir>/node_modules/monaco-editor/esm/vs/editor/editor.api.js',
  },
};
