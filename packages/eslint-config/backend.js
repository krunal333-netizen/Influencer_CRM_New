module.exports = {
  extends: ['./base.js'],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script',
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
  },
};
