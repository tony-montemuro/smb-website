import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/**
 * Browser globals that shadow common variable names, so referencing them bare is
 * almost always an accidentally-undefined variable rather than an intentional
 * `window` lookup. Reach for them explicitly (`window.location`) when you mean them.
 *
 * Verbatim from CRA's `confusing-browser-globals` package, inlined to avoid the
 * dependency: https://github.com/facebook/create-react-app/tree/main/packages/confusing-browser-globals
 */
const confusingBrowserGlobals = [
  "addEventListener", "blur", "close", "closed", "confirm", "defaultStatus",
  "defaultstatus", "event", "external", "find", "focus", "frameElement",
  "frames", "history", "innerHeight", "innerWidth", "length", "location",
  "locationbar", "menubar", "moveBy", "moveTo", "name", "onblur", "onerror",
  "onfocus", "onload", "onresize", "onunload", "open", "opener", "opera",
  "outerHeight", "outerWidth", "pageXOffset", "pageYOffset", "parent", "print",
  "removeEventListener", "resizeBy", "resizeTo", "screen", "screenLeft",
  "screenTop", "screenX", "screenY", "scroll", "scrollbars", "scrollBy",
  "scrollTo", "scrollX", "scrollY", "self", "status", "statusbar", "stop",
  "toolbar", "top"
];

export default defineConfig([
  globalIgnores(["build/", "node_modules/"]),

  {
    name: "client/base",
    files: ["**/*.{js,jsx}"],
    extends: ["js/recommended"],
    plugins: { js },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      /* ===== POSSIBLE PROBLEMS ===== */
      "array-callback-return": "error",
      "no-cond-assign": ["error", "except-parens"],
      "no-loop-func": "error",
      "no-restricted-globals": ["error", ...confusingBrowserGlobals],
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      /*
       * `caughtErrors` defaulted to "none" under ESLint 8, which is what CRA ran on.
       * ESLint 9 flipped the default to "all"; pinning it back keeps unused
       * `catch (error)` bindings quiet, as they were before the migration.
       */
      "no-unused-vars": [
        "error",
        { args: "none", caughtErrors: "none", ignoreRestSiblings: true }
      ],
      "no-use-before-define": [
        "error",
        { functions: false, classes: false, variables: false }
      ],

      /* ===== SUGGESTIONS ===== */
      "default-case": ["error", { commentPattern: "^no default$" }],
      eqeqeq: ["error", "smart"],
      "no-caller": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-extra-label": "error",
      "no-implied-eval": "error",
      "no-iterator": "error",
      "no-label-var": "error",
      "no-labels": ["error", { allowLoop: true, allowSwitch: false }],
      "no-lone-blocks": "error",
      "no-multi-str": "error",
      "no-new-func": "error",
      "no-new-native-nonconstructor": "error",
      "no-new-wrappers": "error",
      "no-object-constructor": "error",
      "no-octal-escape": "error",
      "no-proto": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "require",
          property: "ensure",
          message: "Use a dynamic import() instead."
        },
        {
          object: "System",
          property: "import",
          message: "Use a dynamic import() instead."
        }
      ],
      "no-restricted-syntax": ["error", "WithStatement"],
      "no-script-url": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }
      ],
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-constructor": "error",
      "no-useless-rename": "error",
      strict: ["error", "never"],
      "unicode-bom": ["error", "never"]
    }
  },

  {
    name: "client/react",
    files: ["**/*.{js,jsx}"],
    extends: [reactPlugin.configs.flat.recommended],
    plugins: { "react-hooks": reactHooksPlugin },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      /* The new JSX transform makes these obsolete. */
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      /* Not used by this project; PropTypes were never adopted here. */
      "react/prop-types": "off",

      "react/forbid-foreign-prop-types": ["error", { allowInPropTypes: true }],
      "react/jsx-pascal-case": ["error", { allowAllCaps: true, ignore: [] }],
      "react/no-typos": "error",
      "react/style-prop-object": "error",

      /*
       * CRA shipped exactly these two hooks rules. eslint-plugin-react-hooks v7's
       * `recommended` preset additionally enables the React Compiler rule set
       * (immutability, purity, set-state-in-effect, ...), which is well beyond
       * CRA parity. Worth revisiting deliberately later.
       */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error"
    }
  }
]);
