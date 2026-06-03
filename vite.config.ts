import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Polyfill for missing virtual module in @tanstack/start-server-core 1.169.3.
// start-server-core dynamically imports `tanstack-start-injected-head-scripts:v`
// in dev SSR, but no plugin in start-plugin-core 1.171.5 provides it,
// breaking dev runs with ERR_MODULE_NOT_FOUND. Resolve it to an empty stub.
function injectedHeadScriptsStub(): Plugin {
  const moduleId = "tanstack-start-injected-head-scripts:v";
  const resolvedId = "\0" + moduleId;
  return {
    name: "lovable:injected-head-scripts-stub",
    enforce: "pre",
    resolveId(id) {
      if (id === moduleId) return resolvedId;
    },
    load(id) {
      if (id === resolvedId) return "export const injectedHeadScripts = undefined;";
    },
  };
}

/**
 * Production-only guard: fail the build if index.html still contains a
 * `/src/index.tsx` script tag. That path is dev-only (Vite serves the
 * uncompiled source); in production it 404s to the SPA fallback HTML and
 * Pi Browser dies with "Failed to load module script ... MIME type
 * 'text/html'". The SSR shell in src/routes/__root.tsx (<Scripts />) is
 * what should inject the hashed compiled bundle.
 */
function forbidDevSrcScriptInIndexHtml(): Plugin {
  return {
    name: "lovable:forbid-dev-src-script-in-index-html",
    apply: "build",
    enforce: "pre",
    transformIndexHtml(html: string) {
      if (/<script\b[^>]*\bsrc=["']\/src\/index\.tsx["'][^>]*>/i.test(html)) {
        throw new Error(
          "[lovable] index.html references /src/index.tsx — that is a Vite dev-only path and breaks production (Pi Browser shows a MIME-type error). Remove the <script type=\"module\" src=\"/src/index.tsx\"> tag; the SSR shell in src/routes/__root.tsx injects the compiled bundle via <Scripts />."
        );
      }
      return html;
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [injectedHeadScriptsStub(), forbidDevSrcScriptInIndexHtml()],
  },
});
