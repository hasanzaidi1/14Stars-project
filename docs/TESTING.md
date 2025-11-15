# Testing Strategy

## Test Layers
1. **Unit Tests**
   - Target helpers (`src/utils/helpers.js`), controllers with mocked models, and middleware.
   - Use Jest or Mocha + Sinon; stub MySQL pool calls.
2. **Integration Tests**
   - Spin up Express app via `supertest`, pointing to a test database (or mysql2 mock).
   - Validate route-to-controller wiring, session behavior, and response contracts.
3. **End-to-End (E2E)**
   - Employ Playwright/Cypress to automate portal HTML flows (admin login, student registration, parent academic view).

## Running Tests
- Default `npm test` is a placeholder; integrate Jest:
  ```bash
  npm install --save-dev jest supertest
  npx jest
  ```
- Configure `NODE_ENV=test` with dedicated DB schema (`DB_NAME=14stars_test`).

## Suggested Structure
```
tests/
  unit/
    helpers.test.js
    authMiddleware.test.js
  integration/
    admin.routes.test.js
    parent.routes.test.js
  e2e/
    parentPortal.spec.ts
```

## Example Unit Test (Jest)
```js
// tests/unit/helpers.test.js
const { determineSchoolYear } = require('../../src/utils/helpers');

describe('determineSchoolYear', () => {
  it('returns current-next year for Aug dates', () => {
    const result = determineSchoolYear('2024-08-15');
    expect(result).toBe('2024-2025');
  });

  it('returns prev-current for Feb dates', () => {
    const result = determineSchoolYear('2025-02-01');
    expect(result).toBe('2024-2025');
  });
});
```

## Integration Test Skeleton
```js
const request = require('supertest');
const app = require('../../src/app');

describe('Admin API', () => {
  it('rejects unauthenticated student fetch', async () => {
    const res = await request(app).get('/admins/all');
    expect(res.status).toBe(401);
  });
});
```

## Recommendations
- Seed test database with fixtures using transactions (wrap each test in rollback).
- Mock session store for unit tests to avoid DB dependency.
- Use GitHub Actions or other CI to automatically run `npm test` on pull requests.
