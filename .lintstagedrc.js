// @ts-check

/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,mjs,cjs,ts,mts,cts,md,json}": "prettier --write",
};

export default config;
