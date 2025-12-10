To separate Storybook for stories only and Vitest for component testing with testing-library:

1. Remove "@storybook/addon-vitest" from .storybook/main.ts addons
2. Add "test": "vitest" script to package.json
3. Optionally remove .storybook/vitest.setup.ts as it's no longer needed

Vitest is already configured with testing-library (@testing-library/svelte installed) and browser testing with Playwright.
