import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import betterTailwind from "eslint-plugin-better-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";
import process from "node:process";

// The Tailwind rules load the design system in a worker; on a busy machine the
// first load can take longer than the plugin's 30 s default and crash lint.
process.env.SYNCKIT_TIMEOUT ??= "180000";

export default defineConfig(globalIgnores(["dist", "dev-dist"]), {
  files: ["**/*.{js,jsx}"],
  extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  plugins: { "better-tailwindcss": betterTailwind },
  languageOptions: {
    globals: globals.browser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  settings: {
    // Tailwind 4 reads the design system from the CSS entry point.
    "better-tailwindcss": { entryPoint: "src/index.css" },
  },
  rules: {
    // These are DX/fast-refresh hints, not correctness bugs. Keep them visible
    // as warnings (e.g. on-mount data fetch, context+hook in one file) without
    // failing the lint gate.
    "react-hooks/set-state-in-effect": "warn",
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    // Tailwind classes (class/className attributes and cn(...) calls). Errors,
    // so `npm run lint` fails until they're fixed; most fix themselves with
    // `npm run lint:fix` (or ESLint fix-on-save in the editor).
    // e.g. bg-gradient-to-b → bg-linear-to-b, aspect-[2/3] → aspect-2/3
    "better-tailwindcss/enforce-canonical-classes": "error",
    "better-tailwindcss/no-deprecated-classes": "error",
    "better-tailwindcss/no-unknown-classes": "error",
    "better-tailwindcss/no-conflicting-classes": "error",
    "better-tailwindcss/no-duplicate-classes": "error",
    "better-tailwindcss/no-unnecessary-whitespace": "error",
    // left/right → start/end (ml→ms, pr→pe, left-0→start-0, text-left→text-start,
    // rounded-l→rounded-s…), so layouts mirror for Urdu (RTL). Vertical and
    // size classes (mt, top, h, w, size, border-t…) never flip, so they keep
    // their familiar names instead of block-/inline- forms.
    "better-tailwindcss/enforce-logical-properties": [
      "error",
      {
        ignore: [
          "^([\\w-]+:)*-?(m[tb]|p[tb]|top|bottom|h|w|size|min-[hw]|max-[hw]|scroll-[mp][tb]|border-[tb])(-.+)?$",
        ],
      },
    ],
  },
});
