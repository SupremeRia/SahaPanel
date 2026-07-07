import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"]
  },
  ...next
];

export default eslintConfig;
