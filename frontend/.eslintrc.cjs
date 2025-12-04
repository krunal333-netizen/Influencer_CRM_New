module.exports = {
  extends: ['@influencer-crm/eslint-config/frontend'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/', 'vite.config.ts'],
};
