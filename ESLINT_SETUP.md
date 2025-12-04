# ESLint Configuration

This document describes the ESLint setup for the Influencer CRM monorepo.

## Structure

The workspace uses a shared ESLint configuration package that is consumed by both backend and frontend projects:

```
.
├── packages/
│   └── eslint-config/          # Shared ESLint configurations
│       ├── base.js             # Base TypeScript rules
│       ├── backend.js          # Backend (NestJS) specific rules
│       ├── frontend.js         # Frontend (React) specific rules
│       ├── index.js            # Package entry point
│       └── package.json        # Package dependencies
├── backend/
│   ├── .eslintrc.js            # Backend ESLint config
│   └── .eslintignore           # Backend exclusions
├── frontend/
│   ├── .eslintrc.cjs           # Frontend ESLint config (CommonJS in ESM package)
│   └── .eslintignore           # Frontend exclusions
└── .eslintignore               # Root exclusions
```

## Running Linting

### Lint All Workspaces
```bash
pnpm lint
```

### Lint Individual Workspaces
```bash
pnpm backend lint
pnpm frontend lint
```

### Auto-fix Issues
```bash
pnpm backend lint:fix
pnpm frontend lint:fix
```

## Configuration Details

### Base Configuration (`packages/eslint-config/base.js`)
- TypeScript support via `@typescript-eslint`
- Extends `eslint:recommended` and `plugin:@typescript-eslint/recommended`
- Warnings for `any` types (not errors, to allow gradual typing)
- Unused variables must be prefixed with `_` to indicate intentional non-use
- Console statements generate warnings (use `// eslint-disable-next-line no-console` if needed)

### Backend Configuration (`packages/eslint-config/backend.js`)
- Extends base configuration
- Node.js and Jest environment enabled
- Allows `require()` statements (CommonJS)
- Source type: `script` (CommonJS)

### Frontend Configuration (`packages/eslint-config/frontend.js`)
- Extends base configuration
- React and React Hooks support
- Browser environment enabled
- JSX support enabled
- React version detection automatic
- React 18+ rules (no need for React import in JSX)
- PropTypes disabled (using TypeScript)

## Key Rules

### TypeScript
- `@typescript-eslint/no-explicit-any`: **warn** - Use proper types when possible
- `@typescript-eslint/no-unused-vars`: **warn** - Prefix with `_` if intentionally unused
- `@typescript-eslint/explicit-function-return-type`: **off** - Type inference is OK
- `@typescript-eslint/explicit-module-boundary-types`: **off** - Type inference is OK

### General
- `no-console`: **warn** - Use `console.error` and `console.warn`, or disable per line
- Max warnings: **0** - All warnings must be fixed before merge

### React (Frontend Only)
- `react/react-in-jsx-scope`: **off** - Not needed in React 18+
- `react/prop-types`: **off** - Using TypeScript instead

## Common Patterns

### Intentionally Unused Variables
```typescript
// ✗ Bad - ESLint warning
const { password, ...rest } = user;

// ✓ Good - Prefix with underscore
const { password: _password, ...rest } = user;
```

### Console Statements
```typescript
// ✗ Bad - ESLint warning
console.log('Debug info');

// ✓ Good - Use allowed methods or disable
console.error('Error message');  // Allowed
console.warn('Warning message'); // Allowed

// Or disable for specific line
// eslint-disable-next-line no-console
console.log('Bootstrap message');
```

### Avoiding `any` Types
```typescript
// ✗ Bad - ESLint warning
const MyComponent = ({ data }: any) => { ... };

// ✓ Good - Use proper types
const MyComponent = ({ data }: { data: MyDataType }) => { ... };

// ✓ Good - Infer from array
const items = useItems();
const ItemCard = ({ item }: { item: typeof items[number] }) => { ... };

// ✓ Good - Use const assertion
const payload = { status: 'ACTIVE' as const };
```

## CI/CD Integration

The `pnpm lint` command is designed to be run in CI/CD pipelines:
- Exit code 0: All linting passed
- Exit code 1: Linting errors or warnings found (strict mode with `--max-warnings 0`)

Add to your CI/CD workflow:
```yaml
- name: Lint
  run: pnpm lint
```

## Troubleshooting

### TypeScript Version Warning
If you see warnings about TypeScript version compatibility, this is informational only and doesn't affect functionality. The warning appears when using TypeScript versions newer than officially supported by the ESLint plugins.

### Module System Issues
- Backend uses CommonJS (`.eslintrc.js` works)
- Frontend uses ES modules (`.eslintrc.cjs` required for config file)

### Ignoring Files
Add patterns to `.eslintignore` files:
- Root: Global exclusions (node_modules, dist, etc.)
- Backend: Backend-specific exclusions (prisma/, dist/)
- Frontend: Frontend-specific exclusions (dist/, build/, config files)

## Extending Configuration

To add new rules or modify existing ones, edit the appropriate configuration file in `packages/eslint-config/`:
- Shared rules → `base.js`
- Backend-only rules → `backend.js`
- Frontend-only rules → `frontend.js`

After making changes, re-run `pnpm install` to ensure all workspaces pick up the changes.
