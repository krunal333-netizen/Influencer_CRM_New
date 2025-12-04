# @influencer-crm/eslint-config

Shared ESLint configuration for the Influencer CRM monorepo.

## Usage

This package provides three ESLint configurations:

### Base Configuration

Core TypeScript ESLint rules that all projects extend:

```js
module.exports = {
  extends: ['@influencer-crm/eslint-config/base'],
};
```

### Backend Configuration

For Node.js/NestJS backend projects:

```js
module.exports = {
  extends: ['@influencer-crm/eslint-config/backend'],
};
```

### Frontend Configuration

For React/Vite frontend projects:

```js
module.exports = {
  extends: ['@influencer-crm/eslint-config/frontend'],
};
```

## Features

- TypeScript support with `@typescript-eslint`
- React and React Hooks linting for frontend
- Consistent code style across the workspace
- Warnings for `any` types and unused variables
- Environment-specific configurations

## Dependencies

This package includes all necessary ESLint plugins and parsers, so you don't need to install them separately in your projects.
