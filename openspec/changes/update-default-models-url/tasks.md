## 1. Define the default URL constant

- [x] 1.1 Add `DEFAULT_MODELS_URL` constant at the module level in `packages/core/src/models-dev.ts` with value `"https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download"`

## 2. Replace hardcoded default URL references

- [x] 2.1 Replace the hardcoded `"https://models.dev"` string in the source fallback expression with `DEFAULT_MODELS_URL`
- [x] 2.2 Replace the hardcoded `"https://models.dev"` string in the cache file name comparison with `DEFAULT_MODELS_URL`

## 3. Verify and test

- [x] 3.1 Run `bun typecheck` from `packages/core` to verify type correctness
- [x] 3.2 Run relevant tests from `packages/opencode` to confirm model fetching still works
