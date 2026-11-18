// Compila design-system/tokens.json (W3C DTCG) para:
//   packages/ui/src/tokens/tokens.css          CSS custom properties
//   packages/ui/src/tokens/tailwind-preset.js  preset Tailwind apontando para as CSS vars
//   packages/ui/src/tokens/tokens.native.ts    tema React Native (números para dimensões)
// Rodar: pnpm dlx style-dictionary build --config design-system/style-dictionary.config.mjs

const CATEGORY_TO_TAILWIND = {
  color: "colors",
  space: "spacing",
  radius: "borderRadius",
  shadow: "boxShadow",
  breakpoint: "screens",
  "font.family": "fontFamily",
  "font.size": "fontSize",
  "font.weight": "fontWeight",
  "font.lineHeight": "lineHeight",
};

function setDeep(obj, keys, value) {
  let o = obj;
  keys.slice(0, -1).forEach((k) => {
    o = o[k] ??= {};
  });
  o[keys[keys.length - 1]] = value;
}

const header = "// Gerado por style-dictionary a partir de design-system/tokens.json. Não edite.\n";

export default {
  source: ["design-system/tokens.json"],
  usesDtcg: true,
  hooks: {
    formats: {
      "tailwind/preset": ({ dictionary }) => {
        const theme = {};
        for (const t of dictionary.allTokens) {
          const two = t.path.slice(0, 2).join(".");
          const key = CATEGORY_TO_TAILWIND[two] ? two : t.path[0];
          const twKey = CATEGORY_TO_TAILWIND[key];
          if (!twKey) continue;
          const rest = t.path.slice(key.split(".").length);
          // breakpoints precisam do valor literal (media query não aceita var())
          const value = twKey === "screens" ? (t.$value ?? t.value) : `var(--${t.name})`;
          setDeep(theme, [twKey, ...(rest.length ? rest : ["DEFAULT"])], value);
        }
        return `${header}/** @type {import('tailwindcss').Config} */\nmodule.exports = { theme: ${JSON.stringify(theme, null, 2)} };\n`;
      },
      "native/theme": ({ dictionary }) => {
        const out = {};
        for (const t of dictionary.allTokens) {
          let v = t.$value ?? t.value;
          if (typeof v === "string" && /^-?\d+(\.\d+)?px$/.test(v)) v = parseFloat(v);
          setDeep(out, t.path, v);
        }
        return `${header}export const tokens = ${JSON.stringify(out, null, 2)} as const;\nexport type Tokens = typeof tokens;\n`;
      },
    },
  },
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "packages/ui/src/tokens/",
      files: [{ destination: "tokens.css", format: "css/variables", options: { outputReferences: true } }],
    },
    tailwind: {
      transformGroup: "css",
      buildPath: "packages/ui/src/tokens/",
      files: [{ destination: "tailwind-preset.js", format: "tailwind/preset" }],
    },
    native: {
      transformGroup: "js",
      buildPath: "packages/ui/src/tokens/",
      files: [{ destination: "tokens.native.ts", format: "native/theme" }],
    },
  },
};
