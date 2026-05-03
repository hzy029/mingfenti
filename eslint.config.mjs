import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript];

const config = [
  {
    ignores: [
      "**/.next/**",
      "**/.open-next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/out/**",
      "**/.wrangler/**"
    ]
  },
  ...eslintConfig
];

export default config;
