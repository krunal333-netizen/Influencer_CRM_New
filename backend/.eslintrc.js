module.exports = {
  extends: ['@influencer-crm/eslint-config/backend'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/', 'prisma/'],
};
