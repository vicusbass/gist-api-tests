# gist-api-tests

Playing around with Github Gist API

## Setup

Install dependencies

```bash
npm install
```

Add mandatory env variables to a .env file in the root of the project (this file is ignore by `git`)

```bash
GITHUB_TOKEN=<your token>
USER_AGENT=<some value, e.g. your username>
GITHUB_USERNAME=<your username>
```

Run tests:

```bash
npm test
```

## Test Strategy

The project stack is based on:

- `Typescript` as programming language
- `SuperTest` as REST API client library
- `jest` as test runner
- `ajv` for JSON schema validations
- `eslint` for code consistency
- `prettier` for code formatting

It's a lighweight test framework, alternatives based on Typescript/Javascript would be Cypress, Playwright, Frisby. Most frameworks would bring extra functionality, but also plenty features useless for API testing.
My approach was to build an API client module to abstract actions (e.g. create gist, get gist, get list of gists, update gist, delete gist). This approach offers several advantages:

- easier versioning (e.g. we could link API client to a specific API version)
- simpler maintenance (e.g. if one new mandatory field is needed to create a gist, we only need to update it in the API client, not in all the tests)
- increased readability

There are 3 tests modules in this project:

- `headers.test.ts` - negative tests for mandatory headers
- `privateGists.test.ts` - tests for private gists CRUD
- `publicGists.test.ts` - tests for public gists

In some cases, test data creation could be done without REST API calls, where possible. We can create test fixtures to create tests data in DB before tests and deleting it after test(s). This would allow tests to focus on REST calls. In this particular case, test data (for private gists) is created in `beforeEach` with REST call and removed in `afterEach`, making sure each test can run in isolation.

GitHub also offers an SDK for its REST API. I decided this might be out of scope for this testing project, but any SDK should also have an extended test suite which would test user journeys/scenarios.

Most tests are straightforward, I included also JSON schema validation for creating gists, some edge cases (e.g. list public gists from the future, use negative or zero values for pagination, etc). There are some scenarios which are harder to control in a public system like GitHub, one good example is their throtthling of API requests. In a controlable system we could configure throttling with low values for a specific test run.
Also, because we cannot control GitHub defaults, some tests are slow (especially those related to public gists), in at least on case the test will retrieve 100 gists. When applicable, setting lower pagination defaults would speed up tests.

I also added GitHub actions, for running the tests in PRs and in main, after PRs are merged.
